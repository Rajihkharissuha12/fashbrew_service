// services/cloudinary.service.js
const axios = require("axios");
const { cloudinary } = require("../config/cloudinary");

exports.uploadToCloudinary = async (options) => {
  const {
    file,
    folder = "general",
    fileName,
    resourceType = "auto",
    transformation = {},
    useFilename = false,
    uniqueFilename = true,
    allowedFormats = [],
    quality = "auto",
  } = options;

  try {
    let fileToUpload = file;

    if (typeof file === "string" && file.startsWith("http")) {
      const response = await axios.get(file, {
        responseType: "arraybuffer",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Referer: "https://www.instagram.com/",
        },
      });
      fileToUpload = Buffer.from(response.data);
    }

    const defaultTransformation = {
      width: 1080,
      height: 1080,
      crop: "limit",
      quality: quality,
      fetch_format: "auto",
      flags: "progressive",
    };

    const uploadOptions = {
      folder,
      resource_type: resourceType,
      use_filename: useFilename,
      unique_filename: uniqueFilename,
      transformation: {
        ...defaultTransformation,
        ...transformation,
      },
    };

    // Set custom public_id hanya dengan fileName (tanpa folder)
    if (fileName) {
      uploadOptions.public_id = fileName;
    }

    if (allowedFormats.length > 0) {
      uploadOptions.allowed_formats = allowedFormats;
    }

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      if (Buffer.isBuffer(fileToUpload)) {
        uploadStream.end(fileToUpload);
      } else {
        cloudinary.uploader
          .upload(fileToUpload, uploadOptions)
          .then(resolve)
          .catch(reject);
      }
    });

    return {
      success: true,
      url: result.secure_url,
      urlWebP: result.secure_url.replace(
        /\/upload\//,
        "/upload/q_auto,f_webp/"
      ),
      urlAVIF: result.secure_url.replace(
        /\/upload\//,
        "/upload/q_auto,f_avif/"
      ),
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      originalSize: result.bytes,
      optimizedSize: Math.round(result.bytes * 0.75),
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error(`Upload gagal: ${error.message}`);
  }
};

exports.deleteFromCloudinary = async (publicId, resourceType = "image") => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw new Error(`Delete gagal: ${error.message}`);
  }
};
