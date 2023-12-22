const fs = require("fs").promises;
const fsSync = require("fs");
const path = require("path");
const qr = require("qrcode");
const { API_BASE_URL, VUE_BASE_URL, ANDROID_BASE_URL } = process.env;

const dirMap = {
  tmp: path.join(__dirname, "..", "..", "public", "tmp"),
  user: path.join(__dirname, "..", "..", "public", "user"),
  eventLogo: path.join(__dirname, "..", "..", "public", "event-logo"),
};

const getPrefix = (filename) => {
  return filename.split("-")[0];
};

const getDirPath = (prefix) => {
  return dirMap[prefix];
};

const getFilePath = (filename, prefix) => {
  const calcPrefix = prefix || getPrefix(filename);
  return path.join(dirMap[calcPrefix], filename);
};

const removeImages = async (imageArr) => {
  imageArr.map((image) => {
    const filePath = getFilePath(image);
    if (filePath) {
      return fs.unlink(filePath);
    } else {
      console.error("removeImages() - Invalid file path:", filePath);
      return Promise.resolve(); // Return a resolved promise to prevent further errors.
    }
  });
};

const moveImage = (sourcePath, destinationPath) => {
  return fs.rename(sourcePath, destinationPath);
};

const formatDate = (inputDate) => {
  const date = new Date(inputDate);
  const day = `0${date.getDate()}`.slice(-2);
  const month = `0${date.getMonth() + 1}`.slice(-2);
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const logoSvgString = fsSync.readFileSync(
  path.join(__dirname, "./logo.svg"),
  "utf8"
);

const getCurrencySymbol = (currencyCode, type) => {
  const currencyCodeLower = currencyCode.toString().toLowerCase();

  const currencyMap = {
    usd: { icon: "mdi-currency-usd", symbol: "$" },
    gbp: { icon: "mdi-currency-gbp", symbol: "£" },
    eur: { icon: "mdi-currency-eur", symbol: "€" },
  };

  return currencyMap[currencyCodeLower][type];
};

const generateQrCode = async ({ id, qrUuid }) => {
  const data = JSON.stringify({ id, qrUuid });
  const qrCode = await qr.toDataURL(data);
  return qrCode.split(",")[1]; // Extract base64 data
};

module.exports = {
  API_BASE_URL,
  VUE_BASE_URL,
  ANDROID_BASE_URL,
  dirMap,
  generateQrCode,
  getCurrencySymbol,
  moveImage,
  getPrefix,
  getDirPath,
  getFilePath,
  removeImages,
  formatDate,
  logoSvgString,
};
