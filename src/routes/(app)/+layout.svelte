<script lang="ts">
	import { onMount } from 'svelte';
	import { dev } from '$app/environment';
	import { base, resolve } from '$app/paths';
	import { NAV_LINKS } from '$lib/utils/links';
	import { isActive } from '$lib/utils/paths';
	import { GetCurrentRank } from '$lib/services/rank.service.js';
	import { GetTodayKey, GetWeekKey } from '$lib/utils/keys';
	import {
		entries,
		goals,
		ranks,
		seedAppData,
		startRealtimeSync,
		todayEntry,
		realtimeReady
	} from '$lib/stores/app-data';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import type { Entry } from '$lib/types/entry.js';
	import { SvelteDate } from 'svelte/reactivity';

	const { children, data } = $props();

	const currentRanks = $derived($ranks);
	const currentGoals = $derived($goals);
	const currentTodayEntry = $derived($todayEntry);
	const currentEntries = $derived($entries);
	const todayXp = $derived(() => {
		let xp = 0;

		currentTodayEntry?.actions.forEach((action) => {
			const goal = currentGoals.find((g) => g.id === action.goalId);
			if (goal && action.progress > 0 && action.progress >= goal.max) {
				xp += 100;
			}
		});

		return xp;
	});

	let weeklyEntriesLocal = $state<Entry[]>([]);

	onMount(() => {
		seedAppData(data);
		const stopRealtimeSync = startRealtimeSync(data.user.uid);

		const weekStart = GetWeekKey();
		const weekEnd = GetTodayKey();

		const unsubscribeEntriesForWeek = entries.subscribe((allEntries) => {
			weeklyEntriesLocal = allEntries.filter((e) => e.dateKey >= weekStart && e.dateKey <= weekEnd);
		});

		navigator.serviceWorker.register(dev ? '/service-worker.js' : `${base}/service-worker.js`, {
			type: dev ? 'module' : 'classic'
		});

		return () => {
			stopRealtimeSync();
			unsubscribeEntriesForWeek();
		};
	});

	const rank = $derived(() => {
		const goalsArr = currentGoals;
		if (weeklyEntriesLocal && weeklyEntriesLocal.length) {
			return GetCurrentRank({ weeklyEntries: weeklyEntriesLocal, goals: goalsArr }, currentRanks);
		}

		return GetCurrentRank(todayXp(), currentRanks);
	});

	const streak = $derived(() => {
		if (!currentEntries.length || !currentGoals.length) return 0;

		const goalsCount = currentGoals.length;
		const entriesByDate = new Map(currentEntries.map((entry) => [entry.dateKey, entry]));

		const isCompleteDay = (entry: Entry) => {
			if (entry.actions.length < goalsCount) return false;

			return currentGoals.every((goal) => {
				const action = entry.actions.find((item) => item.goalId === goal.id);
				return !!action && action.progress >= goal.max;
			});
		};

		const isDayCompleteByKey = (dateKey: string) => {
			const entry = entriesByDate.get(dateKey);
			return entry ? isCompleteDay(entry) : false;
		};

		const today = new SvelteDate();
		today.setHours(0, 0, 0, 0);

		let streakCount = 0;

		while (true) {
			const date = new SvelteDate(today);
			date.setDate(today.getDate() - streakCount);
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, '0');
			const day = String(date.getDate()).padStart(2, '0');
			const dateKey = `${year}-${month}-${day}`;

			if (!isDayCompleteByKey(dateKey)) break;
			streakCount += 1;
		}

		return streakCount;
	});

	const completed = $derived(() => {
		return (todayXp() / (currentGoals.length * 100)) * 100; // Placeholder, calculate based on completed goals
	});

	const todayString = new SvelteDate().toLocaleDateString('cs-CZ', {
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
	{#if !$realtimeReady}
		<div class="absolute inset-0 z-50 flex items-center justify-center bg-black/70">
			<div class="flex flex-col items-center gap-4">
				<LoadingSpinner size={48} />
				<div class="text-sm text-neutral-300">Načítání aplikace…</div>
			</div>
		</div>
	{/if}
	<header class="t-2 sticky top-0 z-2 bg-[#0d0d0d] p-4">
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
		class="fixed bottom-0 grid w-full grid-cols-4 border-t border-neutral-800 bg-neutral-900 sm:gap-4"
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
