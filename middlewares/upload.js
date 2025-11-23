const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload file ke Cloudinary
 * - Bisa dari URL langsung (string)
 * - Bisa dari Buffer (untuk file upload multipart)
 * - Bisa dari local path (string path)
 *
 * @param {Object} params
 * @param {string|Buffer} params.file - URL, Buffer, atau local path
 * @param {string} params.folder - Folder di Cloudinary
 * @param {string} params.fileName - Public ID (tanpa extension)
 * @param {string} params.resourceType - "image" atau "video"
 * @param {Object} params.transformation - Transformasi (resize, crop, dll)
 * @param {Array<string>} params.allowedFormats - Format yang diizinkan
 * @returns {Promise<Object>}
 */
const uploadToCloudinaryurl = async ({
  file,
  folder = "uploads",
  fileName = null,
  resourceType = "auto",
  transformation = {},
  allowedFormats = [],
}) => {
  try {
    // Build upload options
    const uploadOptions = {
      folder,
      resource_type: resourceType,
      use_filename: !!fileName,
      unique_filename: !fileName,
      overwrite: false,
      ...transformation,
    };

    // Set public_id jika fileName diberikan
    if (fileName) {
      uploadOptions.public_id = fileName;
    }

    // Set allowed formats jika ada
    if (allowedFormats.length > 0) {
      uploadOptions.allowed_formats = allowedFormats;
    }

    // Upload ke Cloudinary
    // cloudinary.uploader.upload() bisa terima:
    // - Remote URL (string yang dimulai http/https)
    // - Local file path (string path)
    // - Data URI (base64)
    // - Buffer (via stream untuk multer/express-fileupload)
    const result = await cloudinary.uploader.upload(file, uploadOptions);

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      resourceType: result.resource_type,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error(`Upload gagal: ${error.message}`);
  }
};

/**
 * Upload buffer ke Cloudinary tanpa simpan file lokal
 * @param {Buffer} buffer
 * @param {Object} options
 * @returns {Promise<Object>}
 */
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
};
/**
 * Delete single asset dari Cloudinary
 *
 * @param {string} publicId - Public ID asset (contoh: "ootd/user123/20250110_123456_img_001")
 * @param {Object} options
 * @param {string} options.resourceType - "image", "video", atau "raw" (default: "image")
 * @param {string} options.type - "upload", "private", "authenticated" (default: "upload")
 * @param {boolean} options.invalidate - Invalidate CDN cache (default: false, butuh waktu lebih lama)
 * @returns {Promise<Object>}
 */
const deleteFromCloudinary = async (publicId, options = {}) => {
  try {
    const {
      resourceType = "image",
      type = "upload",
      invalidate = false,
    } = options;

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      type: type,
      invalidate: invalidate,
    });

    // result.result bisa: "ok" (sukses), "not found" (tidak ada)
    if (result.result === "ok") {
      return {
        success: true,
        publicId,
        message: "Asset berhasil dihapus",
        result: result,
      };
    } else if (result.result === "not found") {
      return {
        success: false,
        publicId,
        message: "Asset tidak ditemukan",
        result: result,
      };
    } else {
      return {
        success: false,
        publicId,
        message: `Delete gagal: ${result.result}`,
        result: result,
      };
    }
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw new Error(`Delete gagal: ${error.message}`);
  }
};

/**
 * Delete multiple assets sekaligus (max 100 per call)
 * Gunakan Admin API - lebih efisien untuk bulk delete
 *
 * @param {Array<string>} publicIds - Array of public IDs
 * @param {Object} options
 * @param {string} options.resourceType - "image", "video", atau "raw" (default: "image")
 * @param {string} options.type - "upload", "private", "authenticated" (default: "upload")
 * @returns {Promise<Object>}
 */
const deleteBulkFromCloudinary = async (publicIds, options = {}) => {
  try {
    if (!Array.isArray(publicIds) || publicIds.length === 0) {
      throw new Error("publicIds harus array dan tidak boleh kosong");
    }

    if (publicIds.length > 100) {
      throw new Error(
        "Max 100 assets per call. Gunakan deleteByPrefix untuk lebih banyak."
      );
    }

    const { resourceType = "image", type = "upload" } = options;

    const result = await cloudinary.api.delete_resources(publicIds, {
      resource_type: resourceType,
      type: type,
    });

    // result.deleted berisi object: { public_id: "deleted" atau "not_found" }
    const deleted = Object.keys(result.deleted || {}).filter(
      (key) => result.deleted[key] === "deleted"
    );
    const notFound = Object.keys(result.deleted || {}).filter(
      (key) => result.deleted[key] === "not_found"
    );

    return {
      success: true,
      deletedCount: deleted.length,
      notFoundCount: notFound.length,
      deleted: deleted,
      notFound: notFound,
      result: result,
    };
  } catch (error) {
    console.error("Cloudinary bulk delete error:", error);
    throw new Error(`Bulk delete gagal: ${error.message}`);
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  uploadToCloudinaryurl,
  deleteFromCloudinary,
  deleteBulkFromCloudinary,
};
