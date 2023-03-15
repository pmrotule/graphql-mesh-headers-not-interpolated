module.exports = {
  sources: [
    {
      name: 'Account API',
      handler: {
        graphql: {
          endpoint: 'http://localhost:4008',
          operationHeaders: ({ context }) => ({
            'access-token': context.req.headers.get('access-token'),
          }),
        },
      },
    },
    {
      name: 'Rick and Morty API',
      handler: {
        graphql: {
          endpoint: 'https://rickandmortyapi.com/graphql',
        },
      },
    },
  ],
}
