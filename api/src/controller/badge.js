const router = require("express").Router();
const ApiResponse = require("../model/ApiResponse");
const auth = require("../middleware/auth");
const registrationFormService = require("../service/registrationForm");
const badgeService = require("../service/badge");

router.get("/print", auth, (req, res, next) => {
    badgeService
        .getBadgeWDesignWVisibility(req.query.badgeId)
        .then((result) => {
            res.status(200).json(new ApiResponse(null, result));
        })
        .catch((err) => next(err));
});

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
    const {id, qrUuid} = JSON.parse(req.query.qrCodeData);
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

router.get("/scanBadgeByExhibitor", auth, (req, res, next) => {
    const {id, qrUuid} = JSON.parse(req.query.qrCodeData);
    badgeService
        .scanBadgeByExhibitor(id, req.currentUser.id)
        .then((result) => {
            res.status(200).json(new ApiResponse(null, result));
        })
        .catch((err) => next(err));
});

router.get("/getExhibitorVisibilityByFormId", auth, (req, res, next) => {
    badgeService
        .getExhibitorVisibilityByFormId(req.query.formId)
        .then((result) => {
            res.status(200).json(new ApiResponse(null, result));
        })
        .catch((err) => next(err));
});

router.post("/addExhibitorVisibility", auth, (req, res, next) => {
    badgeService
        .addExhibitorVisibility(req.body)
        .then((updatedBadge) => {
            return badgeService.getBadgeWDesignWVisibility(updatedBadge.id);
        })
        .then((result) => {
            res
                .status(200)
                .json(new ApiResponse("Exhibitor visibility saved", result));
        })
        .catch((err) => next(err));
});

module.exports = router;
