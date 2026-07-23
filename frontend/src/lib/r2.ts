import api from './api';

/**
 * Uploads a file directly to Cloudflare R2 using a secure presigned URL.
 * 
 * @param file The file object to upload
 * @param folder The destination folder in the R2 bucket
 * @returns Object containing the path to save in DB and the public_url to display
 */
export const uploadToR2 = async (file: File, folder: string = 'uploads') => {
  const extension = file.name.split('.').pop() || 'png';
  const contentType = file.type || 'image/png';
  
  // 1. Request Presigned URL from Backend
  const response = await api.post('/upload/presigned-url', {
    extension,
    folder,
    contentType,
  });

  const { upload_url, path, public_url } = response.data.data;

  // 2. Upload file directly to Cloudflare R2 using the presigned URL
  const uploadResponse = await fetch(upload_url, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': contentType,
    },
  });

  if (!uploadResponse.ok) {
    throw new Error(`Failed to upload file to Cloudflare R2: ${uploadResponse.statusText}`);
  }

  return { path, public_url };
};
