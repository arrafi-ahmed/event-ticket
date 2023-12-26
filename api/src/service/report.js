const CustomError = require("../model/CustomError");
const { sql } = require("../db");
const ExcelJS = require("exceljs");
const archiver = require("archiver");
const appUserService = require("./appUser");
const registrationFormService = require("./registrationForm");

exports.downloadAttendeeReport = async (eventId) => {
  const users = await sql`
        select u.*, p.payment_status, t.name as t_name
        from users u
                 join purchase p on u.purchase_id = p.id
                 join ticket t on u.ticket_id = t.id
        where u.event_id = ${eventId}`;

  if (users.length === 0)
    throw new CustomError("No data available for report!", 404);

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Attendee Report");

  worksheet.columns = [
    { header: "User Id", key: "id", width: 10 },
    { header: "Name", key: "name", width: 30 },
    { header: "Email", key: "email", width: 30 },
    { header: "Organization", key: "organization", width: 30 },
    { header: "Ticket", key: "ticket", width: 30 },
    { header: "Payment Status", key: "status", width: 30 },
  ];

  users.forEach((item) => {
    worksheet.addRow({
      id: item.id,
      name: item.firstname + " " + item.surname,
      email: item.email,
      organization: item.organization,
      ticket: item.tName,
      status: item.paymentStatus,
    });
  });

  return workbook;
};

exports.downloadCheckinReport = async (eventId) => {
  const users = await sql`
        select u.*, b.badge_status, t.name as t_name
        from users u
                 join badge b on b.user_id = u.id
                 join ticket t on b.ticket_id = t.id
        where b.event_id = ${eventId}`;

  if (users.length === 0)
    throw new CustomError("No data available for report!", 404);

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Scanned Badge Report");

  worksheet.columns = [
    { header: "User Id", key: "id", width: 10 },
    { header: "Name", key: "name", width: 30 },
    { header: "Email", key: "email", width: 30 },
    { header: "Organization", key: "organization", width: 30 },
    { header: "Ticket", key: "ticket", width: 30 },
    { header: "Check-in Status", key: "status", width: 30 },
  ];

  users.forEach((item) => {
    worksheet.addRow({
      id: item.id,
      name: item.firstname + " " + item.surname,
      email: item.email,
      organization: item.organization,
      ticket: item.tName,
      status: item.badgeStatus == 0 ? "Not Checked-in" : "Checked-in",
    });
  });

  return workbook;
};

exports.downloadFinancialReport = async (eventId) => {
  const financialData = await sql`
        SELECT COALESCE(registration_form_type.name, 'Form Unavailable') AS form_name,
               SUM(purchase.total_amount - purchase.tax)                 AS net_income,
               SUM(purchase.tax)                                         AS tax,
               SUM(purchase.total_amount)                                AS revenue
        FROM purchase
                 LEFT JOIN
             registration_form ON purchase.registration_form_id = registration_form.id
                 LEFT JOIN
             registration_form_type ON registration_form.form_type_id = registration_form_type.id
        WHERE LOWER(purchase.payment_status) = 'succeeded'
          AND registration_form.event_id = ${eventId}
        GROUP BY purchase.registration_form_id, registration_form_type.name`;

  if (financialData.length === 0)
    throw new CustomError("No data available for report!", 404);

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Financial Report");

  worksheet.columns = [
    { header: "Form Name", key: "formName", width: 30 },
    { header: "Net Income", key: "netIncome", width: 30 },
    { header: "Tax", key: "tax", width: 30 },
    { header: "Revenue", key: "revenue", width: 30 },
  ];

  financialData.forEach((item) => {
    worksheet.addRow({
      formName: item.formName,
      netIncome: item.netIncome,
      tax: item.tax,
      revenue: item.revenue,
    });
  });

  return workbook;
};

exports.downloadScannedBadgeReport = async (eventId) => {
  const exhibitors = await appUserService.getExhibitorsByEventId(eventId);
  const exhibitorIds = exhibitors.map((item) => item.id);
  const scannedUsers = await sql`
        SELECT u.*, bs.*, u.id as u_id, bs.id as bs_id
        FROM users u
                 JOIN badge_scan bs ON u.id = bs.badge_id
        WHERE bs.exhibitor_id IN ${sql(exhibitorIds)}
    `;
  if (scannedUsers.length === 0)
    throw new CustomError("No data available for report!", 404);

  const archive = archiver("zip", {
    zlib: { level: 9 }, // Sets the compression level.
  });

  for (let exhibitor of exhibitors) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Scanned Badge Report");

    // ... populate the workbook ...
    const users = scannedUsers.filter(
      (item) => item.exhibitorId == exhibitor.id
    );
    worksheet.columns = [
      { header: "User Id", key: "id", width: 10 },
      { header: "Name", key: "name", width: 30 },
      { header: "Email", key: "email", width: 30 },
      { header: "Phone", key: "phone", width: 30 },
      { header: "Job Title", key: "jobTitle", width: 30 },
      { header: "Organization", key: "organization", width: 30 },
      { header: "Country", key: "country", width: 30 },
      { header: "Scanned At", key: "createdAt", width: 30 },
    ];

    users.forEach((item) => {
      worksheet.addRow({
        id: item.uId,
        name: item.firstname + " " + item.surname,
        email: item.email,
        phone: item.phone,
        jobTitle: item.jobTitle,
        organization: item.organization,
        country: item.country,
        createdAt: item.createdAt,
      });
    });
    const buffer = await workbook.xlsx.writeBuffer();
    archive.append(buffer, {
      name: `Exhibitor_Report-${exhibitor.username}-${exhibitor.organization}.xlsx`,
    });
  }

  await archive.finalize();

  return new Promise((resolve, reject) => {
    const chunks = [];
    archive.on("data", (chunk) => chunks.push(chunk));
    archive.on("end", () => resolve(Buffer.concat(chunks)));
    archive.on("error", reject);
  });
};

exports.downloadSurveyReport = async (eventId) => {
  let formsPromise = registrationFormService.getAllForms(eventId);
  let surveyDataPromise = sql`
        SELECT sf.user_id,
               sf.registration_form_id,
               sf.firstname,
               sf.surname,
               sf.email,
               json_agg(json_build_object('q', q.text, 'a', a.answer_text)) AS qa
        FROM survey_filler sf
                 JOIN
             unnest(sf.answer_id) WITH ORDINALITY AS t(answer_id, ord)
             ON
                 TRUE
                 JOIN
             answer a
             ON
                 a.id = t.answer_id
                 JOIN
             question q
             ON
                 q.id = a.question_id
        WHERE sf.event_id = ${eventId}
        GROUP BY sf.user_id,
                 sf.registration_form_id,
                 sf.firstname,
                 sf.surname,
                 sf.email
        ORDER BY sf.user_id;
    `;

  const [forms, surveyData] = await Promise.all([
    formsPromise,
    surveyDataPromise,
  ]);

  if (surveyData.length === 0)
    throw new CustomError("No data available for report!", 404);

  // Create a mapping of form IDs to form names
  let formIdToName = {};
  forms.forEach((form) => {
    formIdToName[form.rfId] = form.name;
  });

  let groupedSurveyData = surveyData.reduce((acc, item) => {
    let formName = formIdToName[item.registrationFormId];
    if (!acc[formName]) {
      // If this form hasn't been seen before, create a new array for it
      acc[formName] = [
        {
          userId: item.userId,
          firstname: item.firstname,
          surname: item.surname,
          email: item.email,
          qa: item.qa || [], // Replace undefined with an empty array
        },
      ];
    } else {
      // If this form has been seen before, append the new user
      acc[formName].push({
        userId: item.userId,
        firstname: item.firstname,
        surname: item.surname,
        email: item.email,
        qa: item.qa || [], // Replace undefined with an empty array
      });
    }
    return acc;
  }, {});

  const archive = archiver("zip", {
    zlib: { level: 9 }, // Sets the compression level.
  });

  for (let key in groupedSurveyData) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Survey Report");

    let columns = [
      { header: "User Id", key: "id", width: 10 },
      { header: "Name", key: "name", width: 30 },
      { header: "Email", key: "email", width: 30 },
    ];

    // Add a column for each question
    groupedSurveyData[key][0].qa.forEach((item, index) => {
      columns.push({ header: item.q, key: `q${index}`, width: 50 });
    });

    // Set the columns on the worksheet
    worksheet.columns = columns;

    // get all questions in a order
    let allQuestions = new Set();
    groupedSurveyData[key].forEach((item) => {
      item.qa.forEach((qaItem) => {
        allQuestions.add(qaItem.q);
      });
    });
    let questionOrder = Array.from(allQuestions);

    groupedSurveyData[key].forEach((item) => {
      let row = {
        id: item.userId,
        name: item.firstname + " " + item.surname,
        email: item.email,
      };
      //order answer according to question
      let qaOrdered = questionOrder.map((question) => {
        let answerObj = item.qa.find((qaItem) => qaItem.q === question);
        return answerObj ? answerObj : { q: question, a: "" };
      });

      qaOrdered.forEach((item, index) => {
        row[`q${index}`] = item.a;
      });

      worksheet.addRow(row);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    archive.append(buffer, { name: `Survey_Report_${key}.xlsx` });
  }
  await archive.finalize();

  return new Promise((resolve, reject) => {
    const chunks = [];
    archive.on("data", (chunk) => chunks.push(chunk));
    archive.on("end", () => resolve(Buffer.concat(chunks)));
    archive.on("error", reject);
  });
};
