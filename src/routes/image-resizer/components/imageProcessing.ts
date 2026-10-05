import { imageResizeStore } from './imageStore.svelte';

export function rotateImage(clockwise: boolean) {
	if (!imageResizeStore.image.originalImage) return;

	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');
	if (!ctx) return;

	if (clockwise) {
		canvas.width = imageResizeStore.image.originalHeight;
		canvas.height = imageResizeStore.image.originalWidth;
		ctx.translate(imageResizeStore.image.originalHeight, 0);
		ctx.rotate(Math.PI / 2);
	} else {
		canvas.width = imageResizeStore.image.originalHeight;
		canvas.height = imageResizeStore.image.originalWidth;
		ctx.translate(0, imageResizeStore.image.originalWidth);
		ctx.rotate(-Math.PI / 2);
	}

	ctx.imageSmoothingEnabled = true;
	ctx.imageSmoothingQuality = 'high';
	ctx.drawImage(imageResizeStore.image.originalImage, 0, 0);

	canvas.toBlob(
		(blob) => {
			if (blob) {
				if (imageResizeStore.crop.croppedImageUrl) {
					URL.revokeObjectURL(imageResizeStore.crop.croppedImageUrl);
				}
				if (imageResizeStore.image.resizedImageUrl) {
					URL.revokeObjectURL(imageResizeStore.image.resizedImageUrl);
				}

				const rotatedUrl = URL.createObjectURL(blob);
				imageResizeStore.crop.croppedImageUrl = rotatedUrl;
				imageResizeStore.image.resizedImageUrl = rotatedUrl;

				const newImg = new Image();
				newImg.onload = () => {
					imageResizeStore.image.originalImage = newImg;
					imageResizeStore.image.originalWidth = newImg.width;
					imageResizeStore.image.originalHeight = newImg.height;
					imageResizeStore.resize.targetWidth = newImg.width;
					imageResizeStore.resize.targetHeight = newImg.height;
					imageResizeStore.resize.aspectRatioWidth = newImg.width;
					imageResizeStore.image.processedWidth = newImg.width;
					imageResizeStore.image.processedHeight = newImg.height;
				};
				newImg.src = rotatedUrl;
			}
		},
		imageResizeStore.image.selectedFile?.type || 'image/png',
		0.95
	);
}

export function flipImage(horizontal: boolean) {
	if (!imageResizeStore.image.originalImage) return;

	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');
	if (!ctx) return;

	canvas.width = imageResizeStore.image.originalWidth;
	canvas.height = imageResizeStore.image.originalHeight;

	ctx.imageSmoothingEnabled = true;
	ctx.imageSmoothingQuality = 'high';

	if (horizontal) {
		ctx.translate(imageResizeStore.image.originalWidth, 0);
		ctx.scale(-1, 1);
	} else {
		ctx.translate(0, imageResizeStore.image.originalHeight);
		ctx.scale(1, -1);
	}

	ctx.drawImage(imageResizeStore.image.originalImage, 0, 0);

	canvas.toBlob(
		(blob) => {
			if (blob) {
				if (imageResizeStore.crop.croppedImageUrl) {
					URL.revokeObjectURL(imageResizeStore.crop.croppedImageUrl);
				}
				if (imageResizeStore.image.resizedImageUrl) {
					URL.revokeObjectURL(imageResizeStore.image.resizedImageUrl);
				}

				const flippedUrl = URL.createObjectURL(blob);
				imageResizeStore.crop.croppedImageUrl = flippedUrl;
				imageResizeStore.image.resizedImageUrl = flippedUrl;

				const newImg = new Image();
				newImg.onload = () => {
					imageResizeStore.image.originalImage = newImg;
					imageResizeStore.image.originalWidth = newImg.width;
					imageResizeStore.image.originalHeight = newImg.height;
					imageResizeStore.resize.targetWidth = newImg.width;
					imageResizeStore.resize.targetHeight = newImg.height;
					imageResizeStore.resize.aspectRatioWidth = newImg.width;
					imageResizeStore.image.processedWidth = newImg.width;
					imageResizeStore.image.processedHeight = newImg.height;
				};
				newImg.src = flippedUrl;
			}
		},
		imageResizeStore.image.selectedFile?.type || 'image/png',
		0.95
	);
}

export function resizeImage() {
	if (!imageResizeStore.image.originalImage) return;

	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');
	if (!ctx) return;

	let newWidth: number = 0;
	let newHeight: number = 0;

	switch (imageResizeStore.resize.resizeMode) {
		case 'percentage':
			newWidth = Math.round(
				imageResizeStore.image.originalWidth * (imageResizeStore.resize.resizePercentage / 100)
			);
			newHeight = Math.round(
				imageResizeStore.image.originalHeight * (imageResizeStore.resize.resizePercentage / 100)
			);
			break;

		case 'pixel':
			if (imageResizeStore.resize.maintainAspectRatio) {
				const aspectRatio =
					imageResizeStore.image.originalWidth / imageResizeStore.image.originalHeight;
				newWidth = imageResizeStore.resize.targetWidth;
				newHeight = Math.round(imageResizeStore.resize.targetWidth / aspectRatio);
			} else {
				newWidth = imageResizeStore.resize.targetWidth;
				newHeight = imageResizeStore.resize.targetHeight;
			}
			break;

		case 'aspect': {
			const aspectRatios = [
				{ label: '16:9 (Widescreen)', value: '16:9', ratio: 16 / 9 },
				{ label: '4:3 (Standard)', value: '4:3', ratio: 4 / 3 },
				{ label: '1:1 (Square)', value: '1:1', ratio: 1 },
				{ label: '9:16 (Portrait)', value: '9:16', ratio: 9 / 16 },
				{ label: '21:9 (Ultra Wide)', value: '21:9', ratio: 21 / 9 },
				{ label: 'Custom', value: 'custom', ratio: 0 }
			];
			const selectedRatio = aspectRatios.find(
				(r) => r.value === imageResizeStore.resize.aspectRatioPreset
			);
			let ratio: number;

			if (imageResizeStore.resize.aspectRatioPreset === 'custom') {
				ratio =
					imageResizeStore.resize.customAspectWidth / imageResizeStore.resize.customAspectHeight;
			} else {
				ratio = selectedRatio?.ratio || 16 / 9;
			}

			newWidth = imageResizeStore.resize.aspectRatioWidth;
			newHeight = Math.round(imageResizeStore.resize.aspectRatioWidth / ratio);
			break;
		}
	}

	canvas.width = newWidth;
	canvas.height = newHeight;

	ctx.imageSmoothingEnabled = true;
	ctx.imageSmoothingQuality = 'high';
	ctx.drawImage(imageResizeStore.image.originalImage, 0, 0, newWidth, newHeight);

	canvas.toBlob(
		(blob) => {
			if (blob) {
				if (imageResizeStore.image.resizedImageUrl) {
					URL.revokeObjectURL(imageResizeStore.image.resizedImageUrl);
				}
				imageResizeStore.image.resizedImageUrl = URL.createObjectURL(blob);
				imageResizeStore.image.processedWidth = newWidth;
				imageResizeStore.image.processedHeight = newHeight;

				const img = new Image();
				img.onload = () => {
					imageResizeStore.image.processedWidth = img.width;
					imageResizeStore.image.processedHeight = img.height;
				};
				img.src = imageResizeStore.image.resizedImageUrl;
			}
		},
		imageResizeStore.image.selectedFile?.type || 'image/png',
		0.95
	);
}

export function downloadImage() {
	if (!imageResizeStore.image.resizedImageUrl || !imageResizeStore.image.originalImage) return;

	if (imageResizeStore.download.downloadFormat === 'svg') {
		const img = new Image();
		img.crossOrigin = 'anonymous';
		img.onload = () => {
			const canvas = document.createElement('canvas');
			canvas.width = imageResizeStore.image.processedWidth || img.width;
			canvas.height = imageResizeStore.image.processedHeight || img.height;
			const ctx = canvas.getContext('2d');
			if (!ctx) return;

			ctx.drawImage(img, 0, 0);
			const dataUrl = canvas.toDataURL('image/png');

			const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${imageResizeStore.image.processedWidth || img.width}" height="${imageResizeStore.image.processedHeight || img.height}" xmlns="http://www.w3.org/2000/svg">
	<image href="${dataUrl}" width="${imageResizeStore.image.processedWidth || img.width}" height="${imageResizeStore.image.processedHeight || img.height}"/>
</svg>`;

			const blob = new Blob([svgContent], { type: 'image/svg+xml' });
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			const timestamp = Date.now();
			link.download = `${timestamp}.svg`;
			link.click();
			URL.revokeObjectURL(url);
		};
		img.src = imageResizeStore.image.resizedImageUrl;
	} else {
		const img = new Image();
		img.crossOrigin = 'anonymous';
		img.onload = () => {
			const canvas = document.createElement('canvas');
			canvas.width = imageResizeStore.image.processedWidth || img.width;
			canvas.height = imageResizeStore.image.processedHeight || img.height;
			const ctx = canvas.getContext('2d');
			if (!ctx) return;

			ctx.drawImage(img, 0, 0);

			let mimeType: string;
			let quality: number | undefined = 0.95;

			switch (imageResizeStore.download.downloadFormat) {
				case 'jpg':
					mimeType = 'image/jpeg';
					break;
				case 'webp':
					mimeType = 'image/webp';
					break;
				case 'png':
				default:
					mimeType = 'image/png';
					quality = undefined;
					break;
			}

			canvas.toBlob(
				(blob) => {
					if (blob) {
						const url = URL.createObjectURL(blob);
						const link = document.createElement('a');
						link.href = url;
						const timestamp = Date.now();
						link.download = `${timestamp}.${imageResizeStore.download.downloadFormat}`;
						link.click();
						URL.revokeObjectURL(url);
					}
				},
				mimeType,
				quality
			);
		};
		img.src = imageResizeStore.image.resizedImageUrl;
	}
}
