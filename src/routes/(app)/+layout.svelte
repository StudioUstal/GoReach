<script lang="ts">
	import { onMount } from 'svelte';
	import { dev } from '$app/environment';
	import { base, resolve } from '$app/paths';
	import { NAV_LINKS } from '$lib/utils/links';
	import { isActive } from '$lib/utils/paths';
	import { GetCurrentRank } from '$lib/services/rank.service.js';

	const { children, data } = $props();

	const ranks = $derived(data.ranks);
	const todayXp = $derived(() => {
		let xp = 0;

		data.todayEntry?.actions.forEach((action) => {
			const goal = data.goals.find((g) => g.id === action.goalId);
			if (goal && action.progress > 0 && action.progress >= goal.max) {
				xp += 100;
			}
		});

		return xp;
	});
	const rank = $derived(() => GetCurrentRank(todayXp(), ranks));
	const streak = $derived(() => {
		return 1; // Placeholder, implement streak logic based on user data
	});
	const completed = $derived(() => {
		return (todayXp() / (data.goals.length * 100)) * 100; // Placeholder, calculate based on completed goals
	});

	onMount(() => {
		navigator.serviceWorker.register(dev ? '/service-worker.js' : `${base}/service-worker.js`, {
			type: dev ? 'module' : 'classic'
		});
	});

	const todayString = new Date().toLocaleDateString('cs-CZ', {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
		year: 'numeric'
	});
</script>

<svelte:head>
	<meta name="theme-color" content="#ff3e00" />
	<title>GoReach</title>
</svelte:head>

<div class="app relative h-screen">
	<header class="t-2 sticky top-0 bg-[#0d0d0d] p-4">
		<div class="flex items-center justify-between gap-4">
			<div class="flex flex-col gap-1">
				<span class="text-sm text-neutral-500 uppercase">{todayString}</span>
				<h1
					class="inline-block bg-linear-to-r from-orange-500 via-orange-400 to-red-500 bg-clip-text text-4xl font-bold text-transparent"
				>
					GoReach
				</h1>
			</div>
			<div class="flex flex-col items-end gap-2">
				<div class="rounded-xl border border-neutral-800 bg-neutral-900 p-2 text-2xl">
					{rank()?.icon}
				</div>
				<div class="text-sm font-bold text-orange-500">{rank()?.displayName}</div>
			</div>
		</div>

		<div class="mt-4 grid grid-cols-3 gap-2">
			<div class="rounded-2xl border border-neutral-800 bg-neutral-900 p-2 md:p-4">
				<div class="text-sm text-neutral-500 uppercase">Streak</div>
				<div class="text-2xl font-bold text-orange-500">🔥 {streak()}d</div>
			</div>

			<div class="rounded-2xl border border-neutral-800 bg-neutral-900 p-2 md:p-4">
				<div class="text-sm text-neutral-500 uppercase">XP dnes</div>
				<div class="text-2xl font-bold text-yellow-600">⚡ {todayXp()}</div>
			</div>

			<div class="rounded-2xl border border-neutral-800 bg-neutral-900 p-2 md:p-4">
				<div class="text-sm text-neutral-500 uppercase">Splněno</div>
				<div class="text-2xl font-bold text-green-500">{completed().toFixed(0)}%</div>
			</div>
		</div>

		<hr class="mt-4 rounded-full border-2 border-neutral-800" />

		<div class="mt-4 flex flex-wrap gap-1 sm:grid sm:grid-cols-4 sm:gap-2">
			{#each NAV_LINKS as link (link.href)}
				<a
					href={resolve(link.href)}
					class="rounded-xl px-4 py-2 text-center text-sm font-bold transition-colors {isActive(
						link.href
					)
						? 'bg-orange-500 text-white'
						: 'bg-neutral-800 text-neutral-500'}"
				>
					{link.name}
				</a>
			{/each}
		</div>
	</header>
	<main class="overflow-y-auto px-4 pt-4 pb-28">
		{@render children()}
	</main>
	<footer
		class="fixed bottom-0 grid w-full grid-cols-4 gap-4 border-t border-neutral-800 bg-neutral-900"
	>
		{#each NAV_LINKS as link (link.href)}
			<a href={resolve(link.href)} class="flex flex-col items-center gap-1 p-4">
				<div class="text-2xl">
					{link.icon}
				</div>
				<div
					class="text-sm font-bold transition-colors {isActive(link.href)
						? 'text-orange-500'
						: 'text-neutral-500'}"
				>
					{link.name}
				</div>
			</a>
		{/each}
	</footer>
</div>
