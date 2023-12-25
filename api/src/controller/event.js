const router = require("express").Router();
const eventService = require("../service/event");
const ApiResponse = require("../model/ApiResponse");
const auth = require("../middleware/auth");
const { uploadEventLogo } = require("../middleware/upload");
const compressImages = require("../middleware/compress");

router.post(
  "/save",
  auth,
  uploadEventLogo,
  compressImages,
  (req, res, next) => {
    eventService
      .save({ body: req.body, files: req.files, userId: req.currentUser.id })
      .then((result) => {
        res.status(200).json(new ApiResponse("Event saved!", result));
      })
      .catch((err) => next(err));
  }
);

router.get("/getAllEvents", auth, (req, res, next) => {
  eventService
    .getAllEvents()
    .then((results) => res.status(200).json(new ApiResponse(null, results)))
    .catch((err) => next(err));
});

router.get("/getEvent", (req, res, next) => {
  eventService
    .getEventById(req.query.eventId)
    .then((results) => res.status(200).json(new ApiResponse(null, results[0])))
    .catch((err) => next(err));
});

router.get("/getEventByAppUserId", (req, res, next) => {
  eventService
    .getEventByAppUserId(req.query.userId)
    .then((result) => res.status(200).json(new ApiResponse(null, result)))
    .catch((err) => next(err));
});
module.exports = router;
