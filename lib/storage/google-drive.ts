import { google, drive_v3 } from 'googleapis';
import { Readable } from 'stream';
import { StorageProvider, UploadResult, FileCategory, detectFileCategory } from './types';

let cachedDriveClient: drive_v3.Drive | null = null;
const folderCache: Record<string, string> = {};

function getDriveClient(): drive_v3.Drive {
  if (cachedDriveClient) return cachedDriveClient;

  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (serviceAccountEmail && privateKey) {
    const auth = new google.auth.JWT({
      email: serviceAccountEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });
    cachedDriveClient = google.drive({ version: 'v3', auth });
    return cachedDriveClient;
  }

  if (clientId && clientSecret && refreshToken) {
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000'
    );
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    cachedDriveClient = google.drive({ version: 'v3', auth: oauth2Client });
    return cachedDriveClient;
  }

  throw new Error('Google Drive credentials are not configured.');
}

async function getOrCreateSubfolder(
  drive: drive_v3.Drive,
  rootFolderId: string,
  folderName: FileCategory
): Promise<string> {
  const cacheKey = `${rootFolderId}_${folderName}`;
  if (folderCache[cacheKey]) {
    return folderCache[cacheKey];
  }

  try {
    const query = `'${rootFolderId}' in parents and name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
    const res = await drive.files.list({
      q: query,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    if (res.data.files && res.data.files.length > 0 && res.data.files[0].id) {
      const folderId = res.data.files[0].id;
      folderCache[cacheKey] = folderId;
      return folderId;
    }

    // Create subfolder if it does not exist
    const createRes = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [rootFolderId],
      },
      fields: 'id',
    });

    if (createRes.data.id) {
      folderCache[cacheKey] = createRes.data.id;
      return createRes.data.id;
    }
  } catch (error) {
    console.error(`Error resolving Drive folder for ${folderName}:`, error);
  }

  return rootFolderId;
}

export class GoogleDriveStorageProvider implements StorageProvider {
  name: 'google_drive' = 'google_drive';
  private accountName: string;
  private rootFolderId: string;

  constructor(accountName: string = 'primary_drive') {
    this.accountName = accountName;
    this.rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID || 'root';
  }

  async upload(
    fileBuffer: Buffer,
    filename: string,
    mimeType: string,
    category?: FileCategory
  ): Promise<UploadResult> {
    const drive = getDriveClient();
    const resolvedCategory = category || detectFileCategory(mimeType, filename);
    const parentFolderId = await getOrCreateSubfolder(drive, this.rootFolderId, resolvedCategory);

    const stream = new Readable();
    stream.push(fileBuffer);
    stream.push(null);

    const res = await drive.files.create({
      requestBody: {
        name: filename,
        parents: [parentFolderId],
      },
      media: {
        mimeType,
        body: stream,
      },
      fields: 'id, name, webViewLink, webContentLink, size',
    });

    if (!res.data.id) {
      throw new Error('Google Drive upload failed: No file ID returned.');
    }

    return {
      storageFileId: res.data.id,
      storageProvider: 'google_drive',
      storageAccount: this.accountName,
      downloadUrl: res.data.webContentLink || undefined,
      previewUrl: res.data.webViewLink || undefined,
      mimeType,
      size: fileBuffer.length,
    };
  }

  async getFileStream(storageFileId: string): Promise<Readable> {
    const drive = getDriveClient();
    const res = await drive.files.get(
      { fileId: storageFileId, alt: 'media' },
      { responseType: 'stream' }
    );
    return res.data as unknown as Readable;
  }

  async getDownloadUrl(storageFileId: string): Promise<string> {
    const drive = getDriveClient();
    const res = await drive.files.get({
      fileId: storageFileId,
      fields: 'webContentLink, webViewLink',
    });
    return res.data.webContentLink || res.data.webViewLink || `/api/files/${storageFileId}`;
  }

  async delete(storageFileId: string): Promise<void> {
    const drive = getDriveClient();
    await drive.files.delete({ fileId: storageFileId });
  }
}
