<script lang="ts">
	import { goals } from '$lib/stores/app-data';
	import type { Entry } from '$lib/types/entry.js';
	import { onMount } from 'svelte';
	import { GetWeekKey, GetTodayKey } from '$lib/utils/keys';
	import { buildDateRange } from './utils';

	const { data } = $props();

	const weeklyEntries = $derived(data.weeklyEntries);

	let tasksStats = $state<
		Record<string, { dateKey: string; progress: number; max: number; progressColor?: string }[]>
	>({});

	const MapTaskStats = (weeklyEntries: Entry[]) => {
		// reset
		tasksStats = {};

		const weekStart = GetWeekKey();
		const weekEnd = GetTodayKey();
		const dateKeys = buildDateRange(weekStart, weekEnd);

		for (const goal of $goals) {
			const key = `${goal.icon} ${goal.name}`;
			tasksStats[key] = dateKeys.map((dateKey) => {
				const entry = weeklyEntries.find((e) => e.dateKey === dateKey);
				const action = entry ? entry.actions.find((a) => a.goalId === goal.id) : undefined;
				const progress = action ? action.progress || 0 : 0;
				return {
					dateKey,
					progress,
					progressColor: goal.progressColor,
					max: goal.max || 0
				};
			});
		}
	};

	onMount(() => {
		if (weeklyEntries) {
			MapTaskStats(weeklyEntries);
		}
	});
</script>

<div class="flex flex-col gap-4">
	{#each Object.entries(tasksStats) as [goalName, stats] (goalName)}
		<div class="">
			<h2 class="mb-2 text-sm font-bold text-neutral-500">{goalName}</h2>

			<div class="flex flex-wrap items-end gap-1">
				{#each stats as stat (stat.dateKey)}
					<div class="flex flex-col items-center gap-1">
						<div class="flex h-12 w-12 items-end overflow-hidden">
							<div
								class="flex w-full items-center {stat.progress == 0
									? 'opacity-25'
									: ''} justify-center rounded-tl-md rounded-tr-md text-sm font-bold text-neutral-700"
								style="height: {Math.min(
									100,
									Math.max(10, stat.max ? (stat.progress / stat.max) * 100 : 0)
								)}%; background-color: {stat.progressColor ?? 'transparent'}"
							></div>
						</div>
						<span class="mt-1 text-xs text-neutral-500 uppercase"
							>{new Date(stat.dateKey).toLocaleString('cs-CZ', { weekday: 'short' })}</span
						>
					</div>
				{/each}
			</div>
		</div>
	{/each}
</div>
