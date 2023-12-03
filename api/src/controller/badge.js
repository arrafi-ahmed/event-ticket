const router = require("express").Router();
const badgeService = require("../service/badge");
const ApiResponse = require("../model/ApiResponse");
const auth = require("../middleware/auth");
const registrationFormService = require("../service/registrationForm");

router.post("/save", auth, (req, res, next) => {
  badgeService
    .saveBadge(req.body)
    .then((results) => {
      if (results) {
        res
          .status(200)
          .json(
            new ApiResponse("Badge design creation successful!", results[0])
          );
      }
    })
    .catch((err) => next(err));
});

router.get("/getAllBadges", auth, (req, res, next) => {
  badgeService
    .getAllBadges(req.query.eventId)
    .then((results) => res.status(200).json(new ApiResponse(null, results)))
    .catch((err) => next(err));
});

router.get("/getBadge", auth, (req, res, next) => {
  badgeService
    .getBadge(req.query.badgeId, req.query.registrationFormId)
    .then((result) => res.status(200).json(new ApiResponse(null, result)))
    .catch((err) => next(err));
});

module.exports = router;
