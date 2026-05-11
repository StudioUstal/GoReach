<script lang="ts">
	import { CreateTask } from '$lib/services/task.service';

	let title = $state<string>('');
	let emoji = $state<string>('🎯');
	let target = $state<number>(10);
	let progressColor = $state<string>('#ffffff');
	let time = $state<string>('10:00');

	const HandleSubmit = async (e: SubmitEvent) => {
		e.preventDefault();

		if (!title || !emoji || !target) return;

		try {
			await CreateTask(title, emoji, target, time, progressColor);
			title = '';
			emoji = '🎯';
			target = 10;
			time = '10:00';
			progressColor = '#ffffff';
		} catch (error) {
			console.error('Chyba při vytváření tasku:', error);
		}
	};
</script>

<div class="rounded-2xl border border-white/10 bg-white/5 p-4">
	<h2 class="text-sm font-bold text-neutral-500 uppercase">Přidat nový task</h2>

	<form class="mt-4 flex flex-col" onsubmit={HandleSubmit}>
		<div class="flex items-center justify-between gap-5 border-b border-white/8 py-3">
			<label for="task-title" class="block text-sm font-medium text-neutral-300">Název</label>
			<input
				type="text"
				id="task-title"
				name="task-title"
				placeholder="Název tasku"
				required
				bind:value={title}
				class="block w-full max-w-64 rounded-xl border border-neutral-700 bg-neutral-800 py-2 text-sm text-white shadow-sm ring-neutral-500 placeholder:text-neutral-500 focus:ring-1"
			/>
		</div>

		<div class="flex items-center justify-between gap-5 border-b border-white/8 py-3">
			<label for="task-emoji" class="block text-sm font-medium text-neutral-300">Emoji</label>
			<input
				type="text"
				id="task-emoji"
				name="task-emoji"
				bind:value={emoji}
				class="block w-full max-w-15 rounded-xl border border-neutral-700 bg-neutral-800 py-2 text-center text-sm text-white shadow-sm ring-neutral-500 placeholder:text-neutral-500 focus:ring-1"
			/>
		</div>

		<div class="flex items-center justify-between gap-5 border-b border-white/8 py-3">
			<label for="task-target" class="block text-sm font-medium text-neutral-300">Cíl / den</label>
			<input
				type="number"
				id="task-target"
				name="task-target"
				placeholder="10"
				required
				bind:value={target}
				class="block w-full max-w-15 rounded-xl border border-neutral-700 bg-neutral-800 py-2 text-center text-sm text-white shadow-sm ring-neutral-500 placeholder:text-neutral-500 focus:ring-1"
			/>
		</div>

		<div class="flex items-center justify-between gap-5 border-b border-white/8 py-3">
			<label for="task-color" class="block text-sm font-medium text-neutral-300">Barva</label>
			<input
				type="color"
				id="task-color"
				name="task-color"
				bind:value={progressColor}
				class="block h-full w-full max-w-15 rounded-xl border border-neutral-700 bg-neutral-800 py-2 text-center text-sm shadow-sm ring-neutral-500 focus:ring-1"
			/>
		</div>

		<div class="flex items-center justify-between gap-5 py-3">
			<label for="task-time" class="block text-sm font-medium text-neutral-300">Notifikace</label>
			<input
				type="time"
				id="task-time"
				name="task-time"
				placeholder="10:00"
				bind:value={time}
				class="block w-full max-w-24 appearance-auto rounded-xl border border-neutral-700 bg-neutral-800 py-2 text-center text-sm text-white accent-white shadow-sm ring-neutral-500 placeholder:text-neutral-500 focus:ring-1"
			/>
		</div>

		<button
			type="submit"
			class="mt-2 w-full max-w-xl cursor-pointer rounded-2xl bg-orange-600 py-4 text-center font-bold text-white"
		>
			+ Přidat task
		</button>
	</form>
</div>
