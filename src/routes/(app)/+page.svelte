<script lang="ts">
	import Task from '$lib/components/Task.svelte';
	import { goals, todayEntry } from '$lib/stores/app-data';

	const currentGoals = $derived($goals);
	const currentTodayEntry = $derived($todayEntry);
</script>

<div class="flex flex-col gap-3">
	{#each currentGoals as goal (goal.id)}
		<Task {goal} todayEntry={currentTodayEntry} />
	{/each}
</div>
