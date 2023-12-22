import { gql } from '@apollo/client'
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
export const ALL_BOOKS = gql`
  query {
    allBooks {
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
  }
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
      title
      published
      author
      id
      genres
    }
  }
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
