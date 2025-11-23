const svc = require("../services/influencer.service");

async function create(req, res, next) {
  try {
    const data = await svc.createInfluencer(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const page = req.query.page ? Number(req.query.page) : undefined;
    const pageSize = req.query.pageSize
      ? Number(req.query.pageSize)
      : undefined;
    const q = req.query.q ? String(req.query.q) : "";
    const active =
      typeof req.query.active === "string"
        ? req.query.active === "true"
          ? true
          : req.query.active === "false"
          ? false
          : undefined
        : undefined;

    const result = await svc.listInfluencers({ page, pageSize, q, active });
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
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const data = await svc.getInfluencerById(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function getByHandle(req, res, next) {
  try {
    const data = await svc.getInfluencerByHandle(req.params.handle);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function getByUserId(req, res, next) {
  try {
    const data = await svc.getInfluencerByUserId(req.params.userId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const data = await svc.updateInfluencer(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const data = await svc.deleteInfluencer(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  create,
  list,
  getById,
  getByHandle,
  getByUserId,
  update,
  remove,
};
