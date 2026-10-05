import pkg from 'file-saver';
const { saveAs } = pkg;
import JSZip from 'jszip';
import exifrPkg from 'exifr';
const { parse } = exifrPkg;

export interface CompressionOptions {
    quality: number;
    maxWidth?: number;
    maxHeight?: number;
    format?: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';
    preserveExif?: boolean;
}

export interface CompressionResult {
    blob: Blob;
    url: string;
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    file: File;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function compressImage(
    file: File,
    options: CompressionOptions
): Promise<CompressionResult> {
    const { quality, maxWidth = 0, maxHeight = 0, format = 'image/jpeg', preserveExif = false } = options;

    if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
    }

    if (!file.type.startsWith('image/')) {
        throw new Error('File is not an image');
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const img = new Image();
                const imgUrl = e.target?.result as string;

                img.onload = async () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Calculate new dimensions while maintaining aspect ratio
                    if (maxWidth && width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                    if (maxHeight && height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');

                    if (!ctx) {
                        reject(new Error('Failed to get canvas context'));
                        return;
                    }

                    // Set white background for transparent images when saving as JPEG
                    if (format === 'image/jpeg') {
                        ctx.fillStyle = 'white';
                        ctx.fillRect(0, 0, width, height);
                    }

                    ctx.drawImage(img, 0, 0, width, height);

                    if (preserveExif && format === 'image/jpeg') {
                        try {
                            const exifData = await parse(file, {
                                xmp: true,
                                icc: true,
                                mergeOutput: true,
                                translateValues: false
                            });
                            if (exifData) {
                                console.log('EXIF data extracted (not preserved in output):', exifData);
                            }
                        } catch (e) {
                            console.warn('Failed to extract EXIF data', e);
                        }
                    }

                    canvas.toBlob(
                        (blob) => {
                            if (!blob) {
                                reject(new Error('Failed to compress image'));
                                return;
                            }

                            const url = URL.createObjectURL(blob);
                            const originalSize = file.size;
                            const compressedSize = blob.size;
                            const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;

                            resolve({
                                blob,
                                url,
                                originalSize,
                                compressedSize,
                                compressionRatio,
                                file
                            });
                        },
                        format,
                        quality / 100
                    );
                };

                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = imgUrl;
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

export async function compressImages(
    files: File[],
    options: CompressionOptions
): Promise<CompressionResult[]> {
    const results: CompressionResult[] = [];

    for (const file of files) {
        if (file.size > MAX_FILE_SIZE) {
            throw new Error(`File ${file.name} exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
        }

        const result = await compressImage(file, options);
        results.push(result);
    }

    return results;
}

export async function downloadAsZip(results: CompressionResult[]): Promise<void> {
    const zip = new JSZip();
    const folder = zip.folder('compressed-images')!;
    results.forEach((result, index) => {
        const ext = result.blob.type.split('/')[1] || 'jpg';
        folder.file(`image-${index + 1}.${ext}`, result.blob);
    });
    try {
        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, 'compressed-images.zip');
    } catch (error) {
        throw new Error('Failed to create zip file');
    }
}

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}