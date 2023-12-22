const router = require("express").Router();
const ApiResponse = require("../model/ApiResponse");
const auth = require("../middleware/auth");
const registrationFormService = require("../service/registrationForm");
const badgeService = require("../service/badge");

router.get("/checkin", auth, (req, res, next) => {
  badgeService
    .updateBadgeStatus(req.query.userId, req.query.purchaseId)
    .then((updatedBadge) => {
      return badgeService.getBadgeWDesignWVisibility(updatedBadge.id);
    })
    .then((result) => {
      res.status(200).json(new ApiResponse(null, result));
    })
    .catch((err) => next(err));
});

router.get("/scanBadge", auth, (req, res, next) => {
  console.log(2, req.query);
  const { id, qrUuid } = JSON.parse(req.query.qrCodeData);

  badgeService
    .validateQrCode(id, qrUuid, req.query.eventId)
    .then((result) => {
      return badgeService.updateBadgeStatus(result.id, result.purchaseId);
    })
    .then((updatedBadge) => {
      return badgeService.getBadgeWDesignWVisibility(updatedBadge.id);
    })
    .then((result) => {
      res.status(200).json(new ApiResponse(null, result));
    })
    .catch((err) => next(err));
});

module.exports = router;
