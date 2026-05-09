<script lang="ts">
	import Task from '$lib/components/Task.svelte';
	import { GOALS } from '$lib/constants/goals';
</script>

<div class="flex flex-col gap-3">
	{#each GOALS as goal (goal.id)}
		<Task {goal} />
	{/each}
</div>
