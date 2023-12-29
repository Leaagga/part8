import { gql } from '@apollo/client'
const BOOK_DETAILS = gql`
  fragment BookDetails on Book {
    title
    published
    author {
      name
      born
      id
    }
    id
    genres
  }
`
export const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      bookCount
      id
      born
    }
  }
`
export const ALL_GENRES = gql`
  query {
    bookGenres
  }
`
export const ALL_BOOKS = gql`
  query allBooks($genre: String) {
    allBooks(genre: $genre) {
      ...BookDetails
    }
  }
  ${BOOK_DETAILS}
`
export const CREATE_BOOK = gql`
  mutation createBook(
    $title: String!
    $author: String!
    $published: Int!
    $genres: [String!]
  ) {
    addBook(
      title: $title
      author: $author
      published: $published
      genres: $genres
    ) {
      ...BookDetails
    }
  }
  ${BOOK_DETAILS}
`
export const SET_BIRTHYEAR = gql`
  mutation setBrithyear($author: String!, $born: Int!) {
    editAuthor(name: $author, setBornTo: $born) {
      name
      born
    }
  }
`
export const LOG_IN = gql`
  mutation LogIn($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`
export const GET_USER = gql`
  query {
    me {
      username
      favoriteGenre
      id
    }
  }
`
export const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      ...BookDetails
    }
  }
  ${BOOK_DETAILS}
`
