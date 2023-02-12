const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    _id:ID
    username: String
    email: String
    password: String
    bookCount: Int
    savedBooks: [Book]
  }

  type Book {
    _id: ID
    authors: [String]
    description: String
    bookId: String
    image: String
    link: String
    title: String
  }

  type Query {
    getSingleUser(id: ID, username: String): User

  }
  type Auth:  {
    token: ID!
    user: User
  }

  input SavedBookInput {
  authors: [String]
  description: String
  title: String
  bookID: String
  image: String
  link: String
  

  }

  type Mutation: {
    login(email: String!, password: String!): Auth
    addUser( username: String!, email: String!, password: String!): Auth
    saveBook(book: SavedBookInput): user
    removeBook(bookId: String!): User
  }
 
`;

module.exports = typeDefs;