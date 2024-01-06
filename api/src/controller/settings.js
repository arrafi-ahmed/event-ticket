const router = require("express").Router();
const ApiResponse = require("../model/ApiResponse");
const { auth, isAdmin } = require("../middleware/auth");
const settingsService = require("../service/settings");

router.get("/getSettingsWOPrivateKeys", (req, res, next) => {
  settingsService
    .getSettingsWOPrivateKeys()
    .then((result) => res.status(200).json(new ApiResponse(null, result)))
    .catch((err) => next(err));
});

router.get("/getSettings", auth, isAdmin, (req, res, next) => {
  settingsService
    .getSettings()
    .then((result) => res.status(200).json(new ApiResponse(null, result)))
    .catch((err) => next(err));
});

router.post("/saveSettings", auth, isAdmin, (req, res, next) => {
  settingsService
    .saveSettings(req.body)
    .then((results) =>
      res.status(200).json(new ApiResponse("Settings saved!", results))
    )
    .catch((err) => next(err));
});

module.exports = router;
