const router = require("express").Router();
const badgeService = require("../service/badgeDesign");
const ApiResponse = require("../model/ApiResponse");
const auth = require("../middleware/auth");
const registrationFormService = require("../service/registrationForm");

router.post("/saveBadgeDesign", auth, (req, res, next) => {
  badgeService
    .saveBadgeDesign(req.body)
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

router.get("/getAllBadgeDesigns", auth, (req, res, next) => {
  badgeService
    .getAllBadgeDesigns(req.query.eventId)
    .then((results) => res.status(200).json(new ApiResponse(null, results)))
    .catch((err) => next(err));
});

router.get("/getBadgeDesignByFormId", auth, (req, res, next) => {
  badgeService
    .getBadgeDesignByFormId(req.query.formId)
    .then((result) => res.status(200).json(new ApiResponse(null, result)))
    .catch((err) => next(err));
});

router.get("/getBadgeDesignWVisibility", auth, (req, res, next) => {
  badgeService
    .getBadgeDesignWVisibility(req.query.badgeDesignId)
    .then((result) => res.status(200).json(new ApiResponse(null, result)))
    .catch((err) => next(err));
});

module.exports = router;
