const { supabaseAdmin } = require("../config/supabase");
const { prisma } = require("../prisma");

function assertRequired(value, name) {
  if (value === undefined || value === null || value === "") {
    const e = new Error(`${name} is required`);
    e.status = 422;
    throw e;
  }
}

async function createInfluencer(payload) {
  const { userId, name, handle, bio, avatar, banner, socialLinks, isActive } =
    payload || {};
  assertRequired(userId, "userId");
  assertRequired(name, "name");
  assertRequired(handle, "handle");

  // optional checks
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const e = new Error("Invalid userId: user not found");
    e.status = 422;
    throw e;
  }

  // unique handle check (user-friendly message)
  const existHandle = await prisma.influencer.findUnique({ where: { handle } });
  if (existHandle) {
    const e = new Error("Handle already taken");
    e.status = 409;
    throw e;
  }

  const data = {
    userId,
    name,
    handle,
    bio: bio ?? null,
    avatar: avatar ?? null,
    banner: banner ?? null,
    socialLinks: socialLinks ?? undefined,
    isActive: typeof isActive === "boolean" ? isActive : undefined,
  };

  const created = await prisma.influencer.create({
    data,
    include: { user: true },
  });
  return created;
}

async function listInfluencers({
  page = 1,
  pageSize = 20,
  q = "",
  active,
} = {}) {
  const take = Math.min(Number(pageSize) || 20, 100);
  const skip = Math.max((Number(page) || 1) - 1, 0) * take;

  const where = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { handle: { contains: q, mode: "insensitive" } },
    ];
  }
  if (active === true) where.isActive = true;
  if (active === false) where.isActive = false;

  const [items, total] = await Promise.all([
    prisma.influencer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: { user: true },
    }),
    prisma.influencer.count({ where }),
  ]);

  return { items, total, page: Number(page), pageSize: take };
}

async function getInfluencerById(id) {
  assertRequired(id, "id");
  const data = await prisma.influencer.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!data) {
    const e = new Error("Influencer not found");
    e.status = 404;
    throw e;
  }
  return data;
}

async function getInfluencerByHandle(handle) {
  assertRequired(handle, "handle");
  const data = await prisma.influencer.findUnique({
    where: { handle },
    include: { user: true },
  });
  if (!data) {
    const e = new Error("Influencer not found");
    e.status = 404;
    throw e;
  }
  return data;
}

async function getInfluencerByUserId(userId) {
  assertRequired(userId, "userId");
  console.log("getInfluencerByUserId", userId);
  const data = await prisma.influencer.findFirst({
    where: {
      user: {
        authUserId: userId,
      },
    },
    include: { user: true },
  });
  if (!data) {
    const e = new Error("Influencer not found");
    e.status = 404;
    throw e;
  }
  return data;
}

async function updateInfluencer(id, payload) {
  assertRequired(id, "id");

  if (payload?.handle) {
    const exists = await prisma.influencer.findUnique({
      where: { handle: payload.handle },
    });
    if (exists && exists.id !== id) {
      const e = new Error("Handle already taken");
      e.status = 409;
      throw e;
    }
  }

  const data = {
    name: payload?.name,
    handle: payload?.handle,
    bio: payload?.bio ?? null,
    avatar: payload?.avatar ?? null,
    banner: payload?.banner ?? null,
    socialLinks: payload?.socialLinks ?? undefined,
    isActive:
      typeof payload?.isActive === "boolean" ? payload.isActive : undefined,
  };

  try {
    const updated = await prisma.influencer.update({
      where: { id },
      data,
      include: { user: true },
    });
    return updated;
  } catch (err) {
    if (err.code === "P2025") {
      const e = new Error("Influencer not found");
      e.status = 404;
      throw e;
    }
    if (err.code === "P2002") {
      const e = new Error("Duplicate value violates unique constraint");
      e.status = 409;
      e.details = err.meta;
      throw e;
    }
    throw err;
  }
}

async function deleteInfluencer(id) {
  assertRequired(id, "id");

  // Hapus dependensi sederhana (atau gunakan onDelete cascade via migrasi)
  await prisma.product.deleteMany({ where: { influencerId: id } });
  await prisma.ootdPost.deleteMany({ where: { influencerId: id } });
  await prisma.analytics.deleteMany({ where: { influencerId: id } });

  try {
    const deleted = await prisma.influencer.delete({ where: { id } });
    return deleted;
  } catch (err) {
    if (err.code === "P2025") {
      const e = new Error("Influencer not found");
      e.status = 404;
      throw e;
    }
    throw err;
  }
}

module.exports = {
  createInfluencer,
  listInfluencers,
  getInfluencerById,
  getInfluencerByHandle,
  getInfluencerByUserId,
  updateInfluencer,
  deleteInfluencer,
};
