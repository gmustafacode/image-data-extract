import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { uploadToSupabase, insertUploadRecord } from "@/lib/supabase";
import { extractTextFromImage } from "@/lib/groq";
import {
    uploadFileSchema,
    ALLOWED_MIME_TYPES,
    MAX_FILE_SIZE,
    type UploadResponse,
} from "@/types";

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 10; // max requests per window

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now > entry.resetTime) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return false;
    }

    entry.count++;
    return entry.count > RATE_LIMIT_MAX;
}

export async function POST(request: NextRequest): Promise<NextResponse<UploadResponse>> {
    try {
        // Rate limiting
        const ip =
            request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
            request.headers.get("x-real-ip") ??
            "unknown";

        if (isRateLimited(ip)) {
            return NextResponse.json(
                { success: false, error: "Too many requests. Please try again later." },
                { status: 429 }
            );
        }

        // Parse multipart form data
        const formData = await request.formData();
        const file = formData.get("file");

        if (!file || !(file instanceof File)) {
            return NextResponse.json(
                { success: false, error: "No file provided. Please select an image to upload." },
                { status: 400 }
            );
        }

        // Validate file using Zod
        const validation = uploadFileSchema.safeParse({
            name: file.name,
            size: file.size,
            type: file.type,
        });

        if (!validation.success) {
            const errorMessage = validation.error.issues
                .map((issue) => issue.message)
                .join(", ");
            return NextResponse.json(
                { success: false, error: errorMessage },
                { status: 400 }
            );
        }

        // Read file buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Generate unique filename
        const fileExtension = file.name.split(".").pop() ?? "png";
        const uniqueFileName = `${uuidv4()}.${fileExtension}`;

        // Step 1: Upload to Supabase Storage
        let imageUrl: string;
        let storagePath: string;
        try {
            const result = await uploadToSupabase(buffer, uniqueFileName, file.type);
            imageUrl = result.publicUrl;
            storagePath = result.storagePath;
        } catch (error) {
            console.error("Supabase upload error:", error);
            return NextResponse.json(
                {
                    success: false,
                    error:
                        error instanceof Error
                            ? error.message
                            : "Failed to upload image to storage.",
                },
                { status: 500 }
            );
        }

        // Step 2: Extract text using Groq
        let extractedText: string;
        try {
            extractedText = await extractTextFromImage(buffer, file.type);
        } catch (error) {
            console.error("Groq extraction error:", error);
            // Still save the record even if text extraction fails
            extractedText = "Text extraction failed. Please try again.";
        }

        // Step 3: Save record to database
        try {
            const record = await insertUploadRecord({
                imageUrl,
                extractedText,
                fileName: file.name,
                fileSize: file.size,
                mimeType: file.type,
                storagePath,
            });

            return NextResponse.json(
                { success: true, data: record },
                { status: 201 }
            );
        } catch (error) {
            console.error("Database insert error:", error);
            return NextResponse.json(
                {
                    success: false,
                    error:
                        error instanceof Error
                            ? error.message
                            : "Failed to save record to database.",
                },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Unexpected upload error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "An unexpected error occurred. Please try again.",
            },
            { status: 500 }
        );
    }
}
