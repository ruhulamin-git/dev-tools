<script lang="ts">
	import { browser } from '$app/environment';
	import { Button } from '$lib/shared/components/ui';
	import { generateQRDataURL } from '../../qr-code-generator/utils/qr-browser';

	interface Props {
		password: string;
	}

	let { password }: Props = $props();

	let qrCodeDataUrl = $state<string>('');
	let showQR = $state(false);

	const generateQRCode = async () => {
		if (!browser || !password) return;

		try {
			qrCodeDataUrl = await generateQRDataURL(password, {
				width: 256,
				margin: 2
			});
		} catch (error) {
			console.error('Error generating QR code:', error);
		}
	};

	const downloadQRCode = () => {
		if (!browser || !qrCodeDataUrl) return;

		const link = document.createElement('a');
		link.download = 'password-qrcode.png';
		link.href = qrCodeDataUrl;
		link.click();
	};

	$effect(() => {
		if (showQR && password) {
			generateQRCode();
		}
	});
</script>

<div class="my-6">
	<Button
		type="button"
		variant="outline"
		onclick={() => {
			showQR = !showQR;
		}}
		class="w-full bg-slate-900 text-white shadow-lg dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-50"
	>
		{showQR ? 'Hide QR Code' : 'Show QR Code'}
	</Button>

	{#if showQR && password}
		<div
			class="mt-4 flex flex-col items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
		>
			{#if qrCodeDataUrl}
				<img src={qrCodeDataUrl} alt="Password QR Code" class="rounded-lg" />
				<Button type="button" variant="outline" onclick={downloadQRCode} size="sm" class="bg-slate-900 text-white shadow-lg dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-50">
					Download QR Code
				</Button>
			{:else}
				<div class="flex h-64 w-64 items-center justify-center">
					<div
						class="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-600"
					></div>
				</div>
			{/if}
			<p class="text-center text-xs text-slate-900 dark:text-slatw-100">
				Scan this QR code with your mobile device to easily copy the password
			</p>
		</div>
	{/if}
</div>
