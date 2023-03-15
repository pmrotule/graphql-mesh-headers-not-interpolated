# graphql-mesh-headers-not-interpolated

GraphQL Mesh: Issue reproduction for the operation headers not being interpolated when req.headers is a SymbolMap

## Getting started

- Install dependencies: `yarn install`
- Run the server: `yarn start`
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

Unfortunately, the Rick and Morty API doesn't have queries that depend on http headers so we'll need to add a `debugger` in `node_modules/@graphql-mesh/string-interpolation`.

### Instructions

- Open the Apollo Sandbox at http://localhost:4000 and reuse the query mentioned above
- Click on the "Headers" tab to add the `access-token` header which is also passed in the `operationHeaders` mesh config:

| Key          | Value  |
| ------------ | ------ |
| access-token | foobar |

- Open the Node.js DevTools
  - Visit `chrome://inspect` on Chrome
  - Click on the hyperlink "Open dedicated DevTools for Node"
  - In Node.js DevTools, go to the "Connection" tab and add one for `localhost:8123`
- Add a `debugger` statement right before `return headers;` at the end of this file:
  `node_modules/@graphql-mesh/string-interpolation/dist/cjs/resolver-data-factory.js`
- Start the server with `node --inspect=8123 server`
- Run the query in the Apollo Sandbox
- You should see the `headers` being returned and used as `operationHeaders`: the `access-token` should be empty

<img width="1406" alt="Screenshot 2023-03-15 at 14 21 22" src="https://user-images.githubusercontent.com/10983258/225322335-bc08be6e-af14-424e-a109-e162b41ac806.png">

## How to fix

### The workaround

🚀 Run it by checking out the [`workaround` branch](https://github.com/pmrotule/graphql-mesh-headers-not-interpolated/tree/workaround)

Using `"{context.req.headers.get('access-token')}"` instead of `"{context.req.headers['access-token']}"` doesn't fix the issue because of the way graph-mesh is interpolating the string value: it only allows to access the property of an object as the last bit of the interpolated string (see [here](https://github.com/Urigo/graphql-mesh/blob/5740afc436a54a7948fb4d4392d126e4ef34c07f/packages/string-interpolation/src/interpolator.js#L150)).

We were able to work around the issue by creating a new object with one property and access it right away:

```js
"{({ x: context.req.headers.get('access-token') }).x}"
```

### The proper fix

🚀 Run it by checking out the [`fixed` branch](https://github.com/pmrotule/graphql-mesh-headers-not-interpolated/tree/fixed)

We can simply allow the `operationHeaders` mesh config to be a function to use as a hook. This way, we trust Javascript to interprete the code instead of adding extra string interpolation based on regular expressions.

```js
operationHeaders: ({ context }) => ({
  'access-token': context.req.headers.get('access-token'),
}),
```
