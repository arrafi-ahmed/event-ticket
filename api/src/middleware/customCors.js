const cors = require("cors");
const CustomError = require("../model/CustomError");

const excludedUrls = ["/api/user/acceptInvite"];

const customCors = (req, res, next) => {
  const corsOptions = {
    origin: (origin, callback) => {
      let urlwww;
      if (req.protocol === "https") {
        urlwww = `https://www.${req.CLIENT_BASE_URL.slice(9)}`;
      } else if (req.protocol === "http") {
        urlwww = `http://www.${req.CLIENT_BASE_URL.slice(8)}`;
      } else {
        throw new CustomError(`Unsupported protocol: ${req.protocol}`);
      }
      const allowedOrigins = [req.CLIENT_BASE_URL];
      if (urlwww) {
        allowedOrigins.push(urlwww);
      }
      // console.log(2, origin, allowedOrigins)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    exposedHeaders: "authorization",
    credentials: true,
  };
  const isExcluded = excludedUrls.some((url) => req.originalUrl.includes(url));
  if (isExcluded) {
    return next();
  }
  return cors(corsOptions)(req, res, next);
};

module.exports = customCors;
