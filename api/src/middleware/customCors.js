const cors = require("cors");

// const excludedUrls = ["/api/user/acceptInvite"];
const excludedUrls = [];

const customCors = (req, res, next) => {
  const corsOptions = {
    origin: req.CLIENT_BASE_URL,
    exposedHeaders: "authorization",
    credentials: true,
  };

  const corsMiddleware = cors(corsOptions);

  const isExcluded = excludedUrls.some((url) => {
    req.originalUrl.includes(url);
  });
  if (isExcluded) {
    return next();
  }
  return corsMiddleware(req, res, next);
};

module.exports = customCors;
