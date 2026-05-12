# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
npx sv@0.15.3 create --template minimal --types ts --add prettier eslint tailwindcss="plugins:typography,forms" sveltekit-adapter="adapter:static" --install npm ./
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Firebase Scheduled Notifications

The frontend stays a static SvelteKit build on GitHub Pages. Scheduled notification delivery lives in the separate Firebase Functions worker under `functions/`, which reads and updates the shared Firestore `users` documents and sends FCM push notifications only.

From the `functions/` folder:

```sh
npx firebase-tools login
npm run build
npm run deploy
```

Run the login step once before the first deploy. If you see `Failed to authenticate, have you run firebase login?`, it means the Firebase CLI is not signed in yet.

Or deploy just the worker from the repository root:

```sh
firebase deploy --only functions
```
