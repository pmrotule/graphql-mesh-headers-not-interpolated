const { findAndParseConfig } = require('@graphql-mesh/cli')
const { getMesh } = require('@graphql-mesh/runtime')
const { ApolloServer } = require('@apollo/server')
const { expressMiddleware } = require('@apollo/server/express4')
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer')
const express = require('express')
const http = require('http')
const cors = require('cors')
const { json } = require('body-parser')

const SERVER_HOST = '0.0.0.0'
const SERVER_PORT = 4000
const SERVER_PATH = '/'

const app = express()
const httpServer = http.createServer(app)

async function buildMesh(configOptions) {
  const meshConfig = await findAndParseConfig(configOptions)
  const mesh = await getMesh(meshConfig)
  return mesh
}

async function buildServer(schema, options) {
  const { getEnveloped } = options
  const apolloServer = new ApolloServer({
    schema,
    gateway: {
      async load() {
        return {
          executor: async requestContext => {
            const { schema, execute, contextFactory } = getEnveloped({
              req: requestContext.request.http,
            })

            return execute({
              schema: schema,
              document: requestContext.document,
              contextValue: await contextFactory(),
              variableValues: requestContext.request.variables,
              operationName: requestContext.operationName,
            })
          },
        }
      },
      onSchemaLoadOrUpdate(callback) {
        callback({ apiSchema: schema })
        return () => {}
      },
      async stop() {},
    },
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  })

  return apolloServer
}

async function startServer(schema, { getEnveloped }) {
  const apolloServer = await buildServer(schema, { getEnveloped })
  await apolloServer.start()

  httpServer.listen({ host: SERVER_HOST, port: SERVER_PORT })

  await new Promise(resolve => httpServer.listen({ host: SERVER_HOST, port: SERVER_PORT }, resolve))
  console.log(`🚀 Server ready at http://${SERVER_HOST}:${SERVER_PORT}${SERVER_PATH}`)

  return apolloServer
}

async function run() {
  const { schema, getEnveloped } = await buildMesh()

  const server = await startServer(schema, { getEnveloped })
  app.use(
    '/',
    cors(),
    json(),
    expressMiddleware(server, {
      context: async ({ req }) => ({ token: req.headers.token }),
    })
  )
}

run().catch(err => console.error(err))
