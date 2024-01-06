const router = require("express").Router();
const usersService = require("../service/users");
const purchaseService = require("../service/purchase");
const badgeService = require("../service/badge");
const ApiResponse = require("../model/ApiResponse");
const { auth } = require("../middleware/auth");

router.get("/getUsers", auth, (req, res, next) => {
  usersService
    .getUsers(req.query.formId)
    .then((results) => {
      if (results) {
        res.status(200).json(new ApiResponse("", results));
      }
    })
    .catch((err) => next(err));
});

router.get("/getUsersByNameNEventId", auth, (req, res, next) => {
  usersService
    .getUsersByNameNEventId(req.query.name, req.query.eventId)
    .then((results) => {
      if (results) {
        res.status(200).json(new ApiResponse("", results));
      }
    })
    .catch((err) => next(err));
});

router.post("/updateUser", auth, async (req, res, next) => {
  try {
    const user = req.body.payload;
    const userColumns = [
      "firstname",
      "surname",
      "email",
      "phone",
      "jobTitle",
      "organization",
    ];
    const purchaseColumns = ["paymentStatus"];

    const userResult = await usersService.updateUser(user, userColumns);

    let purchaseResult = null;

    if (user.paymentStatus)
      purchaseResult = await purchaseService.updatePurchase(
        {
          id: user.pId,
          paymentStatus: user.paymentStatus,
        },
        purchaseColumns
      );

    let badgeResult = null;

    if (user.badgeStatus != undefined) {
      badgeResult = await badgeService.updateBadgeStatus(
        user.bId,
        user.badgeStatus
      );
    }

    res.status(200).json(
      new ApiResponse("User updated!", {
        ...userResult,
        ...purchaseResult,
        ...badgeResult,
      })
    );
  } catch (err) {
    next(err);
  }
});

router.post("/updatePaymentStatus", auth, (req, res, next) => {
  const user = req.body.payload;
  const purchaseColumns = ["paymentStatus"];
  purchaseService
    .updatePurchase(
      {
        id: user.pId,
        paymentStatus: user.paymentStatus,
      },
      purchaseColumns
    )
    .then((result) => {
      res.status(200).json(new ApiResponse("Payment status updated!", result));
    })
    .catch((err) => next(err));
});

router.get("/deleteUser", auth, (req, res, next) => {
  usersService
    .deleteUser(req.query.userId, req.query.registrationId)
    .then((results) => {
      if (results) {
        res
          .status(200)
          .json(new ApiResponse("User deleted!", req.query.userId));
      }
    })
    .catch((err) => next(err));
});

router.get("/getExhibitorsByFormId", auth, (req, res, next) => {
  usersService
    .getExhibitorsByFormId(req.query.formId)
    .then((results) => {
      if (results) {
        res.status(200).json(new ApiResponse("", results));
      }
    })
    .catch((err) => next(err));
});

module.exports = router;
