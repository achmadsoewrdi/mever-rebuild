<script lang="ts">
	import { toasts } from '$lib/stores/toast.store';
	import Toast from './Toast.svelte';
</script>

<!-- Fixed container di pojok kanan atas, sejajar dengan area header -->
<div
	aria-live="polite"
	aria-atomic="false"
	class="pointer-events-none fixed top-24 right-8 z-100 flex flex-col gap-3"
>
	{#each $toasts as toast (toast.id)}
		<Toast {toast} />
	{/each}
</div>
