const router = require("express").Router();
const ticketService = require("../service/ticket");
const ApiResponse = require("../model/ApiResponse");
const auth = require("../middleware/auth");

router.post("/save", auth, (req, res, next) => {
  ticketService
    .saveTicket(req.body)
    .then((results) => {
      if (results) {
        res.status(200).json(new ApiResponse("Ticket saved!", results[0]));
      }
    })
    .catch((err) => next(err));
});

router.get("/getTicketsWEarlyBirdActivated", (req, res, next) => {
  ticketService
    .getTicketsWEarlyBirdActivated(req.query.formId)
    .then((results) => {
      if (results) {
        res.status(200).json(new ApiResponse("", results));
      }
    })
    .catch((err) => next(err));
});

router.get("/getTickets", (req, res, next) => {
  ticketService
    .getTickets(req.query.formId)
    .then((results) => {
      if (results) {
        res.status(200).json(new ApiResponse("", results));
      }
    })
    .catch((err) => next(err));
});

router.get("/getTicket", (req, res, next) => {
  ticketService
    .getTicket(req.query.ticketId)
    .then((result) => {
      if (result) {
        res.status(200).json(new ApiResponse("", result));
      }
    })
    .catch((err) => next(err));
});

module.exports = router;
