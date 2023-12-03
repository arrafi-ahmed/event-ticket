const router = require("express").Router();
const usersService = require("../service/users");
const ApiResponse = require("../model/ApiResponse");
const auth = require("../middleware/auth");

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

module.exports = router;
