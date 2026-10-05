<script lang="ts">
	import { Button } from '$lib/shared/components/ui';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/shared/components/ui/card';
	import { downloadQRCode, downloadQRCodeAsPDF, downloadQRCodeAsSVG } from '../utils/downloads';

	interface Props {
		qrCodeUrl: string;
		isGenerating: boolean;
		error: string;
		selectedType: string;
		typeLabel: string;
		qrContent?: string;
		qrOptions?: {
			size: number;
			foregroundColor: string;
			backgroundColor: string;
			errorCorrection: 'L' | 'M' | 'Q' | 'H';
		};
	}

	let { qrCodeUrl, isGenerating, error, selectedType, typeLabel, qrContent, qrOptions }: Props =
		$props();

	function handleDownloadPNG() {
		downloadQRCode(qrCodeUrl, selectedType);
	}

	function handleDownloadPDF() {
		downloadQRCodeAsPDF(qrCodeUrl);
	}

	async function handleDownloadSVG() {
		if (qrContent && qrOptions) {
			await downloadQRCodeAsSVG(qrContent, selectedType, qrOptions);
		}
	}
</script>

<Card>
	<CardHeader>
		<CardTitle>QR Code Preview</CardTitle>
	</CardHeader>
	<CardContent class="overflow-hidden">
		<div class="flex flex-col items-center">
			{#if isGenerating}
				<div class="text-center">
					<div
						class="mb-2 inline-block h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600"
					></div>
					<div>Generating QR code...</div>
				</div>
			{:else if qrCodeUrl}
				<div class="w-full text-center">
					<div class="mx-auto mb-4 flex max-w-md justify-center overflow-hidden">
						<img
							src={qrCodeUrl}
							alt="Generated QR Code for {typeLabel}"
							class="h-auto max-w-full rounded-lg"
						/>
					</div>
					<!-- Mobile-optimized download buttons with thumb-friendly touch targets (min 44x44px) -->
					<div class="flex flex-wrap justify-center gap-3">
						<Button
							type="button"
							class="min-h-[44px] min-w-[120px] rounded bg-slate-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800 active:scale-95"
							onclick={handleDownloadPNG}
							aria-label="Download QR code as PNG image"
						>
							Download PNG
						</Button>
						<Button
							type="button"
							class="min-h-[44px] min-w-[120px] rounded bg-purple-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-purple-600 active:scale-95"
							onclick={handleDownloadSVG}
							aria-label="Download QR code as SVG vector"
						>
							Download SVG
						</Button>
						<Button
							type="button"
							class="min-h-[44px] min-w-[120px] rounded bg-green-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-green-600 active:scale-95"
							onclick={handleDownloadPDF}
							aria-label="Download QR code as PDF document"
						>
							Download PDF
						</Button>
					</div>
				</div>
			{:else}
				<div
					class="flex h-64 w-full items-center justify-center rounded-lg border-2 border-dashed border-slate-300 "
				>
					<p class="p-4 text-slate-500 ">
						{error ? 'Fix errors to generate QR code' : 'Fill in the details to generate QR code'}
					</p>
				</div>
			{/if}
		</div>
	</CardContent>
</Card>
