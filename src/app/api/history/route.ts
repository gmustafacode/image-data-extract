import { NextResponse } from "next/server";
import { getUploadHistory } from "@/lib/supabase";
import type { HistorySuccessResponse, ErrorResponse } from "@/types";

export async function GET(): Promise<NextResponse<HistorySuccessResponse | ErrorResponse>> {
    try {
        const data = await getUploadHistory();
        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("History fetch error:", error);
        return NextResponse.json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to fetch upload history.",
            },
            { status: 500 }
        );
    }
}
