<script lang="ts">
	import Task from '$lib/components/Task.svelte';

	const { data } = $props();
	const goals = $derived(data.goals);
	const todayEntry = $derived(data.todayEntry);
</script>

<div class="flex flex-col gap-3">
	{#each goals as goal (goal.id)}
		<Task {goal} {todayEntry} />
	{/each}
</div>
