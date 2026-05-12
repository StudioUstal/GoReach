/*
 * GitHub Pages hosts the static SvelteKit PWA only.
 * Firebase Functions runs only this scheduled notification worker.
 * Firestore remains the shared data store between the web app and the worker.
 * FCM is used only for push notification delivery.
 */

import { initializeApp } from 'firebase-admin/app';
import {
	getFirestore,
	Timestamp,
	type DocumentData,
	type QueryDocumentSnapshot
} from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import { logger } from 'firebase-functions';
import { onSchedule } from 'firebase-functions/v2/scheduler';

initializeApp();

const db = getFirestore();
const messaging = getMessaging();

const DEFAULT_TIME_ZONE = 'Europe/Prague';
const REMINDER_LINK = 'https://studioustal.github.io/GoReach/';
const MAX_USERS_PER_RUN = 100;
const MAX_TOKENS_PER_MESSAGE = 500;
const INVALID_TOKEN_ERROR_CODES = new Set([
	'messaging/registration-token-not-registered',
	'messaging/invalid-registration-token',
	'messaging/invalid-argument'
]);

type ReminderGoal = {
	id: string;
	title: string;
	time?: string;
	enabled?: boolean;
	lastReminderSentAt?: Timestamp | null;
};

type ReminderUser = {
	goals?: ReminderGoal[];
	fcmTokens?: string[];
	timezone?: string;
};

type ZonedDateParts = {
	dateKey: string;
	hour: number;
	minute: number;
};

type ChunkSendResult = {
	successCount: number;
	invalidTokens: Set<string>;
};

export const sendScheduledGoalReminders = onSchedule(
	{
		schedule: 'every 5 minutes',
		timeZone: DEFAULT_TIME_ZONE,
		region: 'europe-west1'
	},
	async () => {
		const usersSnapshot = await db.collection('users').limit(MAX_USERS_PER_RUN).get();

		let processedUsers = 0;
		let notifiedGoals = 0;

		for (const userDoc of usersSnapshot.docs) {
			processedUsers += 1;

			try {
				const result = await processUserReminders(userDoc);
				notifiedGoals += result.notifiedGoals;
			} catch (error) {
				logger.error('Failed to process scheduled reminders for a user document', {
					userId: userDoc.id,
					error: serializeError(error)
				});
			}
		}

		logger.info('Scheduled reminder run completed', {
			processedUsers,
			notifiedGoals
		});
	}
);

async function processUserReminders(userDoc: QueryDocumentSnapshot<DocumentData>) {
	const userData = userDoc.data() as ReminderUser;
	const rawTokens = Array.isArray(userData.fcmTokens) ? userData.fcmTokens : [];
	const tokens = [
		...new Set(
			rawTokens.filter((token): token is string => typeof token === 'string' && token.length > 0)
		)
	];

	if (tokens.length === 0) {
		return { notifiedGoals: 0 };
	}

	// Goals are stored as a subcollection `goals` under each user document
	const goalsSnapshot = await userDoc.ref.collection('goals').get();
	const goals: ReminderGoal[] = goalsSnapshot.docs.map((d) => {
		const data = d.data();
		return {
			id: d.id,
			title: String(`${data.icon as string} ${data.name as string}`),
			time: (data.time as string) ?? undefined,
			enabled: typeof data.enabled === 'boolean' ? (data.enabled as boolean) : undefined,
			lastReminderSentAt: (data.lastReminderSentAt as Timestamp) ?? null
		} as ReminderGoal;
	});
	if (goals.length === 0) {
		return { notifiedGoals: 0 };
	}

	const timeZone = resolveTimeZone(userData.timezone);
	const now = new Date();
	const currentParts = getZonedDateParts(now, timeZone);
	const todayKey = currentParts.dateKey;
	const goalsToMarkSent = new Set<string>();
	const tokensToRemove = new Set<string>();
	let activeTokens = tokens;

	for (const goal of goals) {
		// Skip if already processed in this run (prevents duplicates)
		if (goalsToMarkSent.has(goal.id)) {
			continue;
		}

		if (goal.enabled === false) {
			continue;
		}

		if (!goal.time || !isValidReminderTime(goal.time)) {
			continue;
		}

		if (isSentToday(goal.lastReminderSentAt, todayKey, timeZone)) {
			continue;
		}

		if (!isReminderDue(goal.time, currentParts)) {
			continue;
		}

		if (activeTokens.length === 0) {
			break;
		}

		const sendResult = await sendReminderToTokens(activeTokens, goal.title);
		sendResult.invalidTokens.forEach((token) => tokensToRemove.add(token));

		if (sendResult.successCount > 0) {
			goalsToMarkSent.add(goal.id);
		}

		if (sendResult.invalidTokens.size > 0) {
			activeTokens = activeTokens.filter((token) => !tokensToRemove.has(token));
		}
	}

	if (goalsToMarkSent.size === 0 && tokensToRemove.size === 0) {
		return { notifiedGoals: 0 };
	}

	const userRef = db.doc(`users/${userDoc.id}`);

	await db.runTransaction(async (transaction) => {
		const freshSnapshot = await transaction.get(userRef);

		if (!freshSnapshot.exists) {
			return;
		}

		const freshData = freshSnapshot.data() as ReminderUser;
		const freshTokens = Array.isArray(freshData.fcmTokens) ? freshData.fcmTokens : [];
		const reminderSentAt = Timestamp.now();

		// Read all goal documents that need updating in the transaction
		const goalRefs = Array.from(goalsToMarkSent).map((goalId) =>
			userRef.collection('goals').doc(goalId)
		);
		const goalSnapshots = await Promise.all(goalRefs.map((ref) => transaction.get(ref)));

		// Update each goal document's `lastReminderSentAt` field
		goalSnapshots.forEach((snap, index) => {
			if (snap.exists) {
				transaction.update(goalRefs[index]!, { lastReminderSentAt: reminderSentAt });
			}
		});

		// Update user's tokens if any invalid ones were detected
		if (tokensToRemove.size > 0) {
			const updatedTokens = freshTokens.filter((token) => !tokensToRemove.has(token));
			transaction.update(userRef, { fcmTokens: updatedTokens });
		}
	});

	return { notifiedGoals: goalsToMarkSent.size };
}

async function sendReminderToTokens(tokens: string[], goalTitle: string): Promise<ChunkSendResult> {
	const invalidTokens = new Set<string>();
	let successCount = 0;

	for (const tokenChunk of chunkTokens(tokens, MAX_TOKENS_PER_MESSAGE)) {
		try {
			const response = await messaging.sendEachForMulticast({
				tokens: tokenChunk,
				notification: {
					title: 'GoReach',
					body: `${goalTitle}`
				},
				webpush: {
					fcmOptions: {
						link: REMINDER_LINK
					}
				}
			});

			successCount += response.successCount;

			response.responses.forEach((result, index) => {
				if (!result.success && isInvalidTokenError(result.error?.code)) {
					invalidTokens.add(tokenChunk[index]!);
				}
			});
		} catch (error) {
			logger.error('Failed to send reminder notification chunk', {
				error: serializeError(error),
				tokenCount: tokenChunk.length,
				goalTitle
			});
		}
	}

	return { successCount, invalidTokens };
}

function resolveTimeZone(timeZone: unknown): string {
	if (typeof timeZone !== 'string' || timeZone.trim().length === 0) {
		return DEFAULT_TIME_ZONE;
	}

	try {
		new Intl.DateTimeFormat('en-US', { timeZone }).format(new Date());
		return timeZone;
	} catch {
		return DEFAULT_TIME_ZONE;
	}
}

function getZonedDateParts(date: Date, timeZone: string): ZonedDateParts {
	const formatter = new Intl.DateTimeFormat('en-CA', {
		timeZone,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		hourCycle: 'h23'
	});

	const parts = formatter
		.formatToParts(date)
		.reduce<Record<string, string>>((accumulator, part) => {
			accumulator[part.type] = part.value;
			return accumulator;
		}, {});

	return {
		dateKey: `${parts.year}-${parts.month}-${parts.day}`,
		hour: Number(parts.hour),
		minute: Number(parts.minute)
	};
}

function isSentToday(
	lastReminderSentAt: Timestamp | null | undefined,
	todayKey: string,
	timeZone: string
): boolean {
	if (!lastReminderSentAt) {
		return false;
	}

	return getZonedDateParts(lastReminderSentAt.toDate(), timeZone).dateKey === todayKey;
}

function isValidReminderTime(time: string): boolean {
	return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
}

function isReminderDue(goalTime: string, currentParts: ZonedDateParts): boolean {
	const [goalHourRaw, goalMinuteRaw] = goalTime.split(':');
	const goalHour = Number(goalHourRaw);
	const goalMinute = Number(goalMinuteRaw);

	if (Number.isNaN(goalHour) || Number.isNaN(goalMinute)) {
		return false;
	}

	if (currentParts.hour > goalHour) {
		return true;
	}

	if (currentParts.hour < goalHour) {
		return false;
	}

	return currentParts.minute >= goalMinute;
}

function isInvalidTokenError(errorCode: string | undefined): boolean {
	return errorCode ? INVALID_TOKEN_ERROR_CODES.has(errorCode) : false;
}

function chunkTokens(tokens: string[], chunkSize: number): string[][] {
	const chunks: string[][] = [];

	for (let index = 0; index < tokens.length; index += chunkSize) {
		chunks.push(tokens.slice(index, index + chunkSize));
	}

	return chunks;
}

function serializeError(error: unknown) {
	if (!error) return { message: String(error) };
	if (error instanceof Error) {
		return { message: error.message, stack: error.stack };
	}
	try {
		// Try to stringify plain objects
		return JSON.parse(JSON.stringify(error));
	} catch {
		return { message: String(error) };
	}
}
