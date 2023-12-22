const { ApolloServer } = require('@apollo/server')
const { GraphQLError } = require('graphql')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { v1: uuid } = require('uuid')
const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
const Author = require('./library-author-schema')
const Book = require('./library-book-schema')
const User = require('./library-user-schema')
require('dotenv').config()
const bcrypt = require('bcrypt')
const saltRounds = 10
var jwt = require('jsonwebtoken')
const secret = process.env.SECERT
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
//     title: 'Refactoring to patterns',
//     published: 2008,
//     author: 'Joshua Kerievsky',
//     id: 'afa5de01-344d-11e9-a414-719c6709cf3e',
//     genres: ['refactoring', 'patterns'],
//   }
// ]

/*
  you can remove the placeholder query once your first one has been implemented 
*/

const typeDefs = `
type User{
  username:String!
  favoriteGenre:String!
  id:ID!
}
type Token{
  value:String!
}
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
    me:User
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
    createUser(
      username: String!
      favoriteGenre: String!
  ): User
    login(
      username: String!
      password: String!
  ): Token
  }
`

const resolvers = {
  Query: {
    me: (root, arg, context) => {
      return context.currentUser
    },
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, arg) => {
      let result = await Book.find({}).populate('author')
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
      let book = await Book.find({}).populate('author')

      const count = book.filter((b) => b.author.name == root.name).length
      return count
    },
  },
  Mutation: {
    addBook: async (root, arg, context) => {
      if (!context.currentUser) {
        throw new GraphQLError('Invalid argument value', {
          extensions: {
            code: 'BAD_USER_INPUT',
            argumentName: 'token',
          },
        })
      }
      if (arg.title < 5 || arg.author < 4) {
        throw new GraphQLError('Invalid argument value', {
          extensions: {
            code: 'BAD_USER_INPUT',
            argumentName: 'title or author',
          },
        })
      }
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
    editAuthor: async (root, arg, context) => {
      if (!context.currentUser) {
        throw new GraphQLError('Invalid argument value', {
          extensions: {
            code: 'BAD_USER_INPUT',
            argumentName: 'token',
          },
        })
      }
      let author = await Author.find({})
      author = author.find((a) => a.name == arg.name)
      if (!author) {
        return null
      }
      console.log(author)
      const newAuthor = await Author.findByIdAndUpdate(
        author.id,
        { born: arg.setBornTo },
        { new: true }
      )
      return newAuthor
    },
    createUser: async (root, arg) => {
      const user = new User({
        username: arg.username,
        favoriteGenre: arg.favoriteGenre,
      })
      try {
        const savedUser = await user.save()
        return savedUser
      } catch {
        throw new GraphQLError('Invalid argument value', {
          extensions: {
            code: 'BAD_USER_INPUT',
            argumentName: 'username',
          },
        })
      }
    },
    login: async (root, arg) => {
      const user = await User.findOne({ username: arg.username })
      console.log(user)
      if (!(user && arg.password == 'secret')) {
        throw new GraphQLError('Invalid argument value', {
          extensions: {
            code: 'BAD_USER_INPUT',
            argumentName: 'username or password',
          },
        })
      }
      const usedForToken = { username: user.username, id: user.id }
      console.log(usedForToken)
      const token = jwt.sign(usedForToken, secret)
      console.log(token)
      return { value: token }
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req, res }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.startsWith('Bearer ')) {
      const decodedToken = jwt.verify(auth.substring(7), secret)
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
