<script lang="ts">
	import { toasts } from '$lib/stores/toast.store';
	import Toast from './Toast.svelte';
</script>

<!-- Fixed container di pojok kanan bawah -->
<div
	aria-live="polite"
	aria-atomic="false"
	class="pointer-events-none fixed right-5 bottom-5 z-100 flex flex-col-reverse gap-2"
>
	{#each $toasts as toast (toast.id)}
		<Toast {toast} />
	{/each}
</div>
