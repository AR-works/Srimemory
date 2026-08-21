import { NextRequest, NextResponse } from 'next/server';
import { getStorageProvider } from '@/lib/storage';
import { Readable } from 'stream';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const fileId = params.id;

  if (!fileId) {
    return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
  }

  // Handle mock sample pdf gracefully
  if (fileId === 'sample_magazine.pdf') {
    const samplePdfContent = `%PDF-1.4
1 0 obj << /Title (A Birthday Chronicle for Srinithi) /Author (Karthik & Sneha) >> endobj
2 0 obj << /Type /Catalog /Pages 3 0 R >> endobj
3 0 obj << /Type /Pages /Kids [4 0 R] /Count 1 >> endobj
4 0 obj << /Type /Page /Parent 3 0 R /MediaBox [0 0 612 792] /Contents 5 0 R /Resources << /Font << /F1 6 0 R >> >> >> endobj
5 0 obj << /Length 160 >> stream
BT
/F1 24 Tf
50 720 Td
(Happy Birthday Srinithi! 💜) Tj
/F1 14 Tf
0 -40 Td
(Compiled with love by your closest friends.) Tj
0 -30 Td
(Wishing you joy, laughs, and lots of cake!) Tj
ET
endstream
endobj
6 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj
xref
0 7
0000000000 65535 f 
0000000009 00000 n 
0000000092 00000 n 
0000000141 00000 n 
0000000204 00000 n 
0000000330 00000 n 
0000000542 00000 n 
trailer << /Size 7 /Root 2 0 R >>
startxref
618
%%EOF`;
    return new NextResponse(samplePdfContent, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="Srinithi_Birthday_Chronicle_2024.pdf"',
      },
    });
  }

  try {
    const storageProvider = getStorageProvider();
    const stream = await storageProvider.getFileStream(fileId);

    // Convert NodeJS.ReadableStream to Web ReadableStream
    const webStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk) => controller.enqueue(chunk));
        stream.on('end', () => controller.close());
        stream.on('error', (err) => controller.error(err));
      },
    });

    const isPdf = fileId.endsWith('.pdf');
    const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(fileId);
    const isVideo = /\.(mp4|mov|webm)$/i.test(fileId);

    let contentType = 'application/octet-stream';
    if (isPdf) contentType = 'application/pdf';
    else if (isImage) contentType = 'image/jpeg';
    else if (isVideo) contentType = 'video/mp4';

    return new NextResponse(webStream, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error(`Error serving file ${fileId}:`, error);
    return NextResponse.json(
      { error: "Couldn't locate that memory file 💔" },
      { status: 404 }
    );
  }
}
