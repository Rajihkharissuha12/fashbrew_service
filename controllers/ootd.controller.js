// controllers/ootd.controller.js
const { default: axios } = require("axios");
const service = require("../services/ootd.services");

exports.createOotd = async (req, res) => {
  try {
    const data = await service.createOotd(req.body);
    return res.status(201).json({ data });
  } catch (e) {
    return res
      .status(e.status || 500)
      .json({ message: e.message || "Gagal membuat OOTD" });
  }
};

exports.listOotds = async (req, res) => {
  try {
    const result = await service.listOotds(req.query);
    return res.json(result);
  } catch (e) {
    return res
      .status(e.status || 500)
      .json({ message: e.message || "Gagal mengambil OOTD" });
  }
};

exports.getListOotdByUsername = async (req, res) => {
  console.log("LIST DATA OOTD");
  try {
    const data = await service.getListOotdByUsername(req.params.username);
    return res.json({ data });
  } catch (e) {
    return res
      .status(e.status || 500)
      .json({ message: e.message || "Gagal mengambil detail OOTD" });
  }
};

exports.getOotdById = async (req, res) => {
  try {
    console.log("get detail ootd by id : ", req.params.id);
    const data = await service.getOotdById(req.params.id);
    return res.json({ data });
  } catch (e) {
    return res
      .status(e.status || 500)
      .json({ message: e.message || "Gagal mengambil detail OOTD" });
  }
};

exports.updateOotd = async (req, res) => {
  try {
    const data = await service.updateOotd(req.params.id, req.body);
    return res.json({ data });
  } catch (e) {
    return res
      .status(e.status || 500)
      .json({ message: e.message || "Gagal mengubah OOTD" });
  }
};

exports.deleteOotd = async (req, res) => {
  try {
    const data = await service.deleteOotd(req.params.id);
    return res.json({ message: "OOTD dihapus", data });
  } catch (e) {
    return res
      .status(e.status || 500)
      .json({ message: e.message || "Gagal menghapus OOTD" });
  }
};

exports.attachProduct = async (req, res) => {
  try {
    const data = await service.attachProduct(req.params.id, req.body);
    return res.status(201).json({ data });
  } catch (e) {
    return res
      .status(e.status || 500)
      .json({ message: e.message || "Gagal menambah produk ke OOTD" });
  }
};

exports.detachProduct = async (req, res) => {
  try {
    const data = await service.detachProduct(
      req.params.id,
      req.params.productId
    );
    return res.json({ message: "Produk dihapus dari OOTD", data });
  } catch (e) {
    return res
      .status(e.status || 500)
      .json({ message: e.message || "Gagal menghapus produk dari OOTD" });
  }
};

exports.updateProductInOotd = async (req, res) => {
  try {
    const { ootdId } = req.params;
    const { productId, note, position } = req.body;

    const result = await service.updateProductInOotd(ootdId, productId, {
      note,
      position,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.addView = async (req, res) => {
  try {
    const data = await service.addView(req.params.id, req);
    return res.json({ data });
  } catch (e) {
    return res
      .status(e.status || 500)
      .json({ message: e.message || "Gagal menambah view" });
  }
};

exports.addLike = async (req, res) => {
  try {
    const data = await service.addLike(req.params.id);
    return res.json({ data });
  } catch (e) {
    return res
      .status(e.status || 500)
      .json({ message: e.message || "Gagal menambah like" });
  }
};

exports.logClick = async (req, res) => {
  try {
    const data = await service.logClick(req.body);
    return res.status(201).json({ message: "Klik tercatat", data });
  } catch (e) {
    return res
      .status(e.status || 500)
      .json({ message: e.message || "Gagal mencatat klik" });
  }
};

exports.addMedia = async (req, res) => {
  try {
    const { idootd } = req.params;
    const files = req.files;
    const result = await service.addMedia(idootd, files, req.body);
    res.status(200).json(result);
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ success: false, message: error.message });
  }
};

exports.setBanner = async (req, res) => {
  try {
    const data = await service.setBanner(req.body);
    return res.json({ data });
  } catch (error) {
    return res
      .status(e.status || 500)
      .json({ message: e.message || "Gagal mengubah banner" });
  }
};

exports.deleteMedia = async (req, res) => {
  console.log("HAPUS MEDIA");
  try {
    const data = await service.deleteMedia(req.params.id);

    return res.json({ data });
  } catch (error) {
    return res
      .status(e.status || 500)
      .json({ message: e.message || "Gagal menghapus media" });
  }
};
