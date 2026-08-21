import { promises as fs } from 'fs';
import path from 'path';
import { createReadStream, existsSync } from 'fs';
import { Readable } from 'stream';
import { StorageProvider, UploadResult, FileCategory, detectFileCategory } from './types';

const UPLOAD_DIR = path.join(process.cwd(), '.storage_uploads');

export class LocalMockStorageProvider implements StorageProvider {
  name: 'local_mock' = 'local_mock';
  private accountName: string;

  constructor(accountName: string = 'local_mock') {
    this.accountName = accountName;
  }

  private async ensureDir(dirPath: string) {
    if (!existsSync(dirPath)) {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  async upload(
    fileBuffer: Buffer,
    filename: string,
    mimeType: string,
    category?: FileCategory
  ): Promise<UploadResult> {
    const resolvedCategory = category || detectFileCategory(mimeType, filename);
    const targetDir = path.join(UPLOAD_DIR, resolvedCategory);
    await this.ensureDir(targetDir);

    const timestamp = Date.now();
    const sanitizedName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageFileId = `local_${timestamp}_${sanitizedName}`;
    const filePath = path.join(targetDir, storageFileId);

    await fs.writeFile(filePath, fileBuffer);

    return {
      storageFileId,
      storageProvider: 'local_mock',
      storageAccount: this.accountName,
      downloadUrl: `/api/files/${storageFileId}`,
      previewUrl: `/api/files/${storageFileId}`,
      mimeType,
      size: fileBuffer.length,
    };
  }

  async getFileStream(storageFileId: string): Promise<Readable> {
    const categories: FileCategory[] = ['Photos', 'Videos', 'PDFs', 'Other'];
    for (const cat of categories) {
      const filePath = path.join(UPLOAD_DIR, cat, storageFileId);
      if (existsSync(filePath)) {
        return createReadStream(filePath);
      }
    }
    const directPath = path.join(UPLOAD_DIR, storageFileId);
    if (existsSync(directPath)) {
      return createReadStream(directPath);
    }
    throw new Error(`File not found: ${storageFileId}`);
  }

  async getDownloadUrl(storageFileId: string): Promise<string> {
    return `/api/files/${storageFileId}`;
  }

  async delete(storageFileId: string): Promise<void> {
    const categories: FileCategory[] = ['Photos', 'Videos', 'PDFs', 'Other'];
    for (const cat of categories) {
      const filePath = path.join(UPLOAD_DIR, cat, storageFileId);
      if (existsSync(filePath)) {
        await fs.unlink(filePath);
        return;
      }
    }
  }
}
