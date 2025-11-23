// Error handler sederhana & konsisten
function errorHandler(err, req, res, next) {
  // Prisma known errors (opsional sederhana)
  if (err && err.code === "P2002") {
    return res.status(409).json({
      success: false,
      message: "Duplicate value (unique constraint)",
      details: err.meta || null,
    });
  }
  if (err && err.code === "P2025") {
    return res.status(404).json({
      success: false,
      message: "Record not found",
      details: err.meta || null,
    });
  }

  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
}

module.exports = { errorHandler };
