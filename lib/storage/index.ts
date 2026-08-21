import { StorageProvider } from './types';
import { GoogleDriveStorageProvider } from './google-drive';
import { LocalMockStorageProvider } from './local-mock';

export * from './types';

let cachedProvider: StorageProvider | null = null;

export function getStorageProvider(accountRef?: string): StorageProvider {
  if (cachedProvider) return cachedProvider;

  const hasGoogleCreds =
    Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) ||
    Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN);

  if (hasGoogleCreds) {
    try {
      cachedProvider = new GoogleDriveStorageProvider(accountRef || 'primary_google_drive');
      return cachedProvider;
    } catch (err) {
      console.warn('Failed to initialize Google Drive provider, falling back to Local Mock:', err);
    }
  }

  cachedProvider = new LocalMockStorageProvider(accountRef || 'local_storage');
  return cachedProvider;
}
