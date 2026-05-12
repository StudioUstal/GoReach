<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import AddTaskCard from '$lib/components/AddTaskCard.svelte';
	import AllowNotificationsCard from '$lib/components/AllowNotificationsCard.svelte';
	import DeleteTodayDataCard from '$lib/components/DeleteTodayDataCard.svelte';
	import TaskListCard from '$lib/components/TaskListCard.svelte';
	import { Logout } from '$lib/services/auth.service';

	const { data } = $props();
	const user = $derived(data.user);
	const avatarText = $derived(
		user.displayName
			.split(' ')
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase())
			.join('') ||
			user.email[0]?.toUpperCase() ||
			'U'
	);

	const HandleLogout = async () => {
		await Logout();
		await goto(resolve('/login'));
	};
</script>

<svelte:head>
	<title>GoReach - Nastavení</title>
</svelte:head>

<div class="mx-auto flex max-w-md flex-col gap-4 sm:w-full sm:max-w-full">
	<div
		class="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/20 backdrop-blur-md"
	>
		<div class="flex items-center gap-4">
			<div
				class="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 ring-1 ring-white/10"
			>
				{#if user.photoURL}
					<img src={user.photoURL} alt={user.displayName} class="h-full w-full object-cover" />
				{:else}
					<span class="text-lg font-semibold tracking-wide text-white">{avatarText}</span>
				{/if}
			</div>

			<div class="min-w-0 flex-1">
				<div class="flex items-center gap-2">
					<h2 class="truncate text-lg font-semibold text-white">{user.displayName}</h2>
					<span
						class="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-neutral-300"
					>
						Aktivní
					</span>
				</div>
				<p class="truncate text-sm text-neutral-400">{user.email}</p>
			</div>
		</div>

		<div class="mt-4 flex items-center justify-between gap-3 border-t border-white/8 pt-4">
			<div class="text-sm text-neutral-400">Přihlášen</div>
			<button
				class="cursor-pointer rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15 focus:ring-2 focus:ring-white/30 focus:outline-none"
				onclick={HandleLogout}
			>
				Odhlásit se
			</button>
		</div>
	</div>

	<TaskListCard />

	<AddTaskCard />

	<AllowNotificationsCard userId={user.uid} />

	<DeleteTodayDataCard />
</div>
