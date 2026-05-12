// Disables access to DOM typings like `HTMLElement` which are not available
// inside a service worker and instantiates the correct globals
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

// Ensures that the `$service-worker` import has proper type definitions
/// <reference types="@sveltejs/kit" />

// Only necessary if you have an import from `$env/static/public`
/// <reference types="../.svelte-kit/ambient.d.ts" />

import { build, files, version } from '$service-worker';
import { initializeApp } from 'firebase/app';
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw';
import {
	PUBLIC_FIREBASE_API_KEY,
	PUBLIC_FIREBASE_AUTH_DOMAIN,
	PUBLIC_FIREBASE_APP_ID,
	PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	PUBLIC_FIREBASE_PROJECT_ID,
	PUBLIC_FIREBASE_STORAGE_BUCKET
} from '$env/static/public';

// This gives `self` the correct types
const self = globalThis.self as unknown as ServiceWorkerGlobalScope;

const firebaseApp = initializeApp({
	apiKey: PUBLIC_FIREBASE_API_KEY,
	authDomain: PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: PUBLIC_FIREBASE_APP_ID
});

const messaging = getMessaging(firebaseApp);

onBackgroundMessage(messaging, (payload) => {
	self.registration.showNotification(payload.data?.title ?? 'GoReach', {
		body: payload.data?.body ?? 'Time to update your progress.',
		icon: '/GoReach/favicon.png',
		badge: '/GoReach/favicon.png',
		data: {
			url: payload.data?.url ?? '/GoReach/'
		}
	});
});

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`;

const ASSETS = [
	...build, // the app itself
	...files // everything in `static`
];

self.addEventListener('install', (event) => {
	// Create a new cache and add all files to it
	async function addFilesToCache() {
		const cache = await caches.open(CACHE);
		await cache.addAll(ASSETS);
	}

	event.waitUntil(addFilesToCache());
});

self.addEventListener('activate', (event) => {
	// Remove previous cached data from disk
	async function deleteOldCaches() {
		for (const key of await caches.keys()) {
			if (key !== CACHE) await caches.delete(key);
		}
	}

	event.waitUntil(deleteOldCaches());
});

self.addEventListener('fetch', (event) => {
	// ignore POST requests etc
	if (event.request.method !== 'GET') return;

	async function respond() {
		const url = new URL(event.request.url);
		const cache = await caches.open(CACHE);

		// `build`/`files` can always be served from the cache
		if (ASSETS.includes(url.pathname)) {
			const response = await cache.match(url.pathname);

			if (response) {
				return response;
			}
		}

		// for everything else, try the network first, but
		// fall back to the cache if we're offline
		try {
			const response = await fetch(event.request);

			// if we're offline, fetch can return a value that is not a Response
			// instead of throwing - and we can't pass this non-Response to respondWith
			if (!(response instanceof Response)) {
				throw new Error('invalid response from fetch');
			}

			if (response.status === 200 && !response.headers.get('cache-control')?.includes('no-store')) {
				cache.put(event.request, response.clone());
			}

			return response;
		} catch (err) {
			const response = await cache.match(event.request);

			if (response) {
				return response;
			}

			// if there's no cache, then just error out
			// as there is nothing we can do to respond to this request
			throw err;
		}
	}

	event.respondWith(respond());
});

self.addEventListener('notificationclick', (event) => {
	event.notification.close();

	const targetUrl = event.notification.data?.url ?? '/GoReach/';

	event.waitUntil(
		self.clients
			.matchAll({ type: 'window', includeUncontrolled: true })
			.then((windowClients: readonly WindowClient[]) => {
				for (const client of windowClients) {
					if ('focus' in client) {
						return client.focus();
					}
				}

				if (self.clients.openWindow) {
					return self.clients.openWindow(targetUrl);
				}

				return undefined;
			})
	);
});
