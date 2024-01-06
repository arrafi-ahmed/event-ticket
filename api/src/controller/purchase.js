const router = require("express").Router();
const purchaseService = require("../service/purchase");
const ApiResponse = require("../model/ApiResponse");
const { auth } = require("../middleware/auth");
const badgeService = require("../service/badge");

router.post("/createPaymentIntent", async (req, res, next) => {
  purchaseService
    .createPaymentIntent(req.body)
    .then((result) => {
      res.status(200).json(new ApiResponse(null, result));
    })
    .catch((err) => next(err));
});

router.get("/printInvoice", auth, (req, res, next) => {
  purchaseService
    .getInvoiceByPurchaseId(req.query.payload)
    .then((result) => {
      res.status(200).json(new ApiResponse(null, result));
    })
    .catch((err) => next(err));
});

module.exports = router;
