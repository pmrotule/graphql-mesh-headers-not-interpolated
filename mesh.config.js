module.exports = {
  sources: [
    {
      name: 'Rick and Morty API',
      handler: {
        graphql: {
          endpoint: 'https://rickandmortyapi.com/graphql',
          operationHeaders: {
            'access-token': "{({ x: context.req.headers.get('access-token') }).x}",
          },
        },
      },
    },
  ],
}
