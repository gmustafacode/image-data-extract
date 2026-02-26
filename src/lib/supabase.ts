import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ImageUploadRecord } from "@/types";

let _supabaseAdmin: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient {
    if (!_supabaseAdmin) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceRoleKey) {
            throw new Error(
                "Missing Supabase environment variables. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
            );
        }
        _supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });
    }
    return _supabaseAdmin;
}

/** Storage bucket name */
export const STORAGE_BUCKET = "uploads";

/** Database table name */
const TABLE_NAME = "uploads";

/**
 * Upload a file to Supabase Storage and return the public URL.
 */
export async function uploadToSupabase(
    file: Buffer,
    fileName: string,
    contentType: string
): Promise<{ publicUrl: string; storagePath: string }> {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, file, {
            contentType,
            upsert: false,
        });

    if (error) {
        throw new Error(`Supabase Storage upload failed: ${error.message}`);
    }

    const {
        data: { publicUrl },
    } = supabaseAdmin.storage.from(STORAGE_BUCKET).getPublicUrl(data.path);

    return { publicUrl, storagePath: data.path };
}

/**
 * Delete a file from Supabase Storage.
 */
export async function deleteFromSupabase(filePath: string): Promise<void> {
    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .remove([filePath]);

    if (error) {
        throw new Error(`Supabase Storage delete failed: ${error.message}`);
    }
}

// ─── Database operations ────────────────────────────────────────────

interface InsertUploadParams {
    imageUrl: string;
    extractedText: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    storagePath: string;
}

/**
 * Insert an upload record into the database.
 */
export async function insertUploadRecord(
    params: InsertUploadParams
): Promise<ImageUploadRecord> {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
        .from(TABLE_NAME)
        .insert({
            image_url: params.imageUrl,
            extracted_text: params.extractedText,
            file_name: params.fileName,
            file_size: params.fileSize,
            mime_type: params.mimeType,
            storage_path: params.storagePath,
        })
        .select()
        .single();

    if (error) {
        throw new Error(`Database insert failed: ${error.message}`);
    }

    return mapRow(data);
}

/**
 * Fetch all upload records, most recent first.
 */
export async function getUploadHistory(): Promise<ImageUploadRecord[]> {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
        .from(TABLE_NAME)
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error(`Database query failed: ${error.message}`);
    }

    return (data ?? []).map(mapRow);
}

/**
 * Delete an upload record by ID. Also removes the file from storage.
 */
export async function deleteUploadRecord(id: string): Promise<void> {
    const supabaseAdmin = getSupabaseAdmin();

    // Fetch the record first to get storage_path
    const { data: record, error: fetchError } = await supabaseAdmin
        .from(TABLE_NAME)
        .select("storage_path")
        .eq("id", id)
        .single();

    if (fetchError) {
        throw new Error(`Record not found: ${fetchError.message}`);
    }

    // Delete from storage
    if (record?.storage_path) {
        try {
            await deleteFromSupabase(record.storage_path);
        } catch (err) {
            console.error("Failed to delete file from storage:", err);
        }
    }

    // Delete from database
    const { error: deleteError } = await supabaseAdmin
        .from(TABLE_NAME)
        .delete()
        .eq("id", id);

    if (deleteError) {
        throw new Error(`Database delete failed: ${deleteError.message}`);
    }
}

// ─── Helper ─────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): ImageUploadRecord {
    return {
        id: row.id,
        imageUrl: row.image_url,
        extractedText: row.extracted_text,
        fileName: row.file_name,
        fileSize: row.file_size,
        mimeType: row.mime_type,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
