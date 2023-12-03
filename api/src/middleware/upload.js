const Busboy = require("busboy");
const path = require("path");
const fs = require("fs");
const CustomError = require("../model/CustomError");

const maxSize = 25 * 1024 * 1024; // 25 MB
const tempDir = path.join(__dirname, "..", "..", "public", "tmp");

function createUpload(prefix) {
  return (req, res, next) => {
    // If the request is not multipart/form-data, skip file processing
    if (!req.is("multipart/form-data")) {
      return next();
    }

    const busboy = Busboy({
      headers: req.headers,
      limits: { fileSize: maxSize },
    });

    let files = [];
    busboy.on("file", (name, file, info) => {
      const ext = path.extname(info.filename).toLowerCase();

      // Only allow .jpg, .jpeg, and .png files
      if (![".jpg", ".jpeg", ".png"].includes(ext)) {
        return next(
          new CustomError(
            "Invalid file type! Only .jpg, .jpeg, and .png files are allowed.",
            415
          )
        );
      }

      const newName =
        prefix +
        "-" +
        Date.now() +
        "-" +
        Math.round(Math.random() * 1e5) +
        path.extname(info.filename);
      const saveTo = path.join(tempDir, newName);

      file.pipe(fs.createWriteStream(saveTo));

      file.on("end", () => {
        files.push({
          destination: tempDir,
          filename: newName,
          path: saveTo,
          size: fs.statSync(saveTo).size,
        });
      });
    });

    busboy.on("field", function (fieldname, val) {
      req.body[fieldname] = val;
    });

    busboy.on("finish", () => {
      if (files.length > 0) {
        req.files = files;
      }
      next();
    });
    return req.pipe(busboy);
  };
}

const uploadUser = createUpload("user");
const uploadEventLogo = createUpload("eventLogo");

module.exports = { uploadUser, uploadEventLogo };
