import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

/**
 * Upload file to Cloudinary using buffer streaming
 * @param {Object} buffer - The buffer of the file to upload
 * @param {Object} options - Upload options for Cloudinary
 * @returns {Promise<Object>} - Cloudinary upload result
 */
export const streamUpload = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    // Create a stream from the buffer using streamifier
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error || new Error('Unknown upload error'));
        }
      }
    );
    
    // Pipe the buffer stream to the Cloudinary upload stream
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * Upload file from multer request
 * @param {Object} req - Express request object with multer file
 * @param {Object} options - Upload options for Cloudinary
 * @returns {Promise<Object>} - Cloudinary upload result
 * @throws {Error} If no file found or upload fails
 */
export const uploadFromRequest = async (req, options = {}) => {
  // Check if we have a file with buffer
  if (!req.file || !req.file.buffer) {
    throw new Error('No file uploaded or invalid file format');
  }
  
  try {
    // Set default options if not provided
    const uploadOptions = {
      resource_type: 'auto',
      ...options
    };
    
    // Handle specific resource types with descriptive folder names
    if (req.file.mimetype.startsWith('image/')) {
      uploadOptions.folder = uploadOptions.folder || 'images';
    } else if (req.file.mimetype.includes('pdf')) {
      uploadOptions.folder = uploadOptions.folder || 'documents';
    } else {
      uploadOptions.folder = uploadOptions.folder || 'general_uploads';
    }
    
    // Use the streamUpload function to upload the file
    const result = await streamUpload(req.file.buffer, uploadOptions);
    return result;
  } catch (error) {
    console.error('Error in uploadFromRequest:', error);
    throw new Error(`Upload failed: ${error.message || 'Unknown error'}`);
  }
};

export default {
  streamUpload,
  uploadFromRequest
};