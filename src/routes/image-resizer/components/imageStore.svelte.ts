export interface ImageState {
	selectedFile: File | null;
	originalImage: HTMLImageElement | null;
	originalImageUrl: string | null;
	resizedImageUrl: string | null;
	originalWidth: number;
	originalHeight: number;
	originalUploadedWidth: number;
	originalUploadedHeight: number;
	processedWidth: number;
	processedHeight: number;
}

export interface CropState {
	isCropMode: boolean;
	cropMode: 'aspect' | 'custom';
	cropAspectRatio: string;
	cropCustomWidth: number;
	cropCustomHeight: number;
	croppedImageUrl: string | null;
	cropStartX: number;
	cropStartY: number;
	cropEndX: number;
	cropEndY: number;
	isDragging: boolean;
	imageScale: number;
	imageOffsetX: number;
	imageOffsetY: number;
	cropContainer: HTMLElement | null;
}

export interface ResizeState {
	resizeMode: 'percentage' | 'pixel' | 'aspect';
	resizePercentage: number;
	targetWidth: number;
	targetHeight: number;
	maintainAspectRatio: boolean;
	aspectRatioPreset: string;
	aspectRatioWidth: number;
	customAspectWidth: number;
	customAspectHeight: number;
}

export interface DownloadState {
	downloadFormat: 'png' | 'jpg' | 'webp' | 'svg';
}

class ImageResizeStore {
	image: ImageState = $state({
		selectedFile: null,
		originalImage: null,
		originalImageUrl: null,
		resizedImageUrl: null,
		originalWidth: 0,
		originalHeight: 0,
		originalUploadedWidth: 0,
		originalUploadedHeight: 0,
		processedWidth: 0,
		processedHeight: 0
	});

	crop: CropState = $state({
		isCropMode: false,
		cropMode: 'aspect',
		cropAspectRatio: '16:9',
		cropCustomWidth: 16,
		cropCustomHeight: 9,
		croppedImageUrl: null,
		cropStartX: 0,
		cropStartY: 0,
		cropEndX: 0,
		cropEndY: 0,
		isDragging: false,
		imageScale: 1,
		imageOffsetX: 0,
		imageOffsetY: 0,
		cropContainer: null
	});

	resize: ResizeState = $state({
		resizeMode: 'percentage',
		resizePercentage: 100,
		targetWidth: 800,
		targetHeight: 600,
		maintainAspectRatio: true,
		aspectRatioPreset: '16:9',
		aspectRatioWidth: 1920,
		customAspectWidth: 16,
		customAspectHeight: 9
	});

	download: DownloadState = $state({
		downloadFormat: 'png'
	});

	reset() {
		if (this.image.resizedImageUrl) {
			URL.revokeObjectURL(this.image.resizedImageUrl);
		}
		if (this.crop.croppedImageUrl) {
			URL.revokeObjectURL(this.crop.croppedImageUrl);
		}
		this.image.selectedFile = null;
		this.image.originalImage = null;
		this.image.originalImageUrl = null;
		this.image.resizedImageUrl = null;
		this.image.originalUploadedWidth = 0;
		this.image.originalUploadedHeight = 0;
		this.image.processedWidth = 0;
		this.image.processedHeight = 0;
		this.crop.isCropMode = false;
		this.crop.croppedImageUrl = null;
		this.resize.resizePercentage = 100;
		this.resize.targetWidth = 800;
		this.resize.targetHeight = 600;
		this.resize.maintainAspectRatio = true;
		this.resize.aspectRatioPreset = '16:9';
		this.resize.aspectRatioWidth = 1920;
	}
}

export const imageResizeStore = new ImageResizeStore();
