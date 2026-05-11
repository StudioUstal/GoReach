<script lang="ts">
	import { DeleteEntry } from '$lib/services/entry.service';
	import { GetTodayKey } from '$lib/utils/keys';

	const HandleDataReset = async () => {
		await DeleteEntry(GetTodayKey());
	};
</script>

<div class="rounded-2xl border border-white/10 bg-white/5 p-4">
	<h2 class="text-sm font-bold text-neutral-500 uppercase">Nebezpečná zóna</h2>

	<button
		onclick={HandleDataReset}
		class="mt-4 w-full max-w-sm cursor-pointer rounded-xl bg-neutral-600 py-4 font-bold text-white"
	>
		🗑️ Resetovat dnešní data
	</button>
</div>
