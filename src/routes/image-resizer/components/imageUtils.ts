import { imageResizeStore } from './imageStore.svelte';

export const cropAspectRatios = [
	{ label: '16:9 (Widescreen)', value: '16:9', ratio: 16 / 9 },
	{ label: '4:3 (Standard)', value: '4:3', ratio: 4 / 3 },
	{ label: '1:1 (Square)', value: '1:1', ratio: 1 },
	{ label: '9:16 (Portrait)', value: '9:16', ratio: 9 / 16 },
	{ label: '21:9 (Ultra Wide)', value: '21:9', ratio: 21 / 9 },
	{ label: 'Original', value: 'original', ratio: 0 },
	{ label: 'Custom', value: 'custom', ratio: 0 }
];

export const aspectRatios = [
	{ label: '16:9 (Widescreen)', value: '16:9', ratio: 16 / 9 },
	{ label: '4:3 (Standard)', value: '4:3', ratio: 4 / 3 },
	{ label: '1:1 (Square)', value: '1:1', ratio: 1 },
	{ label: '9:16 (Portrait)', value: '9:16', ratio: 9 / 16 },
	{ label: '21:9 (Ultra Wide)', value: '21:9', ratio: 21 / 9 },
	{ label: 'Custom', value: 'custom', ratio: 0 }
];

export function loadImageFromFile(file: File): Promise<{ image: HTMLImageElement; url: string }> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = (e) => {
			const imageUrl = e.target?.result as string;
			const img = new Image();
			img.onload = () => {
				resolve({ image: img, url: imageUrl });
			};
			img.onerror = reject;
			img.src = imageUrl;
		};

		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
}

export function calculateImageScale(
	originalWidth: number,
	originalHeight: number,
	container: HTMLElement
): { scale: number; offsetX: number; offsetY: number } {
	const img = container.querySelector('img');
	if (!img) return { scale: 1, offsetX: 0, offsetY: 0 };

	const containerRect = container.getBoundingClientRect();
	const imgRect = img.getBoundingClientRect();
	const containerLeft = containerRect.left;
	const containerTop = containerRect.top;

	const scale = imgRect.width / originalWidth;
	const offsetX = imgRect.left - containerLeft;
	const offsetY = imgRect.top - containerTop;

	return { scale, offsetX, offsetY };
}

export function resetCropArea(
	originalWidth: number,
	originalHeight: number,
	container: HTMLElement
): { startX: number; startY: number; endX: number; endY: number } {
	const img = container.querySelector('img');
	if (!img) return { startX: 0, startY: 0, endX: 0, endY: 0 };

	const imgRect = img.getBoundingClientRect();
	const containerLeft = container.getBoundingClientRect().left;
	const containerTop = container.getBoundingClientRect().top;

	const startX = imgRect.left - containerLeft;
	const startY = imgRect.top - containerTop;
	const endX = startX + imgRect.width;
	const endY = startY + imgRect.height;

	return { startX, startY, endX, endY };
}
