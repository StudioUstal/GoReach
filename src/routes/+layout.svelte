<script lang="ts">
	import './layout.css';

	const { children } = $props();
</script>

<svelte:head>
	<meta name="theme-color" content="#ff3e00" />
	<title>GoReach</title>
</svelte:head>

{@render children()}
