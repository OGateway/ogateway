# og-collect

Monorepo for the `ogateway` npm package: a drop-in React component + hook for
collecting mobile money payments without merchants building their own
integration against og-api.

```
packages/ogateway   -> the published package (npm install ogateway)
examples/basic      -> a Vite app that consumes the package locally
```

## Known limitation (read before wiring this to a real key)

This POC authenticates requests with the plain `test_key`/`live_key` from
og-api's Keys model, sent as-is in the `Authorization` header — the same
credential og-api's `DevGuard` checks today. That key is currently
full-privilege (it can also do refunds/other operations), so it is **not
actually safe to ship to production embedded in a browser bundle** until
og-api gets a scoped, browser-safe publishable key (`pk_test_*`/`pk_live_*`)
restricted to just collection-initiation + status routes. Treat this package
as a frontend POC to validate the DX, not something to point at a real
`live_key` on a public site yet.

## Develop

```bash
yarn install
yarn dev       # watch-build the ogateway package
yarn example   # run the example app (separate terminal)
```

The example app needs a `.env.local` in `examples/basic` (see `.env.example`)
with a test key and your local og-api URL.
