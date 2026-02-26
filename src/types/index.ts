import { z } from "zod/v4";

/** Allowed image MIME types */
export const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/bmp",
] as const;

/** Maximum file size: 10MB */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** Zod schema for validating uploaded files */
export const uploadFileSchema = z.object({
    name: z.string().min(1, "File name is required"),
    size: z
        .number()
        .max(MAX_FILE_SIZE, `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`),
    type: z.enum(ALLOWED_MIME_TYPES as unknown as [string, ...string[]], {
        message: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF, BMP",
    }),
});

/** Shape of an image upload record returned from the API */
export interface ImageUploadRecord {
    id: string;
    imageUrl: string;
    extractedText: string | null;
    fileName: string | null;
    fileSize: number | null;
    mimeType: string | null;
    createdAt: string;
    updatedAt: string;
}

/** Shape of the upload API success response */
export interface UploadSuccessResponse {
    success: true;
    data: ImageUploadRecord;
}

/** Shape of the upload API error response */
export interface UploadErrorResponse {
    success: false;
    error: string;
}

/** Union type for upload API responses */
export type UploadResponse = UploadSuccessResponse | UploadErrorResponse;

/** Shape of the history API success response */
export interface HistorySuccessResponse {
    success: true;
    data: ImageUploadRecord[];
}

/** Shape of the delete API success response */
export interface DeleteSuccessResponse {
    success: true;
    message: string;
}

/** Shape of a generic error response */
export interface ErrorResponse {
    success: false;
    error: string;
}
