<script lang="ts">
	import { GetCurrentRank } from '$lib/services/rank.service';
	import { goals, ranks, todayEntry } from '$lib/stores/app-data';

	const currentRanks = $derived([...$ranks].sort((a, b) => a.requiredXp - b.requiredXp));
	const currentGoals = $derived($goals);
	const currentTodayEntry = $derived($todayEntry);

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

	const currentRank = $derived(() => GetCurrentRank(todayXp(), [...currentRanks]));
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
				<div class="text-sm text-neutral-500">Vyžaduje {rank.requiredXp} XP / den</div>
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
				<div class="text-sm text-neutral-500">Vyžaduje {rank.requiredXp} XP / den</div>
			</div>

			<div class="ml-auto text-base font-bold text-orange-600">
				{rank.requiredXp - todayXp()} XP
			</div>
		</div>
	{:else}
		<div
			class="mb-4 flex items-center gap-4 rounded-2xl border border-neutral-800/50 bg-neutral-900/50 p-4"
		>
			<div class="text-3xl opacity-50">{rank.icon}</div>
			<div>
				<div class="text-lg font-bold text-white opacity-50">{rank.displayName}</div>
				<div class="text-sm text-neutral-500 opacity-50">Vyžaduje {rank.requiredXp} XP / den</div>
			</div>

			<div class="ml-auto text-xl">🔒</div>
		</div>
	{/if}
{/each}
