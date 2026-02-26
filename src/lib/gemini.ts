import Groq from "groq-sdk";

let groqClient: Groq | null = null;

function getGroqClient(): Groq {
    if (!groqClient) {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            throw new Error("Missing GROQ_API_KEY environment variable.");
        }
        groqClient = new Groq({ apiKey });
    }
    return groqClient;
}

const SYSTEM_PROMPT = `You are an expert OCR and document text extraction AI.

Your task is to carefully analyze the provided image and extract ALL readable text exactly as it appears.

Rules:
- Do NOT summarize
- Do NOT explain
- Do NOT add extra words
- Preserve original formatting as much as possible
- Keep line breaks
- Keep punctuation
- If text is unclear, make your best accurate guess
- The image may contain scanned documents, receipts, or forms. Pay close attention to small text, numbers, and tables.
- If no text is found, return: NO_TEXT_FOUND

Output ONLY the extracted text.`;

/**
 * Extract text from an image using Groq Vision API.
 *
 * @param imageBuffer - The image as a Buffer
 * @param mimeType - The MIME type of the image (e.g., "image/png")
 * @returns The extracted text from the image
 */
export async function extractTextFromImage(
    imageBuffer: Buffer,
    mimeType: string
): Promise<string> {
    try {
        const base64Image = imageBuffer.toString("base64");

        const response = await getGroqClient().chat.completions.create({
            model: "llama-3.2-vision-preview",
            messages: [
                {
                    role: "system",
                    content: SYSTEM_PROMPT,
                },
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Extract all visible text from this image." },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:${mimeType};base64,${base64Image}`,
                            },
                        },
                    ],
                },
            ],
            temperature: 0,
        });

        const text = response.choices[0]?.message?.content;

        if (!text || text.trim().length === 0 || text.trim() === "NO_TEXT_FOUND") {
            return "No text detected in image.";
        }

        return text.trim();
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Groq API error: ${error.message}`);
        }
        throw new Error("An unknown error occurred while extracting text.");
    }
}
