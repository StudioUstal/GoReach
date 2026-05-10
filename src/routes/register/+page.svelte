<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Register } from '$lib/services/auth.service';

	let email = $state<string>('');
	let password = $state<string>('');
	let passwordConfirm = $state<string>('');

	const passwordsMatch = $derived(password === passwordConfirm);

	let errorMessage = $state<string>('');

	const HandleRegister = async (event: SubmitEvent) => {
		event.preventDefault();

		email = email.trim();
		password = password.trim();
		passwordConfirm = passwordConfirm.trim();

		if (!email || !password || !passwordConfirm) {
			return;
		}

		if (password !== passwordConfirm) {
			errorMessage = 'Hesla se neshodují.';
			return;
		}

		try {
			await Register(email, password);
			await goto(resolve('/login'));
		} catch (error) {
			errorMessage = 'Registrace selhala. E-mail je již používán nebo heslo není dostatečně silné.';
			console.error(error);
		}
	};
</script>

<svelte:head>
	<title>GoReach - Registrace</title>
</svelte:head>

<div class="h-screen w-full dark:bg-[#0d0d0d]">
	<div class="flex h-full w-full items-center justify-center">
		<div class="w-full rounded-lg bg-white p-6 shadow-md sm:w-100 dark:bg-[#1a1a1a]">
			<h1 class="mb-4 text-center text-3xl font-bold text-gray-800 dark:text-gray-200">
				Registrace
			</h1>
			<form onsubmit={HandleRegister}>
				<div>
					<label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300"
						>Email</label
					>
					<input
						type="email"
						id="email"
						name="email"
						bind:value={email}
						required
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-[#555555] dark:bg-[#333333] dark:text-gray-200"
					/>
				</div>
				<div class="mt-2">
					<label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300"
						>Heslo</label
					>
					<input
						type="password"
						id="password"
						name="password"
						bind:value={password}
						required
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-[#555555] dark:bg-[#333333] dark:text-gray-200"
					/>
				</div>

				<div class="mt-2">
					<label
						for="passwordConfirm"
						class="block text-sm font-medium text-gray-700 dark:text-gray-300"
						>Potvrzení hesla</label
					>
					<input
						type="password"
						id="passwordConfirm"
						name="passwordConfirm"
						bind:value={passwordConfirm}
						required
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-[#555555] dark:bg-[#333333] dark:text-gray-200"
					/>
				</div>

				{#if errorMessage}
					<p class="mt-2 text-center text-sm text-red-500">{errorMessage}</p>
				{/if}

				<button
					type="submit"
					disabled={!passwordsMatch}
					class="mt-4 w-full cursor-pointer rounded-md bg-linear-to-r from-orange-600 to-orange-500 px-4 py-2 font-semibold text-white hover:from-orange-700 hover:to-orange-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:outline-none disabled:bg-neutral-500"
					>Registrovat se</button
				>
			</form>

			<p class="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
				Máte účet? <a href={resolve('/login')} class="text-orange-600 hover:underline"
					>Přihlaste se</a
				>
			</p>
		</div>
	</div>
</div>
