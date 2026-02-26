"use client";

import { useState } from "react";
import { toast } from "sonner";
import ImageUploader from "@/components/ImageUploader";
import ImagePreview from "@/components/ImagePreview";
import ExtractedText from "@/components/ExtractedText";
import LoadingSpinner from "@/components/LoadingSpinner";
import Link from "next/link";
import type { UploadResponse, ImageUploadRecord } from "@/types";

export default function HomePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<ImageUploadRecord | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setResult(null);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleRemoveFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select an image first.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data: UploadResponse = await response.json();

      if (!data.success) {
        toast.error(data.error);
        return;
      }

      setResult(data.data);
      toast.success("Image uploaded and text extracted successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Image Text Extractor
            </h1>
          </div>
          <Link
            href="/history"
            className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            History
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            Extract Text from Images
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Upload an image and let AI extract all readable text from it instantly.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column: Upload */}
          <div className="space-y-4">
            <ImageUploader
              onFileSelect={handleFileSelect}
              isUploading={isUploading}
            />

            {previewUrl && (
              <ImagePreview
                src={previewUrl}
                fileName={selectedFile?.name}
                onRemove={handleRemoveFile}
              />
            )}

            {selectedFile && !isUploading && (
              <button
                onClick={handleUpload}
                className="w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              >
                Extract Text
              </button>
            )}

            {isUploading && (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-6 py-6 dark:border-blue-900 dark:bg-blue-950/30">
                <LoadingSpinner size="lg" />
                <div className="text-center">
                  <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                    Processing your image...
                  </p>
                  <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                    Uploading to storage and extracting text with AI
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Results */}
          <div className="space-y-4">
            {result ? (
              <>
                <ImagePreview
                  src={result.imageUrl}
                  fileName={result.fileName ?? undefined}
                />
                {result.extractedText && (
                  <ExtractedText text={result.extractedText} />
                )}
                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Upload Details
                  </h4>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500 dark:text-gray-400">File Size</dt>
                      <dd className="font-medium text-gray-700 dark:text-gray-300">
                        {result.fileSize
                          ? `${(result.fileSize / 1024).toFixed(1)} KB`
                          : "N/A"}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500 dark:text-gray-400">Type</dt>
                      <dd className="font-medium text-gray-700 dark:text-gray-300">
                        {result.mimeType ?? "N/A"}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500 dark:text-gray-400">Uploaded</dt>
                      <dd className="font-medium text-gray-700 dark:text-gray-300">
                        {new Date(result.createdAt).toLocaleString()}
                      </dd>
                    </div>
                  </dl>
                </div>
              </>
            ) : (
              <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/30">
                <svg
                  className="mb-3 h-12 w-12 text-gray-300 dark:text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
                  Extracted text will appear here
                </p>
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-600">
                  Upload an image to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
