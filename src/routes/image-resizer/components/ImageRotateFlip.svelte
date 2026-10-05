<script lang="ts">
	import { Button, Label } from '$lib/shared/components/ui';
	import { rotateImage, flipImage } from './imageProcessing';
</script>

<section
	class="rounded-xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900"
>
	<h2 class="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-100">Rotate & Flip</h2>

	<div class="space-y-4">
		<div class="flex flex-col items-center justify-between gap-3 lg:flex-row">
			<div>
				<Label class="mb-2 block text-slate-900 dark:text-slate-100">Rotate</Label>
				<div class="grid grid-cols-2 gap-3">
					<Button
						onclick={() => rotateImage(false)}
						class="flex w-full items-center justify-center gap-2"
					>
						<span>Rotate -90°</span>
					</Button>
					<Button
						onclick={() => rotateImage(true)}
						class="flex w-full items-center justify-center gap-2"
					>
						<span>Rotate +90°</span>
					</Button>
				</div>
			</div>

			<div>
				<Label class="mb-2 block text-slate-900 dark:text-slate-100">Flip</Label>
				<div class="grid grid-cols-2 gap-3">
					<Button onclick={() => flipImage(true)} class="w-full"> Flip Horizontal </Button>
					<Button onclick={() => flipImage(false)} class="w-full"> Flip Vertical </Button>
				</div>
			</div>
		</div>
	</div>
</section>
