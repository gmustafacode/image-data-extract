"use client";

import { useCallback, useRef, useState, type DragEvent, type ChangeEvent } from "react";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from "@/types";

interface ImageUploaderProps {
    onFileSelect: (file: File) => void;
    isUploading: boolean;
}

export default function ImageUploader({
    onFileSelect,
    isUploading,
}: ImageUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateFile = useCallback((file: File): string | null => {
        if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
            return "Invalid file type. Please upload a JPEG, PNG, WebP, GIF, or BMP image.";
        }
        if (file.size > MAX_FILE_SIZE) {
            return `File is too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`;
        }
        return null;
    }, []);

    const handleFile = useCallback(
        (file: File) => {
            setError(null);
            const validationError = validateFile(file);
            if (validationError) {
                setError(validationError);
                return;
            }
            onFileSelect(file);
        },
        [onFileSelect, validateFile]
    );

    const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback(
        (e: DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFile(files[0]);
            }
        },
        [handleFile]
    );

    const handleInputChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (files && files.length > 0) {
                handleFile(files[0]);
            }
            // Reset input so same file can be selected again
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        },
        [handleFile]
    );

    const handleClick = useCallback(() => {
        if (!isUploading) {
            fileInputRef.current?.click();
        }
    }, [isUploading]);

    return (
        <div className="w-full">
            <div
                onClick={handleClick}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`
          relative cursor-pointer rounded-xl border-2 border-dashed p-8
          transition-all duration-200 ease-in-out
          ${isDragging
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                        : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800/50 dark:hover:border-gray-500 dark:hover:bg-gray-800"
                    }
          ${isUploading ? "pointer-events-none opacity-60" : ""}
        `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={ALLOWED_MIME_TYPES.join(",")}
                    onChange={handleInputChange}
                    className="hidden"
                    disabled={isUploading}
                />

                <div className="flex flex-col items-center gap-3">
                    {/* Upload Icon */}
                    <div
                        className={`rounded-full p-3 ${isDragging
                                ? "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
                                : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                            }`}
                    >
                        <svg
                            className="h-8 w-8"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                            />
                        </svg>
                    </div>

                    <div className="text-center">
                        <p className="text-base font-semibold text-gray-700 dark:text-gray-200">
                            {isDragging ? "Drop your image here" : "Drag & drop an image here"}
                        </p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            or{" "}
                            <span className="font-medium text-blue-600 dark:text-blue-400">
                                click to browse
                            </span>
                        </p>
                    </div>

                    <p className="text-xs text-gray-400 dark:text-gray-500">
                        JPEG, PNG, WebP, GIF, BMP — up to 10MB
                    </p>
                </div>
            </div>

            {error && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
                    <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                        />
                    </svg>
                    {error}
                </div>
            )}
        </div>
    );
}
