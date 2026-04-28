<script lang="ts">
	import Badge from '$lib/components/ui/Badge.svelte';
	import Tag from '$lib/components/ui/Tag.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	let username = $state('');
</script>

<h1>Welcome to SvelteKit</h1>
<p class="text-5xl text-primary">
	Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation
</p>

<Badge color="yellow" label="Progress" />
<Tag variant="dash" label="DASH" />

<Button>Primary</Button>

<Input
	label="username"
	placeholder="Masukan Username Kamu"
	bind:value={username}
	helperText="Username kamu harus unik"
/>

<p>Input {username}</p>
