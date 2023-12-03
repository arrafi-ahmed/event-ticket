const router = require("express").Router();
const purchaseService = require("../service/purchase");
const ApiResponse = require("../model/ApiResponse");
const auth = require("../middleware/auth");

// router.post("/save", (req, res, next) => {
//   purchaseService
//     .saveBadge(req.body)
//     .then((results) => {
//       if (results) {
//         res
//           .status(200)
//           .json(
//             new ApiResponse("Badge design creation successful!", results[0])
//           );
//       }
//     })
//     .catch((err) => next(err));
// });

router.post("/createPaymentIntent", async (req, res, next) => {
  purchaseService
    .createPaymentIntent(req.body)
    .then((result) => {
      res.status(200).json(new ApiResponse(null, result));
    })
    .catch((err) => next(err));
});

module.exports = router;
