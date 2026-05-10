<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Login, LoginWithGoogle } from '$lib/services/auth.service';
	import { ensureUserDocument } from '$lib/services/user.service';

	let email = $state<string>('');
	let password = $state<string>('');

	const HandleLogin = async (event: SubmitEvent) => {
		event.preventDefault();

		email = email.trim();
		password = password.trim();

		if (!email || !password) {
			return;
		}

		const userCredentials = await Login(email, password);

		if (userCredentials) {
			await ensureUserDocument();
			await goto(resolve('/'));
		} else {
			console.error('Přihlášení selhalo');
		}
	};

	const HandleLoginWithGoogle = async () => {
		const userCredentials = await LoginWithGoogle();

		if (userCredentials) {
			await ensureUserDocument();
			await goto(resolve('/'));
		} else {
			console.error('Přihlášení selhalo');
		}
	};
</script>

<svelte:head>
	<title>GoReach - Přihlášení</title>
</svelte:head>

<div class="h-screen w-full dark:bg-[#0d0d0d]">
	<div class="flex h-full w-full items-center justify-center">
		<div class="w-full rounded-lg bg-white p-6 shadow-md sm:w-100 dark:bg-[#1a1a1a]">
			<h1 class="mb-4 text-center text-3xl font-bold text-gray-800 dark:text-gray-200">
				Přihlášení
			</h1>
			<form onsubmit={HandleLogin}>
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
				<button
					type="submit"
					class="mt-4 w-full cursor-pointer rounded-md bg-linear-to-r from-orange-600 to-orange-500 px-4 py-2 font-semibold text-white hover:from-orange-700 hover:to-orange-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:outline-none"
					>Přihlásit se</button
				>
			</form>

			<div class="mt-4 flex items-center justify-center">
				<button
					type="button"
					onclick={HandleLoginWithGoogle}
					class="flex cursor-pointer items-center justify-center rounded-md bg-white px-4 py-2 font-semibold text-gray-800 shadow-sm focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:outline-none dark:bg-[#333333] dark:text-gray-200"
				>
					Přihlásit se pomocí Google
				</button>
			</div>

			<p class="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
				Nemáte účet? <a href={resolve('/register')} class="text-orange-600 hover:underline"
					>Zaregistrujte se</a
				>
			</p>
		</div>
	</div>
</div>
