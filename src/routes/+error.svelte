<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	const error = $derived(page.error);
	const status = $derived(page.status);
</script>

<div
	class="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-900 to-slate-800 px-4"
>
	<div class="text-center">
		<div class="mb-8">
			<h1 class="text-9xl font-bold text-red-500">{status}</h1>
			<p class="mt-2 text-2xl font-semibold text-white">
				{status === 404 ? 'Page Not Found' : 'Something Went Wrong'}
			</p>
		</div>

		<p class="mb-6 max-w-md text-gray-300">
			{error?.message ||
				'An unexpected error occurred. Please try again or return to the home page.'}
		</p>

		<div class="flex flex-col gap-3 sm:flex-row sm:justify-center">
			<button
				onclick={() => goto(resolve('/'))}
				class="rounded-lg bg-orange-600 px-6 py-3 font-semibold text-white transition hover:bg-red-600"
			>
				Domů
			</button>
			<button
				onclick={() => window.history.back()}
				class="rounded-lg border border-gray-500 px-6 py-3 font-semibold text-white transition hover:bg-slate-700"
			>
				Zpět
			</button>
		</div>
	</div>
</div>
