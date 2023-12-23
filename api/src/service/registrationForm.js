const CustomError = require("../model/CustomError");
const { sql } = require("../db");
const badgeService = require("./badge");
const badgeDesignService = require("./badgeDesign");
const usersService = require("./users");
const purchaseService = require("./purchase");
const emailContentService = require("./emailContent");
const sendMailService = require("./sendMail");

exports.getAllForms = async (eventId) => {
  return await sql`
        select *, rf.id as rf_id, ft.id as ft_id
        from registration_form rf
                 join registration_form_type ft on rf.form_type_id = ft.id
        where rf.event_id = ${eventId}`;
};
// for admin
exports.getFormSubmission = async (formId) => {
  return await sql`
        select *
        from registration_form rf
                 join registration_form_type ft on rf.form_type_id = ft.id
                 join registration r on r.registration_form_id = rf.id
                 join users u on r.registered_user_id = u.id
                 join question q on q.registration_form_id = rf.id
                 join answer a on q.id = a.question_id
        where rf.id = ${formId}`;
};

exports.getForm = async (formId) => {
  return await sql`
        select rf.*, ft.*, rf.id as rf_id, ft.id as ft_id
        from registration_form rf
                 join registration_form_type ft on rf.form_type_id = ft.id
        where rf.id = ${formId}`;
};

exports.getFormWQuestion = async (formId) => {
  return await sql`
        select rf.*, ft.*, json_agg(q) as questions
        from registration_form rf
                 join registration_form_type ft on rf.form_type_id = ft.id
                 left join question q on q.registration_form_id = rf.id
        where rf.id = ${formId}
        group by rf.id, ft.id`;
};

exports.getFormWAnswer = async (formId, formFiller) => {
  const [formWAnswer] = await sql`
        select rf.*, ft.*, json_agg(q) as questions, json_agg(a) as answers
        from registration_form rf
                 join registration_form_type ft on rf.form_type_id = ft.id
                 left join question q on q.registration_form_id = rf.id
                 left join answer a on a.question_id = q.id
        where rf.id = ${formId}
          and a.form_filler = ${formFiller}
        group by rf.id, ft.id`;
  return formWAnswer;
};

exports.saveForm = async ({ payload }) => {
  const [existingForm] = await sql`
        select *
        from registration_form
        where event_id = ${payload.eventId}
          and form_type_id = ${payload.formTypeId}`;
  if (existingForm) {
    throw new CustomError("Registration Form already exists!", 409);
  }

  const [insertedForm] = await sql`
        insert into registration_form ${sql(
          payload,
          "formTypeId",
          "eventId",
          "terms"
        )}
            returning *`;

  if (payload.formItems.length > 0) {
    const { id: registrationFormId } = insertedForm;

    const formattedFormItems = payload.formItems.map((item) => {
      item.registrationFormId = registrationFormId;
      if (!item.options) item.options = null;
      return item;
    });

    const insertedQuestions = await sql`insert into question ${sql(
      formattedFormItems
    )}`;
  }

  return insertedForm;
};

exports.getFormTypeByFormId = async (formId) => {
  return await sql`
        select form_type_id
        from registration_form
        where id = ${formId}`;
};

exports.areRegisteredUsersExist = async (users, formId) => {
  const results = await Promise.all(
    users.map(async (user) => {
      const existingRegisteredUsers = await sql`
                select *
                from users u
                         join registration r on u.id = ANY (r.registered_user_id)
                where r.registration_form_id = ${formId}
                  and u.email = ${user.email}`;
      return existingRegisteredUsers.length > 0;
    })
  );
  return results.some((value) => value === true);
};

exports.submitUserForm = async ({
  payload: {
    registrationForm: {
      formId,
      allStandardAnswers,
      questionIds,
      additionalAnswers,
      formFillerEmail,
    },
    purchase,
    tickets,
    eventId,
    currency,
  },
}) => {
  //check if badgeDesign exist, otherwise throw error
  const foundBadgeDesign = await badgeDesignService.getBadgeDesignByFormId(
    formId
  );
  if (!foundBadgeDesign?.id)
    throw new CustomError("Badge design for the form doesn't exist!", 404);

  const [formType] = await exports.getFormTypeByFormId(formId);
  //insert users
  const users = allStandardAnswers.map((parentItem, parentIndex) => {
    let user = {};
    parentItem.map((childItem, childIndex) => {
      if (childIndex === 0) user = { ...user, firstname: childItem };
      else if (childIndex === 1) user = { ...user, surname: childItem };
      else if (childIndex === 2) user = { ...user, jobTitle: childItem };
      else if (childIndex === 3) user = { ...user, organization: childItem };
      else if (childIndex === 4) user = { ...user, country: childItem };
      else if (childIndex === 5) user = { ...user, phone: childItem };
      else if (childIndex === 6) user = { ...user, email: childItem };
      else if (childIndex === 7) user = { ...user, ticketId: childItem };
      user = {
        ...user,
        role: Number.parseInt(formType?.formTypeId),
        createdAt: new Date(),
        registrationFormId: formId,
        eventId,
      };
      return user;
    });
    return user;
  });

  const insertedUsers = await usersService.saveUsers(users);

  // find formFiller userId by email
  const formFiller = insertedUsers.find(
    (item) => item.email === formFillerEmail
  );

  //insert answers
  let insertedAnswers = [];
  if (additionalAnswers.length > 0) {
    const answers = additionalAnswers.reduce((acc, item, index) => {
      if (item) {
        acc.push({
          answerText: item,
          questionId: questionIds[index],
          formFiller: formFiller.id,
        });
      }
      return acc;
    }, []);

    insertedAnswers = await sql`insert into answer ${sql(answers)} returning *`;
  }

  //insert registration
  const registration = {
    createdAt: new Date(),
    registeredUserId: insertedUsers.map((item) => item.id),
    status: 1,
    registrationFormId: formId,
    formFiller: formFiller.id,
  };
  const [insertedRegistration] = await sql`insert into registration ${sql(
    registration
  )} returning id`;

  // insert purchase
  const extrasTickets = tickets.filter(
    (item) => item.ticketType.toLowerCase() == "extras"
  );
  const nonExtrasTickets = tickets.filter(
    (item) => item.ticketType.toLowerCase() != "extras"
  );
  purchase = {
    ...purchase,
    registrationId: insertedRegistration.id,
    createdAt: new Date(),
    extras: extrasTickets.map((item) => item.ticketId),
    extrasQuantity: extrasTickets.map((item) => item.quantity),
    extrasPrice: extrasTickets.map((item) => item.ticketPrice),
    nonExtras: nonExtrasTickets.map((item) => item.ticketId),
    nonExtrasQuantity: nonExtrasTickets.map((item) => item.quantity),
    nonExtrasPrice: nonExtrasTickets.map((item) => item.ticketPrice),
  };

  const insertedPurchase = await purchaseService.savePurchase(purchase);

  //update users with purchaseId
  const updatedUsers = insertedUsers.map((user) => ({
    id: user.id,
    purchaseId: insertedPurchase.id,
  }));

  await usersService.updateUsersPurchaseId(updatedUsers);

  //create badge
  const badges = insertedUsers.map((user, index) => {
    //check user id serial is maintained after insert
    return {
      badgeDesignId: foundBadgeDesign.id,
      userId: user.id,
      ticketId: user.ticketId,
      purchaseId: insertedPurchase.id,
      eventId,
      registrationFormId: formId,
    };
  });
  const insertedBadges = await badgeService.createBadge(badges);

  //insert into surveyFiller
  if (additionalAnswers.length > 0) {
    const surveyFiller = {
      ...formFiller,
      userId: formFiller.id,
      registrationId: insertedRegistration.id,
      purchaseId: insertedPurchase.id,
      answerId: insertedAnswers.map((item) => item.id),
    };
    delete surveyFiller.id;
    delete surveyFiller.ticketId;

    const [insertedSurveyFiller] = await sql`insert into survey_filler ${sql(
      surveyFiller
    )} returning id`;
  }

  const { invoiceContent, user, event } =
    await emailContentService.generateInvoiceContent(
      tickets,
      insertedUsers,
      insertedPurchase,
      formFiller.id,
      eventId,
      currency
    );

  // Generate tickets and send emails in parallel
  const sendTicketPromises = insertedBadges.map(async (badge) => {
    const { ticketContent, user } =
      await emailContentService.generateTicketContent(
        badge,
        event,
        tickets,
        insertedUsers
      );
    return sendMailService.sendMailWAttachment(
      user.email,
      "Ticket",
      "Ticket attached", //load from db -> form -> ticketEmailContent
      ticketContent
    );
  });

  // Wait for all emails to be sent
  Promise.all(sendTicketPromises);

  // Send invoice
  sendMailService.sendMailWAttachment(
    formFiller.email,
    "Invoice",
    "Invoice attached", //load from db -> form -> invoiceEmailContent
    invoiceContent
  );
  //get invoice data and return to frontend, user will be redirected to invoice page after successful payment
  return { purchase: insertedPurchase, user, event, tickets, currency };
};

exports.saveFormType = async ({ newFormType }) => {
  return sql`
        insert into registration_form_type ${sql(newFormType)}
            returning *`;
};

exports.getFormTypesByEventId = async (eventId) => {
  return sql`
        select *
        from registration_form_type
        where event_id = ${eventId}`;
};

exports.getFields = async () => {
  return sql`
        select *
        from field
        order by id`;
};
