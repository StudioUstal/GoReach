<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { UpsertEntry } from '$lib/services/entry.service';
	import type { EntryAction } from '$lib/types/entry';
	import { GetTodayKey } from '$lib/utils/keys';
	import { slide } from 'svelte/transition';

	const { goal, todayEntry } = $props();

	const currentGoalEntry = $derived(() =>
		todayEntry
			? todayEntry.actions.filter((action: EntryAction) => action.goalId === goal.id).at(-1)
			: null
	);

	let progress = $derived(currentGoalEntry()?.progress);

	function progressPercentage() {
		return Math.min((progress / goal.max) * 100, 100);
	}

	let updating = $state(false);

	async function setProgress(level: number) {
		updating = true;
		const newProgress = progress === level ? level - 1 : level;
		progress = newProgress;

		try {
			await UpsertEntry(GetTodayKey(), [
				{
					goalId: goal.id,
					progress: newProgress,
					createdAt: Date.now()
				}
			]);
			await invalidate('app:layout');
		} finally {
			updating = false;
		}
	}
</script>

<div
	class="rounded-2xl border bg-neutral-900 p-4 {progress === goal.max
		? 'border-green-500/50'
		: 'border-neutral-800'}"
>
	<div class="flex items-center justify-between gap-4">
		<div class="flex items-center gap-2">
			<div class="rounded-2xl bg-neutral-800 p-2 text-2xl">
				{goal.icon}
			</div>
			<div>
				<h2 class="text-lg font-bold text-white">{goal.name}</h2>
				<p class="text-sm text-neutral-500">Cíl: {goal.max} za den</p>
			</div>
		</div>
		<div class="text-center text-sm text-neutral-500">
			<div class={`text-2xl font-bold ${goal.progressColor || 'text-orange-500'}`}>
				{progress}
			</div>
			/{goal.max}
		</div>
	</div>

	<div class="mt-4 h-1 w-full rounded-full bg-neutral-800">
		<div
			class="h-full rounded-full transition-all"
			style="width: {progressPercentage()}%; background-color: {goal.progressColor || '#f97316'}"
		></div>
	</div>

	<div class="my-4 flex flex-wrap gap-1">
		{#each Array.from({ length: goal.max }, (_, i) => i + 1) as level (level)}
			<button
				type="button"
				disabled={updating}
				class="h-6 w-6 cursor-pointer appearance-none rounded-md border-2 border-neutral-700 bg-neutral-800 transition-all focus:ring-0 focus:outline-none"
				style={level <= progress
					? `background-color: ${goal.progressColor || '#f97316'}; border-color: ${goal.progressColor || '#f97316'}`
					: ''}
				aria-pressed={level <= progress}
				onclick={() => setProgress(level)}
				aria-label={`Level ${level}`}
			></button>
		{/each}
	</div>

	{#if progress === goal.max}
		<div
			transition:slide
			class="rounded-md bg-orange-800/25 p-2 text-center text-sm font-bold text-orange-600"
		>
			✓ Splněno! +100 XP
		</div>
	{/if}
</div>
