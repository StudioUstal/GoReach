<script lang="ts">
	import type { Goal } from '$lib/types/goal';
	import { UpdateGoalSettings } from '$lib/services/goal.service';
	import { goals } from '$lib/stores/app-data';
	const currentGoals = $derived($goals);

	const persistGoalSettings = async (goal: Goal) => {
		await UpdateGoalSettings(goal.id, {
			max: goal.max,
			time: goal.time
		});
	};
</script>

<div class="rounded-2xl border border-white/10 bg-white/5 p-4">
	<h2 class="text-sm font-bold text-neutral-500 uppercase">Tasky - Cíl / den & Notifikace</h2>

	<div class="mt-4 flex flex-col">
		{#each currentGoals as goal, index (goal.id)}
			<div
				class="flex flex-wrap items-center gap-4 {index !== currentGoals.length - 1
					? 'border-b'
					: ''} border-white/10 py-3 text-white"
			>
				<span class="text-sm font-medium">{goal.icon} {goal.name}</span>
				<div class="ml-auto flex items-center gap-2">
					<input
						type="number"
						bind:value={goal.max}
						onchange={() => persistGoalSettings(goal)}
						class="w-full max-w-16 rounded-lg border border-neutral-500 bg-neutral-700 py-1.5 text-center text-sm text-white focus:ring-0 focus:outline-none"
					/>
					<input
						type="time"
						bind:value={goal.time}
						onchange={() => persistGoalSettings(goal)}
						class="w-full max-w-26 rounded-lg border border-neutral-500 bg-neutral-700 py-1.5 text-sm text-white focus:ring-0 focus:outline-none"
					/>
				</div>
			</div>
		{/each}
	</div>
</div>
