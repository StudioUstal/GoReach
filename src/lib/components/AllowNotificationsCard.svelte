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
	let notificationStatus = $derived(GetNotificationToken());

	const HandleAllowNotifications = async () => {
		if (!browser || !userId || isSubmitting) return;

		isSubmitting = true;
		errorMessage = '';

		try {
			const token = await EnableNotifications(userId);

			if (!token) {
				errorMessage = 'Nepodařilo se získat token pro notifikace.';
				notificationStatus = 'denied';
				return;
			}

			SaveNotificationToken(token);
			notificationStatus = 'granted';
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
				notificationStatus = null;
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
		<div class="flex min-w-0 flex-wrap items-center gap-2 text-sm font-medium text-white">
			<span class="shrink-0">🔔 Povolit notifikace</span>
			{#if notificationStatus}
				<div
					class="shrink-0 rounded-2xl bg-green-600 px-3 py-1 text-center text-sm font-bold text-white"
				>
					Povoleno
				</div>
			{/if}
		</div>
		{#if notificationStatus}
			<button
				onclick={HandleDisableNotifications}
				disabled={isSubmitting}
				class="w-full max-w-24 cursor-pointer rounded-2xl bg-red-600 py-2 text-sm font-bold text-white"
			>
				Zrušit
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
