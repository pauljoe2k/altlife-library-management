const apiKeyAuth = (req, res, next) => {
  const key = req.headers["x-api-key"];

  if (!key || key !== process.env.API_KEY) {
    return res.status(401).json({
      status: "fail",
      error: "Unauthorized",
      message: "Missing or invalid API key. Please provide the 'x-api-key' header with the correct secret key.",
    });
  }

  next();
};

module.exports = {
  apiKeyAuth,
};