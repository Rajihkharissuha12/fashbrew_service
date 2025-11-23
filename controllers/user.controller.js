const service = require("../services/user.service");

// POST /api/users
async function create(req, res, next) {
  try {
    const data = await service.createUser(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// GET /api/users
async function list(req, res, next) {
  try {
    const page = req.query.page ? Number(req.query.page) : undefined;
    const pageSize = req.query.pageSize
      ? Number(req.query.pageSize)
      : undefined;
    const data = await service.listUsers({ page, pageSize });
    res.json({
      success: true,
      data: data.items,
      meta: { total: data.total, page: data.page, pageSize: data.pageSize },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/users/:id
async function getById(req, res, next) {
  console.log("get user by id");
  try {
    const data = await service.getUserById(req.params.id);
    return res.json({ success: true, data });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

//  GET / api/users/:username
async function getByUsername(req, res, next) {
  console.log("get user by username");
  try {
    const data = await service.getUserByUsername(req.params.username);
    return res.json({ success: true, data });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

// PATCH /api/users/:id
async function update(req, res, next) {
  try {
    const data = await service.updateUser(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/users/:id
async function remove(req, res, next) {
  try {
    const data = await service.deleteUser(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, getById, update, remove, getByUsername };
