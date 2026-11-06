# vue-router-parent-children

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Build and Serve a Single Module or the Whole App

Each mode is built into its own folder, so the builds can coexist. Build first, then serve; the serve scripts never rebuild.

| Mode | Build | Serve | Output |
| --- | --- | --- | --- |
| Whole app (`/stock`, `/refill`) | `npm run build` | `npm run serve` | `dist/default` |
| Refill only (at `/`) | `npm run build:refill` | `npm run serve:refill` | `dist/refill` |
| Stock only (at `/`) | `npm run build:stock` | `npm run serve:stock` | `dist/stock` |

A serve script fails with a message if the build of its mode is missing. `npm run preview` is an alias of `npm run serve`.

### Deploy with Docker

The mode is fixed when the image is built, through the `VITE_APP_MODULE` build argument. Leave it empty for the whole app, or pass the name of a folder in `src/modules/`. Any other value fails the build.

```sh
docker build -t app .                                      # whole app
docker build --build-arg VITE_APP_MODULE=refill -t app:refill .
docker build --build-arg VITE_APP_MODULE=stock -t app:stock .

docker run --rm -p 3000:3000 app:refill                    # PORT overrides 3000
```

A Fastify server serves the build and falls back to `index.html` for client-side routes; missing assets return 404. A new module is accepted by the build as soon as its `src/modules/<module>/` folder exists; it must also be added to `env.d.ts` and to the router in `src/router/index.ts`.

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
