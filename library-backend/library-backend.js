const { ApolloServer } = require('@apollo/server')

const { startStandaloneServer } = require('@apollo/server/standalone')
const { v1: uuid } = require('uuid')
const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
const Author = require('./library-author-schema')
const Book = require('./library-book-schema')
require('dotenv').config()

const MONGODB_URI = process.env.MONGODB_URI

console.log('connecting to', MONGODB_URI)

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

// let authors = [
//   {
//     name: 'Robert Martin',
//     id: 'afa51ab0-344d-11e9-a414-719c6709cf3e',
//     born: 1952,
//   },
//   {
//     name: 'Martin Fowler',
//     id: 'afa5b6f0-344d-11e9-a414-719c6709cf3e',
//     born: 1963,
//   },
//   {
//     name: 'Fyodor Dostoevsky',
//     id: 'afa5b6f1-344d-11e9-a414-719c6709cf3e',
//     born: 1821,
//   },
//   {
//     name: 'Joshua Kerievsky', // birthyear not known
//     id: 'afa5b6f2-344d-11e9-a414-719c6709cf3e',
//   },
//   {
//     name: 'Sandi Metz', // birthyear not known
//     id: 'afa5b6f3-344d-11e9-a414-719c6709cf3e',
//   },
// ]

// /*
//  * Suomi:
//  * Saattaisi olla järkevämpää assosioida kirja ja sen tekijä tallettamalla kirjan yhteyteen tekijän nimen sijaan tekijän id
//  * Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen
//  *
//  * English:
//  * It might make more sense to associate a book with its author by storing the author's id in the context of the book instead of the author's name
//  * However, for simplicity, we will store the author's name in connection with the book
//  *
//  * Spanish:
//  * Podría tener más sentido asociar un libro con su autor almacenando la id del autor en el contexto del libro en lugar del nombre del autor
//  * Sin embargo, por simplicidad, almacenaremos el nombre del autor en conección con el libro
//  */

// let books = [
//   {
//     title: 'Clean Code',
//     published: 2008,
//     author: 'Robert Martin',
//     id: 'afa5b6f4-344d-11e9-a414-719c6709cf3e',
//     genres: ['refactoring'],
//   },
//   {
//     title: 'Agile software development',
//     published: 2002,
//     author: 'Robert Martin',
//     id: 'afa5b6f5-344d-11e9-a414-719c6709cf3e',
//     genres: ['agile', 'patterns', 'design'],
//   },
//   {
//     title: 'Refactoring, edition 2',
//     published: 2018,
//     author: 'Martin Fowler',
//     id: 'afa5de00-344d-11e9-a414-719c6709cf3e',
//     genres: ['refactoring'],
//   },
//   {
//     title: 'Refactoring to patterns',
//     published: 2008,
//     author: 'Joshua Kerievsky',
//     id: 'afa5de01-344d-11e9-a414-719c6709cf3e',
//     genres: ['refactoring', 'patterns'],
//   },
//   {
//     title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
//     published: 2012,
//     author: 'Sandi Metz',
//     id: 'afa5de02-344d-11e9-a414-719c6709cf3e',
//     genres: ['refactoring', 'design'],
//   },
//   {

//   },
//   {
//     title: 'The Demon ',
//     published: 1872,
//     author: 'Fyodor Dostoevsky',
//     id: 'afa5de04-344d-11e9-a414-719c6709cf3e',
//     genres: ['classic', 'revolution'],
//   },
// ]

/*
  you can remove the placeholder query once your first one has been implemented 
*/

const typeDefs = `
  type Book {
    title: String!
    published: Int!
    author: Author!
    id: ID!
    genres: [String]
  }
  type Author {
    name: String!
    bookCount: Int!
    id: ID!
    born: Int
  }
  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book]
    allAuthors: [Author]
  }
  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]
    ): Book
    editAuthor(name: String!, setBornTo: Int!): Author
  }
`

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, arg) => {
      let result = await Book.find({}).populate('Author')
      result = arg.author
        ? result.filter((b) => b.author.name == arg.author)
        : result
      result = arg.genre
        ? result.filter((b) => b.genres.includes(arg.genre))
        : result
      return result
    },
    allAuthors: async () => {
      const response = await Author.find({})
      return response
    },
  },
  Author: {
    bookCount: async (root, arg) => {
      let book = await Book.find({})
      const count = await book
        .populate('author')
        .filter((b) => b.author.name == root.name).length
      return count
    },
  },
  Mutation: {
    addBook: async (root, arg) => {
      let author = await Author.find({})
      console.log('1', author)
      if (!author.find((a) => a.name == arg.author)) {
        const author = new Author({ name: arg.author })
        await author.save()
      }
      author = await Author.find({})
      console.log('2', author)
      author = author.find((a) => a.name == arg.author)
      console.log('3', author)
      console.log(arg.title, arg.published, arg.genres, author.id)
      const book = new Book({
        title: arg.title,
        published: arg.published,
        genres: arg.genres,
        author: author.id,
      })
      console.log('4', book)
      let response = await book.save()
      console.log('5', response)
      response = await response.populate('author')
      console.log('6', response)
      return response
    },
    editAuthor: async (root, arg) => {
      let author = await Author.find({})
      author = author.find((a) => a.name == arg.name)
      if (!author) {
        return null
      }

      const newAuthor = await Author.findByIdAndUpdate(
        { id: author.id },
        { born: arg.setBornTo },
        { new: true }
      )
      return newAuthor
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
