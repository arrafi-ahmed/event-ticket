const router = require("express").Router();
const promoService = require("../service/promo");
const ApiResponse = require("../model/ApiResponse");
const { auth } = require("../middleware/auth");

router.post("/save", auth, (req, res, next) => {
  promoService
    .savePromo(req.body)
    .then((results) => {
      if (results) {
        res.status(200).json(new ApiResponse("Promo saved!", results[0]));
      }
    })
    .catch((err) => next(err));
});

router.get("/getPromos", (req, res, next) => {
  promoService
    .getPromos(req.query.formId)
    .then((results) => {
      if (results) {
        res.status(200).json(new ApiResponse("", results));
      }
    })
    .catch((err) => next(err));
});

router.get("/getPromo", (req, res, next) => {
  promoService
    .getPromo(req.query.promoId)
    .then((result) => {
      if (result) {
        res.status(200).json(new ApiResponse("", result));
      }
    })
    .catch((err) => next(err));
});

router.get("/getPromoByCodeNFormId", (req, res, next) => {
  promoService
    .getPromoByCodeNFormId(req.query.code, req.query.formId)
    .then((result) => {
      if (result) {
        res.status(200).json(new ApiResponse("", result));
      }
    })
    .catch((err) => next(err));
});

module.exports = router;
