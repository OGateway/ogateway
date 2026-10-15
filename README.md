# og-collect

Monorepo for the `ogateway` npm package: a drop-in React component + hook for
collecting mobile money payments without merchants building their own
backend integration.

```
packages/ogateway   -> the published package (npm install ogateway) — see its own README for full docs
examples/basic      -> a styled Vite app that consumes the package locally
```

Full usage docs, the props table, theming notes, and the request-scoping
model live in [packages/ogateway/README.md](packages/ogateway/README.md) —
that's what ships to npm and what the package's own consumers see.

## Develop

```bash
yarn install
yarn dev       # watch-build the ogateway package (JS + types; re-run `yarn workspace ogateway run build:css` after editing src/styles.css)
yarn example   # run the example app (separate terminal)
```

The example app needs a `.env.local` in `examples/basic` (see `.env.example`)
with a publishable key and an API base URL to test against.
