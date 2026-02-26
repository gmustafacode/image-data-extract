"use client";

import { useState } from "react";
import { toast } from "sonner";

interface ExtractedTextProps {
    text: string;
}

export default function ExtractedText({ text }: ExtractedTextProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            toast.success("Text copied to clipboard!");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Failed to copy text.");
        }
    };

    return (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <svg
                        className="h-4 w-4 text-green-600 dark:text-green-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        Extracted Text
                    </h3>
                </div>

                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                    {copied ? (
                        <>
                            <svg
                                className="h-3.5 w-3.5 text-green-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                            Copied!
                        </>
                    ) : (
                        <>
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
                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                            </svg>
                            Copy
                        </>
                    )}
                </button>
            </div>

            <div className="p-4">
                <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    {text}
                </pre>
            </div>
        </div>
    );
}
