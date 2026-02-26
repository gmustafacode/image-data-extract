import { NextRequest, NextResponse } from "next/server";
import { deleteUploadRecord } from "@/lib/supabase";
import type { DeleteSuccessResponse, ErrorResponse } from "@/types";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<DeleteSuccessResponse | ErrorResponse>> {
    try {
        const { id } = await params;

        await deleteUploadRecord(id);

        return NextResponse.json({
            success: true,
            message: "Record deleted successfully.",
        });
    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to delete record.",
            },
            { status: 500 }
        );
    }
}
