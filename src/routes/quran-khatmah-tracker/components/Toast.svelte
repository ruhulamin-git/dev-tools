<script lang="ts">
	import { khatmah } from '../lib/khatmah.svelte';
</script>

{#if khatmah.toastMsg}
	<div class="kh-toast">
		<span style="color:var(--kh-green-3)">✓</span>{khatmah.toastMsg}
	</div>
{/if}
