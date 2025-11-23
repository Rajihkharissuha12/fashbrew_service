const { prisma } = require("../prisma");
const { getInfluencerByUserId } = require("./influencer.service");
const { getUserById } = require("./user.service");

// Helper: validasi required
function assertRequired(value, name) {
  if (value === undefined || value === null || value === "") {
    const e = new Error(`${name} is required`);
    e.status = 422;
    throw e;
  }
}

// Helper: normalisasi harga Decimal aman
function normalizePrice(value) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "number") return value; // Prisma Decimal terima number/ string
  if (typeof value === "string") {
    const cleaned = value.replace(/[, ]/g, "");
    if (!/^-?\d+(\.\d+)?$/.test(cleaned)) {
      const e = new Error("Invalid price format");
      e.status = 422;
      throw e;
    }
    return cleaned; // string numerik aman untuk Decimal
  }
  const e = new Error("Invalid price type");
  e.status = 422;
  throw e;
}

// Pastikan influencerId valid (ada di tabel Influencer)
async function ensureInfluencerExists(influencerId) {
  const inf = await prisma.influencer.findUnique({
    where: { id: influencerId },
  });
  if (!inf) {
    const e = new Error("Invalid influencerId: influencer not found");
    e.status = 422;
    throw e;
  }
  return inf;
}

// Create product
async function createProduct(payload) {
  const {
    userId,
    name,
    description,
    price,
    category,
    tags,
    image,
    affiliateLink,
    platforms,
  } = payload || {};
  console.log("CREATE PRODUCT SERVICE", userId);

  assertRequired(userId, "userId");
  assertRequired(name, "name");

  const influencerId = await getInfluencerByUserId(userId);

  const created = await prisma.product.create({
    data: {
      influencerId: influencerId.id,
      name,
      description: description ?? null,
      price: normalizePrice(price),
      category: category ?? null,
      tags: tags ?? undefined, // array/JSON
      image: image ?? null,
      affiliateLink: affiliateLink ?? null,
      lastUpdated: new Date(),
      platforms:
        Array.isArray(platforms) && platforms.length
          ? {
              create: platforms.map((p) => ({
                platform: p.platform,
                price: normalizePrice(p.price),
                link: p.link ?? null,
                lastUpdated: new Date(),
              })),
            }
          : undefined,
    },
    include: { platforms: true },
  });

  return created;
}

// List products dengan filter
async function listProducts({ userId, q, page = 1, pageSize = 20 } = {}) {
  const take = Math.min(Number(pageSize) || 20, 100);
  const skip = Math.max((Number(page) || 1) - 1, 0) * take;
  console.log("USER ID", userId);
  const where = {};
  if (userId) {
    const getInfluenderId = await getInfluencerByUserId(userId);
    where.influencerId = getInfluenderId.id;
  }
  if (q && String(q).trim()) {
    where.name = { contains: String(q).trim(), mode: "insensitive" };
  }
  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: {
        platforms: true,
      },
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page: Number(page), pageSize: take };
}

// Get detail product
async function getProductById(id) {
  assertRequired(id, "id");

  const item = await prisma.product.findUnique({
    where: { id },
    include: { platforms: true },
  });
  if (!item) {
    const e = new Error("Product not found");
    e.status = 404;
    throw e;
  }
  return item;
}

// Get List Product by Username
async function getProductByUsername(username) {
  assertRequired(username, "username");

  const item = await prisma.product.findMany({
    where: {
      influencer: {
        handle: username,
      },
    },
    include: {
      platforms: true,
    },
  });

  if (!item) {
    const e = new Error("Product not found");
    e.status = 404;
    throw e;
  }
  return item;
}

// Update product
async function updateProduct(id, payload) {
  assertRequired(id, "id");

  const data = {};
  if (payload.name !== undefined) data.name = payload.name;
  if (payload.description !== undefined)
    data.description = payload.description ?? null;
  if (payload.price !== undefined) data.price = normalizePrice(payload.price);
  if (payload.category !== undefined) data.category = payload.category ?? null;
  if (payload.tags !== undefined) data.tags = payload.tags ?? undefined;
  if (payload.image !== undefined) data.image = payload.image ?? null;
  if (payload.affiliateLink !== undefined)
    data.affiliateLink = payload.affiliateLink ?? null;
  data.lastUpdated = new Date();

  // Catatan: update platforms bisa dibuat endpoint terpisah untuk kesederhanaan.
  // Jika ingin update sekaligus, perlu strategi deleteMany+createMany atau upsert berdasarkan unique key.

  try {
    const updated = await prisma.product.update({
      where: { id },
      data,
      include: { platforms: true },
    });
    return updated;
  } catch (err) {
    if (err.code === "P2025") {
      const e = new Error("Product not found");
      e.status = 404;
      throw e;
    }
    throw err;
  }
}

// Delete product (plus dependensi)
async function deleteProduct(id) {
  assertRequired(id, "id");

  await prisma.productPlatform.deleteMany({ where: { productId: id } });
  await prisma.analytics.deleteMany({ where: { productId: id } });

  try {
    const deleted = await prisma.product.delete({ where: { id } });
    return deleted;
  } catch (err) {
    if (err.code === "P2025") {
      const e = new Error("Product not found");
      e.status = 404;
      throw e;
    }
    throw err;
  }
}

async function updatePlatforms(id, platforms) {
  const data = platforms;
  try {
    const updated = await prisma.productPlatform.update({
      where: { id },
      data,
    });
    return updated;
  } catch (err) {
    if (err.code === "P2025") {
      const e = new Error("Platform not found");
      e.status = 404;
      throw e;
    }
    throw err;
  }
}

async function addPlatforms(idproduct, data) {
  console.log("ADD PLATFORM", data);
  console.log("PLATFORMS", data.platforms.length);
  try {
    if (data.platforms.length > 1) {
      data.platforms.forEach(async (item) => {
        await prisma.productPlatform.create({
          data: {
            productId: idproduct,
            platform: item.platform || null,
            price: normalizePrice(item.price),
            link: item.link || null,
            lastUpdated: new Date(),
          },
        });
      });
    } else {
      await prisma.productPlatform.create({
        data: {
          productId: idproduct,
          platform: data.platforms[0].platform || null,
          price: normalizePrice(data.platforms[0].price),
          link: data.platforms[0].link || null,
          lastUpdated: new Date(),
        },
      });
    }

    const updated = await prisma.product.findUnique({
      where: {
        id: idproduct,
      },
      include: {
        platforms: true,
      },
    });

    return updated;
  } catch (error) {
    if (err.code === "P2025") {
      const e = new Error("Platform not found");
      e.status = 404;
      throw e;
    }
    throw err;
  }
}

module.exports = {
  createProduct,
  listProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updatePlatforms,
  addPlatforms,
  getProductByUsername,
};
