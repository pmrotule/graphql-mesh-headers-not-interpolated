# graphql-mesh-headers-not-interpolated

GraphQL Mesh: Issue reproduction for the operation headers not being interpolated when req.headers is a Map

## Getting started

- Install dependencies with `yarn install`
- Start the services then the gateway with `yarn start`
- Open the Apollo Sandbox at http://localhost:4000 and execute a query:

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
}
```

## Issue reproduction

### Instructions

- Open the Apollo Sandbox at http://localhost:4000 and enter a query depending on headers:

```gql
query {
  me {
    id
    name
    email
  }
}
```

- Click on the "Headers" tab to add the `access-token` header which is also passed in the `operationHeaders` mesh config:

| Key          | Value |
| ------------ | ----- |
| access-token | 456   |

- Run the query in the Apollo Sandbox
- ⚠️ `data.me` is `null` in the response while it should return the user object because we passed the correct `access-token` header

### Using a debugger

- Open the Node.js DevTools
  - Visit `chrome://inspect` on Chrome
  - Click on the hyperlink "Open dedicated DevTools for Node"
  - In Node.js DevTools, go to the "Connection" tab and add one for `localhost:8123`
- Add a `debugger` statement right before `return headers;` at the end of this file:
  `node_modules/@graphql-mesh/string-interpolation/dist/cjs/resolver-data-factory.js`
- Start the server with `node --inspect=8123 server` (change the start script of the gateway)
- Run the query in the Apollo Sandbox
- You should see the `headers` being returned and used as `operationHeaders`: the `access-token` should be empty

<img width="1406" alt="Screenshot 2023-03-15 at 14 21 22" src="https://user-images.githubusercontent.com/10983258/225322335-bc08be6e-af14-424e-a109-e162b41ac806.png">

## How to fix

🚀 Run it by checking out the [`fixed` branch](https://github.com/pmrotule/graphql-mesh-headers-not-interpolated/tree/fixed)

We can simply allow the `operationHeaders` mesh config to be a function to use as a hook. This way, we trust Javascript to interprete the code instead of adding extra string interpolation based on regular expressions.

```js
operationHeaders: ({ context }) => ({
  'access-token': context.req.headers.get('access-token'),
}),
```
