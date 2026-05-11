<script lang="ts">
	const HandleAllowNotifications = async () => {};
</script>

<div class="rounded-2xl border border-white/10 bg-white/5 p-4">
	<h2 class="text-sm font-bold text-neutral-500 uppercase">Notifikace</h2>

	<div class="mt-4 flex items-center justify-between gap-4">
		<span class="text-sm font-medium text-white">🔔 Povolit notifikace</span>
		<button
			onclick={HandleAllowNotifications}
			class="w-full max-w-24 cursor-pointer rounded-2xl bg-orange-600 py-2 text-sm font-bold text-white"
		>
			Povolit
		</button>
	</div>
</div>
