<script lang="ts">
	import { Label, Select, Slider, Input } from '$lib/shared/components/ui';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/shared/components/ui/card';
	import type { QRCodeOptions } from '../types';

	interface Props {
		options: QRCodeOptions;
		onUpdate: (options: QRCodeOptions) => void;
	}

	let { options, onUpdate }: Props = $props();

	// Local state for size to enable binding with Slider
	let size = $state(options.size);

	// Ensure color values are always valid hex colors
	const foregroundColor = $derived(options.foregroundColor || '#000000');
	const backgroundColor = $derived(options.backgroundColor || '#ffffff');

	// Sync size when options change externally
	$effect(() => {
		size = options.size;
	});

	// Update options when size changes
	$effect(() => {
		if (size !== options.size) {
			updateOption('size', size);
		}
	});

	function updateOption<K extends keyof QRCodeOptions>(key: K, value: QRCodeOptions[K]): void {
		onUpdate({
			...options,
			[key]: value
		});
	}

	function handleInput(field: keyof QRCodeOptions) {
		return (event: Event) => {
			const target = event.target as HTMLInputElement | HTMLSelectElement;
			const value = field === 'size' ? parseInt(target.value) : target.value;
			updateOption(field, value as QRCodeOptions[typeof field]);
		};
	}
</script>

<Card>
	<CardHeader>
		<CardTitle>Customize QR Code</CardTitle>
	</CardHeader>
	<CardContent>
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<!-- Size Range Input -->
			<div class="flex flex-col gap-1.5">
				<Label htmlFor="size-range">
					Size: <span class="font-semibold">{size}px</span>
				</Label>
				<Slider id="size-range" min={200} max={800} step={50} bind:value={size} class="w-full" />
			</div>

			<!-- Error Correction Select -->
			<div class="flex flex-col gap-1.5">
				<Label htmlFor="error-correction-select">Error Correction</Label>
				<Select
					id="error-correction-select"
					value={options.errorCorrection}
					onchange={(val) => handleInput('errorCorrection')({ target: { value: val } } as any)}
					options={[
						{ value: 'L', label: 'Low (7%)' },
						{ value: 'M', label: 'Medium (15%)' },
						{ value: 'Q', label: 'Quartile (25%)' },
						{ value: 'H', label: 'High (30%)' }
					]}
				/>
			</div>

			<!-- Foreground Color Input -->
			<div class="flex flex-col gap-1.5">
				<Label htmlFor="foreground-color">Foreground Color</Label>
				<Input
					id="foreground-color"
					type="color"
					value={foregroundColor}
					oninput={handleInput('foregroundColor')}
					class="h-10 w-full cursor-pointer p-1"
				/>
			</div>

			<!-- Background Color Input -->
			<div class="flex flex-col gap-1.5">
				<Label htmlFor="background-color">Background Color</Label>
				<Input
					id="background-color"
					type="color"
					value={backgroundColor}
					oninput={handleInput('backgroundColor')}
					class="h-10 w-full cursor-pointer p-1"
				/>
			</div>
		</div>
	</CardContent>
</Card>
