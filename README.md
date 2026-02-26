# Image Text Extractor

A production-ready full-stack web application that extracts text from images using AI. Built with **Next.js 16+**, **TypeScript**, **Supabase**, **Prisma**, and **Google Gemini API**.

## Features

- **Image Upload** — Drag & drop or click to upload images (JPEG, PNG, WebP, GIF, BMP)
- **AI Text Extraction** — Powered by Google Gemini 1.5 Flash multimodal model
- **Image Preview** — Instant preview before upload
- **Upload History** — Browse all past uploads with extracted text
- **Copy to Clipboard** — One-click copy of extracted text
- **Delete Records** — Remove uploads from storage and database
- **Toast Notifications** — Real-time feedback with Sonner
- **Rate Limiting** — API rate limiting (10 requests/minute per IP)
- **Zod Validation** — Server-side file validation
- **Dark Mode** — Full dark mode support
- **Responsive Design** — Mobile-first with Tailwind CSS

## Tech Stack

| Layer            | Technology              |
| ---------------- | ----------------------- |
| Framework        | Next.js 16+ (App Router)|
| Language         | TypeScript              |
| Database         | Supabase (PostgreSQL)   |
| ORM              | Prisma                  |
| AI / OCR         | Google Gemini API       |
| Styling          | Tailwind CSS            |
| File Storage     | Supabase Storage        |
| Notifications    | Sonner                  |
| Validation       | Zod                     |

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── history/route.ts      # GET: fetch all uploads
│   │   └── upload/
│   │       ├── route.ts           # POST: upload & extract
│   │       └── [id]/route.ts      # DELETE: remove record
│   ├── history/page.tsx           # Upload history page
│   ├── layout.tsx                 # Root layout with Toaster
│   ├── globals.css                # Global styles
│   └── page.tsx                   # Main upload page
├── components/
│   ├── ExtractedText.tsx          # Displays extracted text + copy
│   ├── ImagePreview.tsx           # Image preview component
│   ├── ImageUploader.tsx          # Drag & drop upload component
│   └── LoadingSpinner.tsx         # Loading spinner
├── lib/
│   ├── gemini.ts                  # Google Gemini AI integration
│   ├── prisma.ts                  # Prisma client singleton
│   └── supabase.ts                # Supabase client & storage utils
├── types/
│   └── index.ts                   # TypeScript types & Zod schemas
└── generated/
    └── prisma/                    # Generated Prisma client
prisma/
├── schema.prisma                  # Database schema
prisma.config.ts                   # Prisma configuration
```

## Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **Supabase** account (free tier works)
- **Google Cloud** account with Gemini API access

## Setup Instructions

### 1. Clone & Install

```bash
cd image-text-extractor
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Storage** → Create a new bucket called `uploads`
3. Set the bucket to **Public**
4. Go to **Settings** → **API** and copy your:
   - Project URL
   - `anon` public key
   - `service_role` secret key
5. Go to **Settings** → **Database** and copy the connection string

### 3. Google Gemini API Setup

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Create an API key
3. Copy the key

### 4. Environment Variables

Create `.env.local` in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key
```

### 5. Database Migration

```bash
npx prisma migrate dev --name init
```

This will:
- Create the database tables
- Generate the Prisma client

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Upload** — Drag & drop or click to select an image
2. **Preview** — See the image preview before uploading
3. **Extract** — Click "Extract Text" to upload and process
4. **View** — See the extracted text on the right panel
5. **Copy** — Click the copy button to copy text to clipboard
6. **History** — Click "History" to view all past uploads
7. **Delete** — Remove any upload from the history page

## API Routes

### `POST /api/upload`

Upload an image and extract text.

- **Content-Type:** `multipart/form-data`
- **Body:** `file` (image file)
- **Response:** `{ success: true, data: ImageUploadRecord }`

### `GET /api/history`

Fetch all upload records.

- **Response:** `{ success: true, data: ImageUploadRecord[] }`

### `DELETE /api/upload/:id`

Delete an upload record and its stored file.

- **Response:** `{ success: true, message: string }`

## Production Build

```bash
npm run build
npm start
```

## License

MIT
