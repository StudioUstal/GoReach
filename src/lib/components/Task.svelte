<script lang="ts">
	const { goal } = $props();

	let progress = $derived(goal.progress);

	function progressPercentage() {
		return Math.min((progress / goal.max) * 100, 100);
	}

	const colorMap: Record<string, string> = {
		'text-orange-500': '#f97316',
		'text-blue-500': '#3b82f6',
		'text-purple-500': '#a855f7',
		'text-yellow-600': '#ca8a04'
	};

	function themeColor() {
		return colorMap[goal.progressColor || 'text-orange-500'] || colorMap['text-orange-500'];
	}

	function setProgress(level: number) {
		const newProgress = progress === level ? level - 1 : level;
		progress = newProgress;
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
				<p class="text-sm text-neutral-500">{goal.description}</p>
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
			style="width: {progressPercentage()}%; background-color: {themeColor()}"
		></div>
	</div>

	<div class="mt-4 flex flex-wrap gap-1">
		{#each Array.from({ length: goal.max }, (_, i) => i + 1) as level (level)}
			<button
				type="button"
				class="h-6 w-6 appearance-none rounded-md border-2 border-neutral-700 bg-neutral-800 transition-all focus:ring-0 focus:outline-none"
				style={level <= progress
					? `background-color: ${themeColor()}; border-color: ${themeColor()}`
					: ''}
				aria-pressed={level <= progress}
				onclick={() => setProgress(level)}
				aria-label={`Level ${level}`}
			></button>
		{/each}
	</div>

	{#if progress === goal.max}
		<div class="mt-4 rounded-md bg-orange-800/25 p-2 text-center text-sm font-bold text-orange-600">
			✓ Splněno! +100 XP
		</div>
	{/if}
</div>
