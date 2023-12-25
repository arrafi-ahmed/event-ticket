const router = require("express").Router();
const ApiResponse = require("../model/ApiResponse");
const auth = require("../middleware/auth");
const reportService = require("../service/report");

router.get("/downloadAttendeeReport", auth, (req, res, next) => {
  reportService
    .downloadAttendeeReport(req.query.eventId)
    .then(async (workbook) => {
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=" + "attendee-report.xlsx"
      );
      await workbook.xlsx.write(res);
      res.end();
    })
    .catch((err) => next(err));
});

router.get("/downloadCheckinReport", auth, (req, res, next) => {
  reportService
    .downloadCheckinReport(req.query.eventId)
    .then(async (workbook) => {
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=" + "checkin-report.xlsx"
      );
      await workbook.xlsx.write(res);
      res.end();
    })
    .catch((err) => next(err));
});

router.get("/downloadFinancialReport", auth, (req, res, next) => {
  reportService
    .downloadFinancialReport(req.query.eventId)
    .then(async (workbook) => {
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=" + "financial-report.xlsx"
      );
      await workbook.xlsx.write(res);
      res.end();
    })
    .catch((err) => next(err));
});

router.get("/downloadScannedBadgeReport", auth, (req, res, next) => {
  reportService
    .downloadScannedBadgeReport(req.query.eventId)
    .then(async (zipBuffer) => {
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", "attachment; filename=reports.zip");
      res.end(zipBuffer);
    })
    .catch((err) => next(err));
});

router.get("/downloadSurveyReport", auth, (req, res, next) => {
  reportService
    .downloadSurveyReport(req.query.eventId)
    .then(async (zipBuffer) => {
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", "attachment; filename=reports.zip");
      res.end(zipBuffer);
    })
    .catch((err) => next(err));
});

module.exports = router;
