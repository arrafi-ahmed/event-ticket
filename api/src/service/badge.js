const CustomError = require("../model/CustomError");
const { sql } = require("../db");
const { v4: uuidv4 } = require("uuid");
const purchaseService = require("./purchase");
const registrationFormService = require("./registrationForm");
const usersService = require("./users");
const {
  textCapitalize,
  textCamelize,
  removeSpaces,
  toCamelCase,
} = require("../others/util");

exports.createBadge = async (badges) => {
  const formattedBadges = badges.map((badge) => {
    const qrUuid = uuidv4();
    const badgeStatus = 0;
    return { ...badge, qrUuid, badgeStatus };
  });
  return await sql`insert into badge ${sql(formattedBadges)} returning *`;
};

exports.updateBadgeStatus = async (userId, purchaseId) => {
  const [purchase] = await purchaseService.getPurchaseById(purchaseId);
  if (purchase.paymentStatus.toLowerCase() === "pending")
    throw new CustomError("Payment status is pending!", 401);

  const [updatedBadge] = await sql`
        update badge
        set badge_status = 1
        where user_id = ${userId}
        returning *`;

  return updatedBadge;
};

exports.getBadgeById = async (badgeId) => {
  const [badge] = await sql`select *
                              from badge
                              where id = ${badgeId}`;
  return badge;
};

exports.validateQrCode = async (id, qrUuid, eventId) => {
  const [badge] = await sql`select *
                              from badge
                              where id = ${id}`;
  if (
    !badge ||
    badge.qrUuid !== qrUuid ||
    badge.badgeStatus === 1 ||
    badge.eventId !== eventId
  )
    throw new CustomError("Invalid QR Code", 401);

  return badge;
};

exports.getBadgeWDesignWVisibility = async (badgeId) => {
  const [result] = await sql`
        select b.*,
               bd.*,
               bv.*,
               u.*,
               b.id  as b_id,
               bd.id as bd_id,
               bv.id as bv_id,
               u.id  as u_id
        from badge b
                 join users u on u.id = b.user_id
                 join badge_design bd on b.badge_design_id = bd.id
                 join badge_visibility bv on b.badge_design_id = bv.badge_design_id
        where b.id = ${badgeId}`;
  console.log(90, result);
  return result;
};

exports.addExhibitorVisibility = async (exhibitorVisibility) => {
  const [foundVisibility] = await sql`
        select *
        from exhibitor_visibility
        where registration_form_id = ${exhibitorVisibility.registrationFormId}`;

  if (foundVisibility)
    throw new CustomError(
      "Exhibitor visibility already exist for selected form",
      409
    );

  const [insertedVisibility] = await sql`
        insert into exhibitor_visibility ${sql(
          exhibitorVisibility
        )} returning *`;

  return insertedVisibility;
};

exports.getBadgeWExhibitorVisibilityById = async (badgeId) => {
  const [badge] = await sql`
        select b.*, ev.*, b.id as b_id, ev.id as ev_id
        from badge b
                 join exhibitor_visibility ev on b.registration_form_id = ev.registration_form_id
        where b.id = ${badgeId}`;
  return badge;
};

exports.scanBadgeByExhibitor = async (badgeId) => {
  const badgeWVisibility = await exports.getBadgeWExhibitorVisibilityById(
    badgeId
  );
  console.log(45, badgeId, badgeWVisibility);
  if (!badgeWVisibility) throw new CustomError("No data available!", 404);

  const user = await usersService.getUserById(badgeWVisibility.userId);

  const formWAnswer = await registrationFormService.getFormWAnswer(
    badgeWVisibility.registrationFormId,
    badgeWVisibility.userId
  );

  const fields = await registrationFormService.getFields();

  const filteredFieldStandard = badgeWVisibility.fieldIdStandard.reduce(
    (acc, parentItem) => {
      return acc.concat(
        fields.filter((childItem) => parentItem == childItem.id)
      );
    },
    []
  );
  const filteredFieldQuestions = badgeWVisibility.fieldIdQuestion.reduce(
    (acc, parentItem) => {
      return acc.concat(
        formWAnswer.questions.filter((childItem) => parentItem == childItem.id)
      );
    },
    []
  );
  const filteredAnswers = filteredFieldQuestions.reduce((acc, parentItem) => {
    return acc.concat(
      formWAnswer.answers.filter(
        (childItem) => parentItem.id == childItem.questionId
      )
    );
  }, []);

  const userWFieldStandard = filteredFieldStandard.reduce((obj, field) => {
    let camelCaseFieldName = toCamelCase(field.fieldName);
    if (user[camelCaseFieldName] !== undefined) {
      return { ...obj, [camelCaseFieldName]: user[camelCaseFieldName] };
    }
    return obj;
  }, {});

  console.log(47, toCamelCase(filteredFieldStandard[0].fieldName));
  console.log(48, user, filteredFieldStandard, userWFieldStandard);

  return {
    standards: userWFieldStandard,
    questions: filteredFieldQuestions,
    answers: filteredAnswers,
  };
};
