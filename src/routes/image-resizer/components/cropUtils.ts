import { imageResizeStore } from './imageStore.svelte';
import { cropAspectRatios } from './imageUtils';

export function applyCrop(cropContainer: HTMLElement) {
	if (!imageResizeStore.image.originalImage || !cropContainer) return;

	const img = cropContainer.querySelector('img');
	if (!img) return;

	setTimeout(() => {
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const imgRect = img.getBoundingClientRect();
		const containerRect = cropContainer.getBoundingClientRect();

		const imgLeft = imgRect.left - containerRect.left;
		const imgTop = imgRect.top - containerRect.top;
		const imgWidth = imgRect.width;
		const imgHeight = imgRect.height;

		const scaleX = imageResizeStore.image.originalWidth / imgWidth;
		const scaleY = imageResizeStore.image.originalHeight / imgHeight;

		const cropLeft = Math.min(imageResizeStore.crop.cropStartX, imageResizeStore.crop.cropEndX);
		const cropTop = Math.min(imageResizeStore.crop.cropStartY, imageResizeStore.crop.cropEndY);
		const cropRight = Math.max(imageResizeStore.crop.cropStartX, imageResizeStore.crop.cropEndX);
		const cropBottom = Math.max(imageResizeStore.crop.cropStartY, imageResizeStore.crop.cropEndY);

		const cropX = Math.max(0, (cropLeft - imgLeft) * scaleX);
		const cropY = Math.max(0, (cropTop - imgTop) * scaleY);
		const cropWidth = Math.min(
			(cropRight - cropLeft) * scaleX,
			imageResizeStore.image.originalWidth - cropX
		);
		const cropHeight = Math.min(
			(cropBottom - cropTop) * scaleY,
			imageResizeStore.image.originalHeight - cropY
		);

		if (cropWidth <= 0 || cropHeight <= 0) {
			alert('Invalid crop area. Please select a valid area to crop.');
			return;
		}

		canvas.width = Math.round(cropWidth);
		canvas.height = Math.round(cropHeight);

		ctx.imageSmoothingEnabled = true;
		ctx.imageSmoothingQuality = 'high';

		ctx.drawImage(
			imageResizeStore.image.originalImage,
			Math.round(cropX),
			Math.round(cropY),
			Math.round(cropWidth),
			Math.round(cropHeight),
			0,
			0,
			Math.round(cropWidth),
			Math.round(cropHeight)
		);

		canvas.toBlob(
			(blob) => {
				if (blob) {
					if (imageResizeStore.crop.croppedImageUrl) {
						URL.revokeObjectURL(imageResizeStore.crop.croppedImageUrl);
					}
					if (imageResizeStore.image.resizedImageUrl) {
						URL.revokeObjectURL(imageResizeStore.image.resizedImageUrl);
					}

					const croppedUrl = URL.createObjectURL(blob);
					imageResizeStore.crop.croppedImageUrl = croppedUrl;
					imageResizeStore.image.resizedImageUrl = croppedUrl;
					imageResizeStore.image.processedWidth = Math.round(cropWidth);
					imageResizeStore.image.processedHeight = Math.round(cropHeight);

					const newImg = new Image();
					newImg.onload = () => {
						imageResizeStore.image.originalImage = newImg;
						imageResizeStore.image.originalWidth = newImg.width;
						imageResizeStore.image.originalHeight = newImg.height;
						imageResizeStore.resize.targetWidth = newImg.width;
						imageResizeStore.resize.targetHeight = newImg.height;
						imageResizeStore.resize.aspectRatioWidth = newImg.width;
						imageResizeStore.crop.isCropMode = false;
						imageResizeStore.image.processedWidth = newImg.width;
						imageResizeStore.image.processedHeight = newImg.height;
					};
					newImg.src = croppedUrl;
				}
			},
			imageResizeStore.image.selectedFile?.type || 'image/png',
			0.95
		);
	}, 50);
}

export function handleCropMouseDown(e: MouseEvent, cropContainer: HTMLElement) {
	if (!imageResizeStore.crop.isCropMode || !cropContainer) return;
	e.preventDefault();
	imageResizeStore.crop.isDragging = true;
	const rect = cropContainer.getBoundingClientRect();
	const x = e.clientX - rect.left;
	const y = e.clientY - rect.top;

	const img = cropContainer.querySelector('img');
	if (!img) return;

	const imgRect = img.getBoundingClientRect();
	const containerLeft = rect.left;
	const containerTop = rect.top;
	const minX = imgRect.left - containerLeft;
	const minY = imgRect.top - containerTop;
	const maxX = minX + imgRect.width;
	const maxY = minY + imgRect.height;

	if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
		imageResizeStore.crop.cropStartX = x;
		imageResizeStore.crop.cropStartY = y;
		imageResizeStore.crop.cropEndX = x;
		imageResizeStore.crop.cropEndY = y;
	}
}

export function handleCropMouseMove(e: MouseEvent, cropContainer: HTMLElement) {
	if (!imageResizeStore.crop.isCropMode || !cropContainer) return;

	if (!imageResizeStore.crop.isDragging) return;

	e.preventDefault();
	const rect = cropContainer.getBoundingClientRect();
	imageResizeStore.crop.cropEndX = e.clientX - rect.left;
	imageResizeStore.crop.cropEndY = e.clientY - rect.top;

	const img = cropContainer.querySelector('img');
	if (!img) return;

	const imgRect = img.getBoundingClientRect();
	const containerLeft = rect.left;
	const containerTop = rect.top;

	const minX = imgRect.left - containerLeft;
	const minY = imgRect.top - containerTop;
	const maxX = minX + imgRect.width;
	const maxY = minY + imgRect.height;

	imageResizeStore.crop.cropEndX = Math.max(minX, Math.min(imageResizeStore.crop.cropEndX, maxX));
	imageResizeStore.crop.cropEndY = Math.max(minY, Math.min(imageResizeStore.crop.cropEndY, maxY));

	if (imageResizeStore.crop.cropMode === 'aspect') {
		const selectedRatio = cropAspectRatios.find(
			(r) => r.value === imageResizeStore.crop.cropAspectRatio
		);
		let ratio: number;

		if (imageResizeStore.crop.cropAspectRatio === 'original') {
			ratio = imageResizeStore.image.originalWidth / imageResizeStore.image.originalHeight;
		} else if (imageResizeStore.crop.cropAspectRatio === 'custom') {
			ratio = imageResizeStore.crop.cropCustomWidth / imageResizeStore.crop.cropCustomHeight;
		} else {
			ratio = selectedRatio?.ratio || 16 / 9;
		}

		const width = Math.abs(imageResizeStore.crop.cropEndX - imageResizeStore.crop.cropStartX);
		const height = Math.abs(imageResizeStore.crop.cropEndY - imageResizeStore.crop.cropStartY);

		if (width > 0 && height > 0) {
			const currentRatio = width / height;

			if (currentRatio > ratio) {
				const newHeight = width / ratio;
				if (imageResizeStore.crop.cropEndY > imageResizeStore.crop.cropStartY) {
					imageResizeStore.crop.cropEndY = Math.min(
						imageResizeStore.crop.cropStartY + newHeight,
						maxY
					);
				} else {
					imageResizeStore.crop.cropStartY = Math.max(
						imageResizeStore.crop.cropEndY + newHeight,
						minY
					);
				}
			} else {
				const newWidth = height * ratio;
				if (imageResizeStore.crop.cropEndX > imageResizeStore.crop.cropStartX) {
					imageResizeStore.crop.cropEndX = Math.min(
						imageResizeStore.crop.cropStartX + newWidth,
						maxX
					);
				} else {
					imageResizeStore.crop.cropStartX = Math.max(
						imageResizeStore.crop.cropEndX + newWidth,
						minX
					);
				}
			}
		}
	}
}

export function handleCropMouseUp(e: MouseEvent) {
	if (!imageResizeStore.crop.isDragging) return;
	e.preventDefault();
	imageResizeStore.crop.isDragging = false;
}
