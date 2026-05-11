<script lang="ts">
	const { size = 48 } = $props();
</script>

<div
	class="spinner"
	style="width: {size}px; height: {size}px;
	border-width: {Math.max(2, Math.round(size / 12))}px;"
></div>

<style>
	.spinner {
		border: 4px solid rgba(255, 255, 255, 0.08);
		border-top-color: rgba(255, 255, 255, 0.9);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
