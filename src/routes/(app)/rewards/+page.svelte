<script lang="ts">
	import { GetCurrentRank } from '$lib/services/rank.service';
	import { SubscribeToWeeklyEntries } from '$lib/services/firestore.service';
	import { GetWeekKey, GetTodayKey } from '$lib/utils/keys';
	import { goals, ranks } from '$lib/stores/app-data';
	import { onMount } from 'svelte';
	import type { Entry } from '$lib/types/entry.js';

	const { data } = $props();

	const currentRanks = $derived([...$ranks].sort((a, b) => a.requiredXp - b.requiredXp));
	const currentGoals = $derived($goals);

	let weeklyEntriesLocal = $state<Entry[]>([]);

	const currentAverageXp = $derived(() => {
		if (!weeklyEntriesLocal.length) return 0;

		let totalXp = 0;

		weeklyEntriesLocal.forEach((entry) => {
			entry.actions.forEach((action) => {
				const goal = currentGoals.find((g) => g.id === action.goalId);
				if (goal && action.progress > 0 && action.progress >= goal.max) {
					totalXp += 100;
				}
			});
		});

		return totalXp / weeklyEntriesLocal.length;
	});

	onMount(() => {
		const weekStart = GetWeekKey();
		const weekEnd = GetTodayKey();
		const unsubscribe = SubscribeToWeeklyEntries(data.user.uid, weekStart, weekEnd, (entries) => {
			weeklyEntriesLocal = entries;
		});

		return () => unsubscribe();
	});

	const currentRank = $derived(() => {
		const goalsArr = currentGoals;
		if (weeklyEntriesLocal && weeklyEntriesLocal.length) {
			return GetCurrentRank({ weeklyEntries: weeklyEntriesLocal, goals: goalsArr }, [
				...currentRanks
			]);
		}
	});

	const currentRankIndex = $derived(() =>
		currentRanks.findIndex((rank) => rank.displayName === currentRank()?.displayName)
	);
</script>

{#each currentRanks as rank, index (rank.displayName)}
	{#if index <= currentRankIndex()}
		<div
			class="mb-4 flex items-center gap-4 rounded-2xl border border-green-800 bg-green-700/15 p-4"
		>
			<div class="text-3xl">{rank.icon}</div>
			<div>
				<div class="text-lg font-bold text-white">{rank.displayName}</div>
				<div class="text-sm text-neutral-500">Vyžaduje průměrných {rank.requiredXp} XP / týden</div>
			</div>

			<div class="ml-auto text-sm font-bold text-green-500">✓ Odemčeno</div>
		</div>
	{:else if index === currentRankIndex() + 1}
		<div
			class="mb-4 flex items-center gap-4 rounded-2xl border border-orange-600 bg-neutral-900 p-4"
		>
			<div class="text-3xl">{rank.icon}</div>
			<div>
				<div class="text-lg font-bold text-white">{rank.displayName}</div>
				<div class="text-sm text-neutral-500">Vyžaduje průměrných {rank.requiredXp} XP / týden</div>
			</div>

			<div class="ml-auto text-base font-bold text-orange-600">
				{Math.max(0, rank.requiredXp - currentAverageXp())} XP
			</div>
		</div>
	{:else}
		<div
			class="mb-4 flex items-center gap-4 rounded-2xl border border-neutral-800/50 bg-neutral-900/50 p-4"
		>
			<div class="text-3xl opacity-50">{rank.icon}</div>
			<div>
				<div class="text-lg font-bold text-white opacity-50">{rank.displayName}</div>
				<div class="text-sm text-neutral-500 opacity-50">
					Vyžaduje průměrných {rank.requiredXp} XP / týden
				</div>
			</div>

			<div class="ml-auto text-xl">🔒</div>
		</div>
	{/if}
{/each}
