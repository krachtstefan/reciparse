const MAX_DIMENSION = 1536;
const FILE_EXTENSION_RE = /\.[^.]+$/;

/**
 * Resizes an image file so its longest side is at most {@link MAX_DIMENSION}px.
 * Uses an off-screen canvas to avoid adding external dependencies.
 * Returns the original file unchanged when it already fits within the limit.
 */
export async function resizeImage(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;

  if (width <= MAX_DIMENSION && height <= MAX_DIMENSION) {
    bitmap.close();
    return file;
  }

  const scale = MAX_DIMENSION / Math.max(width, height);
  const targetWidth = Math.round(width * scale);
  const targetHeight = Math.round(height * scale);

  const canvas = new OffscreenCanvas(targetWidth, targetHeight);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Failed to get canvas 2d context");
  }

  ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
  bitmap.close();

  const blob = await canvas.convertToBlob({
    type: "image/jpeg",
    quality: 0.85,
  });

  return new File([blob], file.name.replace(FILE_EXTENSION_RE, ".jpg"), {
    type: "image/jpeg",
  });
}
