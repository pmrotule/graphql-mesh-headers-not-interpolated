# graphql-mesh-headers-not-interpolated

GraphQL Mesh: Issue reproduction for the operation headers not being interpolated when req.headers is a SymbolMap

## Getting started

1. Install dependencies: `yarn install`
1. Run the server: `yarn start`
1. Visit http://localhost:4000 and execute a query:

```gql
# Taken from https://rickandmortyapi.com/documentation/

query {
  characters(page: 2, filter: { name: "rick" }) {
    info {
      count
    }
    results {
      name
    }
  }
  location(id: 1) {
    id
  }
  episodesByIds(ids: [1, 2]) {
    id
  }
}
```
