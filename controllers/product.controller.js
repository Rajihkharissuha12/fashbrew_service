// controllers/product.controller.js
const svc = require("../services/product.service");
const { getUserById } = require("../services/user.service");

async function create(req, res, next) {
  try {
    const data = await svc.createProduct(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

async function list(req, res, next) {
  console.log("LIST PRODUCT");
  try {
    const { userId, q, page, pageSize } = req.query;

    const result = await svc.listProducts({
      userId,
      q: q ? String(q).trim() : undefined,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });
    console.log(result);
    res.json({
      success: true,
      data: result.items,
      meta: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
      },
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const data = await svc.getProductById(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function getByUsername(req, res, next) {
  try {
    const data = await svc.getProductByUsername(req.params.username);
    res.json({ success: true, data });
  } catch (error) {
    next(err);
  }
}

async function update(req, res, next) {
  console.log("UPDATE PRODUCT");
  try {
    const data = await svc.updateProduct(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const data = await svc.deleteProduct(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function updatePlatforms(req, res, next) {
  try {
    const data = await svc.updatePlatforms(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (error) {
    next(err);
  }
}

async function addPlatforms(req, res, next) {
  try {
    const data = await svc.addPlatforms(req.params.idproduct, req.body);
    res.json({ success: true, data });
  } catch (error) {
    next(err);
  }
}

module.exports = {
  create,
  list,
  getById,
  update,
  remove,
  updatePlatforms,
  addPlatforms,
  getByUsername,
};
