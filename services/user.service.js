const { prisma } = require("../prisma");

// Util validasi ringan
function assertRequired(value, name) {
  if (value === undefined || value === null || value === "") {
    const e = new Error(`${name} is required`);
    e.status = 422;
    throw e;
  }
}

// Create user
async function createUser(payload) {
  const { authUserId, role, lastLogin } = payload || {};
  assertRequired(authUserId, "authUserId");
  assertRequired(role, "role");

  const user = await prisma.user.create({
    data: {
      authUserId,
      role,
      lastLogin: lastLogin ? new Date(lastLogin) : null,
    },
  });
  return user;
}

// Get list users (sederhana, dengan paginasi opsional)
async function listUsers({ page = 1, pageSize = 20 } = {}) {
  const take = Math.min(Number(pageSize) || 20, 100);
  const skip = Math.max((Number(page) || 1) - 1, 0) * take;

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: {
        influencer: true, // 1-1, boleh null
      },
    }),
    prisma.user.count(),
  ]);

  return {
    items,
    total,
    page: Number(page),
    pageSize: take,
  };
}

// Get detail user
async function getUserById(id) {
  assertRequired(id, "id");
  const user = await prisma.user.findUnique({
    where: { authUserId: id },
    include: {
      influencer: true,
      activities: {
        orderBy: { timestamp: "desc" },
        take: 20,
      },
    },
  });
  if (!user) {
    const e = new Error("User not found");
    e.status = 404;
    throw e;
  }
  return user;
}

// Get detail user by username
async function getUserByUsername(username) {
  assertRequired(username, "username");
  const user = await prisma.influencer.findUnique({
    where: { handle: username },
    include: {
      user: true,
    },
  });
  if (!user) {
    const e = new Error("User not found");
    e.status = 404;
    throw e;
  }
  return user;
}

// Update user (role, lastLogin)
async function updateUser(id, payload) {
  assertRequired(id, "id");

  const data = {};
  if (payload.role !== undefined) data.role = payload.role;
  if (payload.lastLogin !== undefined)
    data.lastLogin = payload.lastLogin ? new Date(payload.lastLogin) : null;

  const updated = await prisma.user.update({
    where: { authUserId: id },
    data,
  });
  return updated;
}

// Delete user
async function deleteUser(id) {
  assertRequired(id, "id");
  // Hati-hati: jika ada FK dari Influencer -> User (unique), Prisma akan error jika masih ada relasi.
  // Sederhana: coba hapus Influencer dulu jika ada.
  await prisma.influencer.deleteMany({ where: { userId: id } });
  const deleted = await prisma.user.delete({ where: { id } });
  return deleted;
}

module.exports = {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserByUsername,
};
