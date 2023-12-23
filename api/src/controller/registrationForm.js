const router = require("express").Router();
const registrationFormService = require("../service/registrationForm");
const ApiResponse = require("../model/ApiResponse");
const auth = require("../middleware/auth");

router.post("/saveForm", auth, (req, res, next) => {
  registrationFormService
    .saveForm(req.body)
    .then((results) => {
      if (results) {
        res
          .status(200)
          .json(new ApiResponse("Form creation successful!", results[0]));
      }
    })
    .catch((err) => next(err));
});

router.post("/saveFormType", auth, (req, res, next) => {
  registrationFormService
    .saveFormType(req.body)
    .then((results) => {
      if (results) {
        res
          .status(200)
          .json(new ApiResponse("Form Type creation successful!", results[0]));
      }
    })
    .catch((err) => next(err));
});

router.get("/getFormTypesByEventId", auth, (req, res, next) => {
  registrationFormService
    .getFormTypesByEventId(req.query.eventId)
    .then((results) => res.status(200).json(new ApiResponse(null, results)))
    .catch((err) => next(err));
});

router.get("/getAllForms", auth, (req, res, next) => {
  registrationFormService
    .getAllForms(req.query.eventId)
    .then((results) => res.status(200).json(new ApiResponse(null, results)))
    .catch((err) => next(err));
});

router.get("/getFields", (req, res, next) => {
  registrationFormService
    .getFields()
    .then((results) => res.status(200).json(new ApiResponse(null, results)))
    .catch((err) => next(err));
});

router.get("/getForm", auth, (req, res, next) => {
  registrationFormService
    .getForm(req.query.formId)
    .then((results) => res.status(200).json(new ApiResponse(null, results[0])))
    .catch((err) => next(err));
});

router.get("/getFormWQuestion", (req, res, next) => {
  registrationFormService
    .getFormWQuestion(req.query.formId)
    .then((results) => res.status(200).json(new ApiResponse(null, results[0])))
    .catch((err) => next(err));
});

router.get("/getFormWAnswer", (req, res, next) => {
  registrationFormService
    .getFormWAnswer(req.query.formId, req.query.formFiller)
    .then((result) => res.status(200).json(new ApiResponse(null, result)))
    .catch((err) => next(err));
});

router.post("/submitUserForm", (req, res, next) => {
  registrationFormService
    .submitUserForm(req.body)
    .then((result) => {
      if (result) {
        res
          .status(200)
          .json(
            new ApiResponse(
              "Registration successful! Invoice sent to email!",
              result
            )
          );
      }
    })
    .catch((err) => next(err));
});

router.post("/areRegisteredUsersExist", (req, res, next) => {
  const {
    payload: { allStandardAnswers, formId },
  } = req.body;

  const users = allStandardAnswers.map((parentItem) => {
    const [, , , , , , email] = parentItem; // Use array destructuring to get the element at index 6
    return { email }; // Return the user object with the email property
  });

  registrationFormService
    .areRegisteredUsersExist(users, formId)
    .then((result) => res.status(200).json(new ApiResponse(null, result)))
    .catch((err) => next(err));
});

module.exports = router;
