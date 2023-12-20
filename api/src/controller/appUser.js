const router = require("express").Router();
const appUsersService = require("../service/appUser");
const ApiResponse = require("../model/ApiResponse");
const auth = require("../middleware/auth");

router.get("/getAppUser", auth, (req, res, next) => {
  appUsersService
    .getAppUser(req.query.eventId)
    .then((results) => {
      if (results) {
        res.status(200).json(new ApiResponse("", results));
      }
    })
    .catch((err) => next(err));
});

router.post("/saveAppUser", auth, (req, res, next) => {
  appUsersService
    .saveAppUser(req.body)
    .then((results) => {
      if (results) {
        res.status(200).json(new ApiResponse("", results[0]));
      }
    })
    .catch((err) => next(err));
});

module.exports = router;
