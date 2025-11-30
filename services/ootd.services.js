// services/ootd.service.js
const { prisma } = require("../prisma");
const { ActionType, TargetType, EventType } = require("@prisma/client");
const {
  getInfluencerByUserId,
  getInfluencerByUserEmail,
} = require("./influencer.service");
const { default: axios } = require("axios");
const {
  uploadToCloudinary,
  uploadToCloudinaryurl,
  deleteBulkFromCloudinary,
  deleteFromCloudinary,
} = require("../middlewares/upload");

// helpers
function parsePagination(q = {}) {
  const page = Math.max(parseInt(q.page) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(q.pageSize) || 10, 1), 100);
  const skip = (page - 1) * pageSize;
  const take = pageSize;
  return { page, pageSize, skip, take };
}

function parseBool(val) {
  if (val === undefined || val === null) return undefined;
  if (val === true || val === false) return val;
  const s = String(val).toLowerCase();
  if (s === "true") return true;
  if (s === "false") return false;
  return undefined;
}

// CREATE
exports.createOotd = async (body) => {
  const {
    userId,
    title,
    urlPostInstagram,
    description,
    mood,
    isPublic = true,
    products = [],
  } = body || {};

  console.log(body);

  function stripDlParam(inputUrl) {
    try {
      const u = new URL(inputUrl);
      u.searchParams.delete("dl");
      return u.toString();
    } catch {
      return inputUrl.replace(/([?&])dl=\d+(&|$)/, (m, p1, p2) =>
        p1 === "?" && p2 ? "?" : p2 ? p2 : ""
      );
    }
  }

  if (!userId || !title || !urlPostInstagram) {
    const err = new Error("userId, title, image wajib");
    err.status = 400;
    throw err;
  }

  const getInfluencerId = await getInfluencerByUserId(userId);
  const influencerId = getInfluencerId.id;

  const media = [];
  const options = {
    method: "POST",
    url: "https://instagram120.p.rapidapi.com/api/instagram/links",
    headers: {
      "x-rapidapi-key": "30aa338e17mshe7c6878226c1638p1b560cjsnc2024ec545da",
      "x-rapidapi-host": "instagram120.p.rapidapi.com",
      "Content-Type": "application/json",
    },
    data: { url: urlPostInstagram },
  };

  const getLink = await axios.request(options);
  const data = Array.isArray(getLink.data) ? getLink.data : [];

  // Generate timestamp dan format date untuk filename
  const uploadTimestamp = new Date();
  const dateString = uploadTimestamp
    .toISOString()
    .split("T")[0]
    .replace(/-/g, ""); // Format: YYYYMMDD
  const timeString = uploadTimestamp
    .toISOString()
    .split("T")[1]
    .split(".")[0]
    .replace(/:/g, ""); // Format: HHMMSS

  // Upload media ke Cloudinary
  await Promise.all(
    data.slice(0, 5).map(async (item, idx) => {
      const first = Array.isArray(item.urls) ? item.urls[0] : null;
      if (!first?.url) return;

      const ext = (first.extension || "").toLowerCase();
      const clean = stripDlParam(first.url);
      const isImage = ["jpg", "jpeg", "png", "webp"].includes(ext);

      try {
        // Extract nama original dari URL jika ada
        const urlParts = first.url.split("/");
        const originalFilename = urlParts[urlParts.length - 1]
          .split("?")[0] // Hapus query string
          .replace(/[^a-zA-Z0-9.-]/g, "_") // Sanitize
          .slice(0, 30); // Batasi panjang

        // Generate descriptive filename
        // Format: YYYYMMDD_HHMMSS_influencerId_index_type_originalname
        const descriptiveFileName =
          `${dateString}_${timeString}_${influencerId.slice(-8)}_${idx}_${
            isImage ? "img" : "vid"
          }_${originalFilename}`.slice(0, 100); // Batasi total 100 char

        const uploadResult = await uploadToCloudinaryurl({
          file: clean,
          folder: `ootd/${influencerId}`,
          fileName: descriptiveFileName,
          resourceType: isImage ? "image" : "video",
          quality: "auto",
          transformation: isImage
            ? {
                // width: 1080,
                // height: 1080,
                // crop: "limit", // biarkan batas, tidak merusak kualitas
                quality: "auto:best", // <--- kualitas paling tinggi tanpa boros
                fetch_format: "webp", // tetap convert WebP
              }
            : {},
          allowedFormats: isImage
            ? ["jpg", "png", "webp"]
            : ["mp4", "mov", "avi"],
        });

        media.push({
          type: isImage ? "image" : "video",
          url: uploadResult.url,
          urlpublicid: uploadResult.publicId,
          isPrimary: idx === 0,
          originalSize: uploadResult.bytes,
          optimizedSize: Math.round(uploadResult.bytes * 0.75),
          // Data tambahan untuk tracking
          originalFilename: originalFilename,
          uploadedAt: uploadTimestamp,
          cloudinaryFormat: uploadResult.format,
          dimensions: `${uploadResult.width}x${uploadResult.height}`,
        });
      } catch (error) {
        console.error(`Upload media ${idx} gagal:`, error.message);
      }
    })
  );

  if (media.length === 0) {
    const err = new Error("Tidak ada media yang berhasil diupload");
    err.status = 500;
    throw err;
  }

  const created = await prisma.ootdPost.create({
    data: {
      influencerId,
      title,
      description: description ?? null,
      mood: mood ?? undefined,
      urlPostInstagram,
      isPublic,
      ootdProducts: {
        create: Array.isArray(products)
          ? products.map((p) => ({
              productId: p.id,
              note: p.note ?? null,
              position: p.position ?? null,
            }))
          : [],
      },
      media: {
        create: media.map((m, idx) => ({
          type: m.type,
          url: m.url,
          urlpublicid: m.urlpublicid,
          isPrimary: m.isPrimary,
          originalSize: m.originalSize,
          optimizedSize: m.optimizedSize,
        })),
      },
    },
    include: {
      media: true,
      ootdProducts: { include: { product: { include: { platforms: true } } } },
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: getInfluencerId.user.id,
      actionType: ActionType.create_ootd,
      targetId: created.id,
      targetType: TargetType.ootd,
      metadata: {
        title: created.title,
        mediaCount: media.length,
        mediaDetails: media.map((m, idx) => ({
          index: idx,
          type: m.type,
          originalFilename: m.originalFilename,
          format: m.cloudinaryFormat,
          dimensions: m.dimensions,
          uploadedAt: m.uploadedAt,
        })),
      },
    },
  });

  return created;
};

// LIST
exports.listOotds = async (query) => {
  const { page, pageSize, skip, take } = parsePagination(query);
  const userId = query.userId;
  const q = query.q ? String(query.q).trim() : undefined;
  const isPublic = parseBool(query.isPublic);

  const getInfluencerId = await getInfluencerByUserId(userId);
  const influencerId = getInfluencerId.id;

  const where = {};
  if (influencerId) where.influencerId = influencerId;
  if (isPublic !== undefined) where.isPublic = isPublic;
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  const [total, data] = await Promise.all([
    prisma.ootdPost.count({ where }),
    prisma.ootdPost.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: {
        media: true,
        ootdProducts: {
          include: { product: { include: { platforms: true } } },
        },
        influencer: true,
      },
    }),
  ]);

  return { data, meta: { total, page, pageSize } };
};

// List Ootd by Username
exports.getListOotdByUsername = async (username) => {
  console.log("GET LIST BY ", username);
  const ootd = await prisma.ootdPost.findMany({
    where: {
      influencer: { handle: username },
      // kalau ada field isPublic dan kamu hanya mau yang public:
      // isPublic: true,
    },
    orderBy: { createdAt: "desc" }, // opsional, biar urut rapi
    select: {
      id: true,
      influencerId: true,
      title: true,
      description: true,
      urlPostInstagram: true,
      mood: true,
      isPublic: true,
      viewCount: true,
      likeCount: true,
      createdAt: true,
      updatedAt: true,
      number: true,
      media: {
        select: {
          id: true,
          ootdId: true,
          type: true,
          url: true,
          urlpublicid: true,
          isPrimary: true,
          originalSize: true,
          optimizedSize: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      ootdProducts: {
        orderBy: { position: "asc" },
        select: {
          id: true,
          ootdId: true,
          productId: true,
          note: true,
          position: true,
          createdAt: true,
          product: {
            select: {
              id: true,
              influencerId: true,
              name: true,
              description: true,
              price: true,
              category: true,
              tags: true,
              image: true,
              affiliateLink: true,
              clicks: true,
              lastUpdated: true,
              createdAt: true,
              updatedAt: true,
              platforms: {
                select: {
                  id: true,
                  productId: true,
                  platform: true,
                  price: true,
                  link: true,
                  clicks: true,
                  lastUpdated: true,
                },
              },
            },
          },
        },
      },
      influencer: {
        select: {
          id: true,
          userId: true,
          name: true,
          handle: true,
          bio: true,
          avatar: true,
          banner: true,
          socialLinks: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      // analytics: false -> tidak di-select, otomatis tidak diambil
    },
  });
  if (!ootd || ootd.length === 0) {
    const err = new Error("OOTD tidak ditemukan");
    err.status = 404;
    throw err;
  }
  return ootd;
};

// DETAIL
exports.getOotdById = async (id) => {
  const ootd = await prisma.ootdPost.findUnique({
    where: { id },
    include: {
      ootdProducts: {
        orderBy: { position: "asc" },
        include: { product: { include: { platforms: true } } },
      },
      media: true,
      influencer: true,
      analytics: true,
    },
  });
  if (!ootd) {
    const err = new Error("OOTD tidak ditemukan");
    err.status = 404;
    throw err;
  }
  return ootd;
};

// UPDATE
exports.updateOotd = async (id, body) => {
  const { title, description, image, mood, isPublic } = body || {};

  const updated = await prisma.ootdPost.update({
    where: { id },
    data: {
      title,
      description,
      image,
      mood,
      isPublic,
    },
    include: {
      influencer: {
        include: {
          user: true,
        },
      },
    },
  });

  // await prisma.activityLog.create({
  //   data: {
  //     userId: updated.influencerId.user.id,
  //     actionType: ActionType.update_ootd,
  //     targetId: id,
  //     targetType: TargetType.ootd,
  //     metadata: { title: updated.title },
  //   },
  // });

  return updated;
};

// DELETE
exports.deleteOotd = async (id) => {
  const findMedia = await prisma.ootdMedia.findMany({
    where: {
      ootdId: id,
    },
  });

  await deleteBulkFromCloudinary(
    findMedia.map((item) => {
      return item.urlpublicid;
    })
  );

  await prisma.$transaction([
    prisma.ootdProduct.deleteMany({ where: { ootdId: id } }),
    prisma.analytics.deleteMany({ where: { ootdId: id } }),
    prisma.ootdMedia.deleteMany({ where: { ootdId: id } }),
  ]);

  const deleted = await prisma.ootdPost.delete({ where: { id } });

  // await prisma.activityLog.create({
  //   data: {
  //     userId: deleted.influencerId,
  //     actionType: ActionType.delete_ootd,
  //     targetId: id,
  //     targetType: TargetType.ootd,
  //   },
  // });

  return deleted;
};

// RELASI: tambah produk ke OOTD
exports.attachProduct = async (ootdId, body) => {
  const { productId, note, position } = body || {};
  if (!productId) {
    const err = new Error("productId wajib");
    err.status = 400;
    throw err;
  }

  const exist = await prisma.ootdProduct.findUnique({
    where: { ootdId_productId: { ootdId, productId } },
  });
  if (exist) {
    const err = new Error("Produk sudah terhubung ke OOTD ini");
    err.status = 409;
    throw err;
  }

  const item = await prisma.ootdProduct.create({
    data: { ootdId, productId, note: note ?? null, position: position ?? null },
    include: { product: { include: { platforms: true } } },
  });

  return item;
};

// RELASI: hapus produk dari OOTD
exports.detachProduct = async (ootdId, productId) => {
  return prisma.ootdProduct.delete({
    where: { ootdId_productId: { ootdId, productId } },
  });
};

exports.updateProductInOotd = async (ootdId, productId, updates) => {
  const { note, position } = updates;

  const updated = await prisma.ootdProduct.update({
    where: { ootdId_productId: { ootdId, productId } },
    data: {
      ...(note !== undefined && { note }),
      ...(position !== undefined && { position }),
    },
    include: { product: true },
  });

  return updated;
};

// ANALYTICS: view
exports.addView = async (id, req) => {
  const updated = await prisma.ootdPost.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });

  await prisma.analytics.create({
    data: {
      influencerId: updated.influencerId,
      ootdId: id,
      event: EventType.view,
      metadata: { ua: req.headers["user-agent"] || "" },
    },
  });

  return { viewCount: updated.viewCount };
};

// ANALYTICS: like
exports.addLike = async (id) => {
  const updated = await prisma.ootdPost.update({
    where: { id },
    data: { likeCount: { increment: 1 } },
  });

  await prisma.analytics.create({
    data: {
      influencerId: updated.influencerId,
      ootdId: id,
      event: EventType.conversion,
      metadata: { type: "like" },
    },
  });

  return { likeCount: updated.likeCount };
};

// ANALYTICS: click
exports.logClick = async (body) => {
  const { influencerId, productId, platform, ootdId, link } = body || {};
  if (!influencerId) {
    const err = new Error("influencerId wajib");
    err.status = 400;
    throw err;
  }

  const tasks = [];

  tasks.push(
    prisma.analytics.create({
      data: {
        influencerId,
        productId: productId ?? null,
        ootdId: ootdId ?? null,
        platform: platform ?? null,
        event: EventType.click,
        metadata: { link },
      },
    })
  );

  if (productId && platform) {
    tasks.push(
      prisma.productPlatform.updateMany({
        where: { productId, platform }, // enum PlatformType di schema
        data: { clicks: { increment: 1 } },
      })
    );
  }
  if (productId) {
    tasks.push(
      prisma.product.update({
        where: { id: productId },
        data: { clicks: { increment: 1 }, lastUpdated: new Date() },
      })
    );
  }

  const result = await Promise.all(tasks);
  return { ok: true, resultCount: result.length };
};

// Add Media Dengan cara upload
exports.addMedia = async (idootd, mediaFiles, body) => {
  try {
    if (!mediaFiles || mediaFiles.length === 0)
      throw Object.assign(new Error("Tidak ada file yang diupload"), {
        status: 400,
      });

    // Validasi jumlah media
    const existing = await prisma.ootdMedia.count({
      where: { ootdId: idootd },
    });
    if (existing >= 4)
      throw Object.assign(new Error("Jumlah media maksimal 4"), {
        status: 400,
      });

    // Validasi OOTD
    const ootd = await prisma.ootdPost.findUnique({
      where: { id: idootd },
      select: { id: true, influencerId: true, number: true },
    });
    if (!ootd)
      throw Object.assign(new Error("OOTD tidak ditemukan"), { status: 404 });

    // Upload semua file secara paralel
    const uploadedResults = await Promise.all(
      mediaFiles.map(async (file, idx) => {
        const isImage = file.mimetype.startsWith("image/");
        const isVideo = file.mimetype.startsWith("video/");

        const uploadResult = await uploadToCloudinary(file.buffer, {
          folder: `ootd/${ootd.influencerId}`,
          resource_type: isVideo ? "video" : "image",
          public_id: `ootd_${ootd.number}_${Date.now()}_${idx}`,
          transformation: isImage
            ? { width: 1080, height: 1080, crop: "limit", quality: "auto" }
            : undefined,
        });

        return {
          ootdId: idootd,
          type: isImage ? "image" : "video",
          url: uploadResult.secure_url,
          urlpublicid: uploadResult.public_id,
          isPrimary: idx === 0 && existing === 0,
          originalSize: file.size,
          optimizedSize: uploadResult.bytes || null,
        };
      })
    );

    // Simpan hasil ke DB
    const created = await prisma.ootdMedia.createMany({
      data: uploadedResults,
    });

    return {
      success: true,
      count: created.count,
      uploaded: uploadedResults,
    };
  } catch (error) {
    console.error("AddMedia error:", error);
    throw Object.assign(new Error(error.message || "Gagal menambah media"), {
      status: error.status || 500,
    });
  }
};

exports.setBanner = async (body) => {
  try {
    const dataold = await prisma.ootdMedia.update({
      where: {
        id: body.idmediaold,
      },
      data: {
        isPrimary: false,
      },
    });
    const datanew = await prisma.ootdMedia.update({
      where: {
        id: body.idmedianew,
      },
      data: {
        isPrimary: true,
      },
    });
    return datanew;
  } catch (error) {
    const err = new Error(error.message || "Gagal mengubah banner");
    err.status = error.status || 500;
    throw err;
  }
};

exports.deleteMedia = async (idmedia) => {
  try {
    const data = await prisma.ootdMedia.delete({
      where: {
        id: idmedia,
      },
    });
    await deleteFromCloudinary(data.urlpublicid);
    return data;
  } catch (error) {
    const err = new Error(error.message || "Gagal menghapus media");
    err.status = error.status || 500;
    throw err;
  }
};
