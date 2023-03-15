import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'

const SERVER_PORT = 4008
const USER_ACCESS_TOKEN = '456'

const typeDefs = `#graphql
  type Query {
    me: User
  }

  type User {
    id: ID!
    name: String
    email: String
  }
`

const resolvers = {
  Query: {
    me(_root, _args, context) {
      return context.user
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

const { url } = await startStandaloneServer(server, {
  listen: { port: SERVER_PORT },
  context: async ({ req }) => {
    return req.headers['access-token'] === USER_ACCESS_TOKEN
      ? {
          user: {
            id: 5142,
            name: 'James Brown',
            email: 'james@brown.com',
          },
        }
      : null
  },
})

console.log(`🚀 Account API ready at ${url}`)
