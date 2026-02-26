"use client";

interface ImagePreviewProps {
    src: string;
    fileName?: string;
    onRemove?: () => void;
}

export default function ImagePreview({
    src,
    fileName,
    onRemove,
}: ImagePreviewProps) {
    return (
        <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="relative aspect-video w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={src}
                    alt={fileName ?? "Preview"}
                    className="h-full w-full object-contain bg-gray-50 dark:bg-gray-900"
                />
            </div>

            {(fileName || onRemove) && (
                <div className="flex items-center justify-between border-t border-gray-200 px-4 py-2 dark:border-gray-700">
                    {fileName && (
                        <p className="truncate text-sm text-gray-600 dark:text-gray-300">
                            {fileName}
                        </p>
                    )}
                    {onRemove && (
                        <button
                            onClick={onRemove}
                            className="ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                        >
                            <svg
                                className="h-3.5 w-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                            Remove
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
