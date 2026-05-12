import { browser } from '$app/environment';
import { base } from '$app/paths';
import { PUBLIC_FIREBASE_VAPID_KEY } from '$env/static/public';
import { db, getMessagingIfSupported } from '$lib/firebase';
import { arrayUnion, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { getToken } from 'firebase/messaging';

export async function EnableNotifications(userId: string) {
	const permission = await Notification.requestPermission();

	if (permission !== 'granted') {
		throw new Error('Notifications not granted');
	}

	const messaging = await getMessagingIfSupported();

	if (!messaging) {
		throw new Error('Firebase Messaging is not supported on this device/browser');
	}

	const serviceWorkerRegistration =
		(await navigator.serviceWorker.getRegistration(`${base || ''}/service-worker.js`)) ??
		(await navigator.serviceWorker.ready);

	const token = await getToken(messaging, {
		vapidKey: PUBLIC_FIREBASE_VAPID_KEY,
		serviceWorkerRegistration
	});

	await setDoc(
		doc(db, 'users', userId),
		{
			fcmTokens: arrayUnion(token),
			lastTokenUpdateAt: serverTimestamp()
		},
		{ merge: true }
	);

	return token;
}

export const SaveNotificationToken = (token: string) => {
	if (!browser) {
		console.error('Cannot save notification token in a non-browser environment.');
		return;
	}

	localStorage.setItem('notificationToken', token);
};

export const RemoveNotificationToken = async (userId: string, token: string) => {
	if (!browser) {
		console.error('Cannot remove notification token in a non-browser environment.');
		return;
	}

	await setDoc(
		doc(db, 'users', userId),
		{
			fcmTokens: arrayUnion(token),
			lastTokenUpdateAt: serverTimestamp()
		},
		{ merge: true }
	);

	localStorage.removeItem('notificationToken');
};

export const GetNotificationToken = (): string | null => {
	if (!browser) {
		console.error('Cannot get notification token in a non-browser environment.');
		return null;
	}

	return localStorage.getItem('notificationToken');
};
