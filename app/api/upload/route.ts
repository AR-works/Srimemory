import { NextRequest, NextResponse } from 'next/server';
import { getStorageProvider, detectFileCategory } from '@/lib/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file was provided.' }, { status: 400 });
    }

    const filename = file.name || 'unnamed_file';
    const mimeType = file.type || 'application/octet-stream';
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate size (100MB limit for general uploads)
    if (buffer.length > 100 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds the 100MB limit. Try compressing or uploading smaller files.' },
        { status: 400 }
      );
    }

    const category = detectFileCategory(mimeType, filename);
    const storageProvider = getStorageProvider();

    const result = await storageProvider.upload(buffer, filename, mimeType, category);

    return NextResponse.json({
      success: true,
      storageFileId: result.storageFileId,
      storageProvider: result.storageProvider,
      storageAccount: result.storageAccount,
      originalFilename: filename,
      mimeType: result.mimeType,
      fileSize: result.size,
      downloadUrl: result.downloadUrl || `/api/files/${result.storageFileId}`,
      previewUrl: result.previewUrl || `/api/files/${result.storageFileId}`,
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: "That one didn't make it 😭 Try uploading it again." },
      { status: 500 }
    );
  }
}
