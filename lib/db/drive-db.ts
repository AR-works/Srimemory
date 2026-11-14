import { getDriveClient } from '@/lib/storage/google-drive';
import { Submission } from '@/types';
import { Readable } from 'stream';

const SUBMISSIONS_FILENAME = 'submissions.json';
let fileIdCache: string | null = null;
let memoryCache: { data: Submission[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 30 * 1000; // 30 seconds cache for fast reads

function getRootFolderId(): string {
  return process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID || '1d7tGPl7rTGsWVrCvglQdPra9mmnu8JXq';
}

/**
 * Locate the submissions.json file ID in the root folder on Google Drive.
 */
async function getSubmissionsFileId(): Promise<string | null> {
  if (fileIdCache) return fileIdCache;

  try {
    const drive = getDriveClient();
    const rootFolderId = getRootFolderId();
    const query = `'${rootFolderId}' in parents and name = '${SUBMISSIONS_FILENAME}' and trashed = false`;
    const res = await drive.files.list({
      q: query,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    if (res.data.files && res.data.files.length > 0 && res.data.files[0].id) {
      fileIdCache = res.data.files[0].id;
      return fileIdCache;
    }
  } catch (err) {
    console.warn('Error locating submissions.json on Google Drive:', err);
  }

  return null;
}

/**
 * Read all submissions directly from submissions.json on Google Drive.
 * Returns null if the file does not exist yet.
 */
export async function readSubmissionsFromDrive(forceRefresh = false): Promise<Submission[] | null> {
  const now = Date.now();
  if (!forceRefresh && memoryCache && now - memoryCache.timestamp < CACHE_TTL_MS) {
    return memoryCache.data;
  }

  try {
    const drive = getDriveClient();
    const fileId = await getSubmissionsFileId();

    if (!fileId) {
      return null;
    }

    const res = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' }
    );

    const stream = res.data as unknown as Readable;
    const chunks: Buffer[] = [];

    const jsonString = await new Promise<string>((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
      stream.on('error', (err) => reject(err));
    });

    if (!jsonString || jsonString.trim().length === 0) {
      memoryCache = { data: [], timestamp: now };
      return [];
    }

    const submissions: Submission[] = JSON.parse(jsonString);
    memoryCache = { data: submissions, timestamp: now };
    return submissions;
  } catch (err) {
    console.warn('Failed to read submissions.json from Google Drive:', err);
    return null;
  }
}

/**
 * Write submissions to submissions.json in the Google Drive folder.
 */
export async function writeSubmissionsToDrive(submissions: Submission[]): Promise<boolean> {
  try {
    const drive = getDriveClient();
    const rootFolderId = getRootFolderId();
    const fileId = await getSubmissionsFileId();

    const jsonBuffer = Buffer.from(JSON.stringify(submissions, null, 2), 'utf-8');
    const stream = new Readable();
    stream.push(jsonBuffer);
    stream.push(null);

    if (fileId) {
      await drive.files.update({
        fileId,
        media: {
          mimeType: 'application/json',
          body: stream,
        },
      });
    } else {
      const createRes = await drive.files.create({
        requestBody: {
          name: SUBMISSIONS_FILENAME,
          parents: [rootFolderId],
          description: "Sri's Birthday Website - Persistent Memories Database",
        },
        media: {
          mimeType: 'application/json',
          body: stream,
        },
        fields: 'id',
      });

      if (createRes.data.id) {
        fileIdCache = createRes.data.id;
      }
    }

    // Immediately update memory cache
    memoryCache = { data: submissions, timestamp: Date.now() };
    return true;
  } catch (err) {
    console.error('Failed to write submissions.json to Google Drive:', err);
    return false;
  }
}
