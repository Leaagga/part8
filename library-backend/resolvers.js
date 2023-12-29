const { GraphQLError, subscribe } = require('graphql')
const jwt = require('jsonwebtoken')
const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()
const Author = require('./models/library-author-schema')
const Book = require('./models/library-book-schema')
const User = require('./models/library-user-schema')
require('dotenv').config()
const secret = process.env.SECERT
const resolvers = {
  Query: {
    me: (root, arg, context) => {
      console.log(context.currentUser)
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
      const count = root.bookOf.length
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
      pubsub.publish('BOOK_ADDED', { bookAdded: response })
      await Author.findByIdAndUpdate(author.id, {
        bookOf: author.bookof.concat(response.id),
      })
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
    updateBookCount: async () => {
      const authors = await Author.find({})
      const books = await Book.find({})
      authors.forEach(async (author) => {
        let bookOf = books.filter((b) => b.author == author.id).map((b) => b.id)
        const response = await Author.findByIdAndUpdate(
          author.id,
          { bookOf: bookOf },
          { new: true }
        )
        console.log(response)
      })
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator('BOOK_ADDED'),
    },
  },
}
module.exports = resolvers
