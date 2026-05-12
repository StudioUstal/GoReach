<script lang="ts">
	import { browser } from '$app/environment';
	import {
		EnableNotifications,
		GetNotificationToken,
		RemoveNotificationToken,
		SaveNotificationToken
	} from '$lib/services/notifications.service';

	const { userId } = $props<{ userId: string }>();

	let errorMessage = $state<string>('');
	let isSubmitting = $state(false);
	let notificationStatus = $derived<'default' | 'granted' | 'denied'>(Notification.permission);

	const HandleAllowNotifications = async () => {
		if (!browser || !userId || isSubmitting) return;

		isSubmitting = true;
		errorMessage = '';

		try {
			const token = await EnableNotifications(userId);

			if (!token) {
				errorMessage = 'Nepodařilo se získat token pro notifikace.';
			}

			SaveNotificationToken(token);
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Nepodařilo se povolit notifikace.';
		} finally {
			isSubmitting = false;
		}
	};

	const HandleDisableNotifications = async () => {
		if (!browser || !userId || isSubmitting) return;

		isSubmitting = true;
		errorMessage = '';

		try {
			const token = GetNotificationToken();

			if (token) {
				await RemoveNotificationToken(userId, token);
			}
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Nepodařilo se zakázat notifikace.';
		} finally {
			isSubmitting = false;
		}
	};
</script>

<div class="rounded-2xl border border-white/10 bg-white/5 p-4">
	<h2 class="text-sm font-bold text-neutral-500 uppercase">Notifikace</h2>

	<div class="mt-4 flex items-center justify-between gap-4">
		<span class="text-sm font-medium text-white">🔔 Povolit notifikace</span>
		{#if notificationStatus === 'granted'}
			<button
				onclick={HandleAllowNotifications}
				disabled={isSubmitting}
				class="w-full max-w-24 cursor-pointer rounded-2xl bg-green-600 py-2 text-sm font-bold text-white"
			>
				Povoleno
			</button>
		{:else if notificationStatus === 'denied'}
			<button
				onclick={HandleAllowNotifications}
				disabled={isSubmitting}
				class="w-full max-w-24 cursor-pointer rounded-2xl bg-red-600 py-2 text-sm font-bold text-white"
			>
				Zamítnuto
			</button>
		{:else}
			<button
				onclick={HandleAllowNotifications}
				disabled={isSubmitting}
				class="w-full max-w-24 cursor-pointer rounded-2xl bg-orange-600 py-2 text-sm font-bold text-white"
			>
				{isSubmitting ? 'Čekám…' : 'Povolit'}
			</button>
		{/if}
	</div>

	{#if errorMessage}
		<p class="mt-3 text-sm text-red-400">{errorMessage}</p>
	{/if}
</div>
