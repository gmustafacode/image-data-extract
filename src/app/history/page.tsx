"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";
import ExtractedText from "@/components/ExtractedText";
import type { ImageUploadRecord, HistorySuccessResponse, ErrorResponse, DeleteSuccessResponse } from "@/types";

export default function HistoryPage() {
    const [records, setRecords] = useState<ImageUploadRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const fetchHistory = useCallback(async () => {
        try {
            const response = await fetch("/api/history");
            const data: HistorySuccessResponse | ErrorResponse = await response.json();

            if (!data.success) {
                toast.error(data.error);
                return;
            }

            setRecords(data.data);
        } catch (error) {
            console.error("Fetch history error:", error);
            toast.error("Failed to load upload history.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this record?")) return;

        setDeletingId(id);
        try {
            const response = await fetch(`/api/upload/${id}`, {
                method: "DELETE",
            });

            const data: DeleteSuccessResponse | ErrorResponse = await response.json();

            if (!data.success) {
                toast.error(data.error);
                return;
            }

            setRecords((prev) => prev.filter((r) => r.id !== id));
            toast.success("Record deleted successfully.");
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Failed to delete record.");
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatFileSize = (bytes: number | null) => {
        if (!bytes) return "N/A";
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
            {/* Header */}
            <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                            Upload History
                        </h1>
                    </div>
                    <Link
                        href="/"
                        className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <LoadingSpinner size="lg" />
                        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                            Loading history...
                        </p>
                    </div>
                ) : records.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <svg
                            className="mb-4 h-16 w-16 text-gray-300 dark:text-gray-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                            No uploads yet
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
                            Upload your first image to see it here.
                        </p>
                        <Link
                            href="/"
                            className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                        >
                            Upload an Image
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {records.length} upload{records.length !== 1 ? "s" : ""}
                        </p>

                        {records.map((record) => (
                            <div
                                key={record.id}
                                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                            >
                                <div className="flex flex-col sm:flex-row">
                                    {/* Thumbnail */}
                                    <div className="relative h-48 w-full flex-shrink-0 sm:h-auto sm:w-48">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={record.imageUrl}
                                            alt={record.fileName ?? "Uploaded image"}
                                            className="h-full w-full object-cover bg-gray-100 dark:bg-gray-900"
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="flex flex-1 flex-col justify-between p-4">
                                        <div>
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate max-w-xs">
                                                        {record.fileName ?? "Untitled"}
                                                    </h3>
                                                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                                                        <span>{formatDate(record.createdAt)}</span>
                                                        <span>•</span>
                                                        <span>{formatFileSize(record.fileSize)}</span>
                                                        {record.mimeType && (
                                                            <>
                                                                <span>•</span>
                                                                <span>{record.mimeType}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => handleDelete(record.id)}
                                                    disabled={deletingId === record.id}
                                                    className="flex-shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                                                    title="Delete"
                                                >
                                                    {deletingId === record.id ? (
                                                        <LoadingSpinner size="sm" />
                                                    ) : (
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>

                                            {/* Extracted text preview */}
                                            {record.extractedText && (
                                                <div className="mt-3">
                                                    <button
                                                        onClick={() =>
                                                            setExpandedId(
                                                                expandedId === record.id ? null : record.id
                                                            )
                                                        }
                                                        className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                                    >
                                                        <svg
                                                            className={`h-3 w-3 transition-transform ${expandedId === record.id ? "rotate-90" : ""
                                                                }`}
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                            strokeWidth={2}
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                                        </svg>
                                                        {expandedId === record.id
                                                            ? "Hide extracted text"
                                                            : "Show extracted text"}
                                                    </button>

                                                    {expandedId === record.id && (
                                                        <div className="mt-2">
                                                            <ExtractedText text={record.extractedText} />
                                                        </div>
                                                    )}

                                                    {expandedId !== record.id && (
                                                        <p className="mt-1 text-xs text-gray-500 line-clamp-2 dark:text-gray-400">
                                                            {record.extractedText}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
