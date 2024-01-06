const CustomError = require("../model/CustomError");
const { sql } = require("../db");
const badgeService = require("./badge");
const badgeDesignService = require("./badgeDesign");
const usersService = require("./users");
const ticketService = require("./ticket");
const promoService = require("./promo");
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
//form w form type
exports.getForm = async (formId) => {
  return await sql`
        select rf.*, ft.*, rf.id as rf_id, ft.id as ft_id
        from registration_form rf
                 join registration_form_type ft on rf.form_type_id = ft.id
        where rf.id = ${formId}`;
};
//only form
exports.getFormById = async (id) => {
  const [form] = await sql`
        select *
        from registration_form
        where id = ${id}`;
  return form;
};

exports.getFormWQuestion = async (formId) => {
  return await sql`
        select rf.*, ft.*, json_agg(q) as questions, rf.id as rf_id, ft.id as ft_id
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

exports.saveForm = async ({ payload: { form, formItems, rmQIds } }) => {
  const [insertedForm] = await sql`
        insert into registration_form ${sql(form)}
        on conflict (id)
        do update set ${sql(form)}
        returning *`;

  // Delete old questions
  if (rmQIds?.length > 0)
    await sql`
            delete
            from question
            where id in ${sql(rmQIds)}`;

  if (formItems.length > 0) {
    const { id: registrationFormId } = insertedForm;

    const formattedFormItems = formItems.map((item) => {
      item.registrationFormId = registrationFormId;
      if (!item.options) delete item.options;
      return item;
    });

    for (const item of formattedFormItems) {
      const insertedQuestion = await sql`
                insert into question ${sql(item)}
                on conflict (id)
                do update set ${sql(item)}
                returning *`;
    }
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
    emailBodyForm,
    promo,
  },
}) => {
  //check if amount is valid
  if (purchase.discountAmount >= purchase.subTotalAmount)
    throw new CustomError("Invalid payment amount!", 401);

  //check if badgeDesign exist, otherwise throw error
  const foundBadgeDesign = await badgeDesignService.getBadgeDesignByFormId(
    formId
  );
  if (!foundBadgeDesign?.id)
    throw new CustomError("Badge design for the form doesn't exist!", 404);

  //fetched ticket for checking price & checking if stock available
  const fetchedTickets = await ticketService.getTicketsWEarlyBirdActivated(
    formId
  );
  // create a hash map of fetched tickets by id
  const fetchedTicketsMap = {};
  for (const ticket of fetchedTickets) {
    fetchedTicketsMap[ticket.id] = ticket;
  }

  const formattedTickets = tickets.map((ticket) => {
    const fetchedTicket = fetchedTicketsMap[ticket.ticketId];

    //check for ticket stock availability
    if (ticket.quantity > fetchedTicket.stockCurr)
      throw new CustomError(
        `Stock unavailable for ticket ${fetchedTicket.name}`
      );

    if (fetchedTicket && fetchedTicket.earlyBirdPrice) {
      ticket.ticketPrice = fetchedTicket.earlyBirdPrice;
    }

    //set ticket.stockCurr for updating stock later
    ticket.stockCurr = fetchedTicket.stockCurr - ticket.quantity;

    return ticket;
  });

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

  const extrasTickets = formattedTickets.filter((item) =>
    item.ticketType.toLowerCase().includes("extras")
  );
  const nonExtrasTickets = formattedTickets.filter(
    (item) => !item.ticketType.toLowerCase().includes("extras")
  );

  const newPurchase = {
    ...purchase,
    registrationId: insertedRegistration.id,
    registrationFormId: formId,
    createdAt: new Date(),
    extras: extrasTickets.map((item) => item.ticketId),
    extrasQuantity: extrasTickets.map((item) => item.quantity),
    extrasPrice: extrasTickets.map((item) => item.ticketPrice),
    nonExtras: nonExtrasTickets.map((item) => item.ticketId),
    nonExtrasQuantity: nonExtrasTickets.map((item) => item.quantity),
    nonExtrasPrice: nonExtrasTickets.map((item) => item.ticketPrice),
  };
  console.log(53, promo)
  if (promo.id) {
    newPurchase.promoId = promo.id;
    newPurchase.discountAmount = promo.discountAmount;
  }
  delete newPurchase.subTotalAmount;

  const insertedPurchase = await purchaseService.savePurchase(newPurchase);
  purchase = { ...purchase, ...insertedPurchase };

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

  //update tickets to reduce curr stock
  const updatedTickets = ticketService.updateTickets(
    formattedTickets.map(({ ticketId, stockCurr }) => ({
      ticketId,
      stockCurr,
    }))
  );

  //update promo to reduce curr stock
  let updatedPromo = null;
  if (promo.id) {
    updatedPromo = await promoService.updatePromo(
      { id: promo.id, stockCurr: Number(promo.stockCurr) - 1 },
      ["stockCurr"]
    );
  }

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

    const [insertedSurveyFiller] = await sql`
            insert into survey_filler ${sql(surveyFiller)} returning id`;
  }

  const { invoiceContent, user, event } =
    await emailContentService.generateInvoiceContent(
      formattedTickets,
      insertedUsers,
      purchase,
      formFiller.id,
      eventId,
      currency,
      promo
    );

  // Generate tickets and send emails in parallel
  const sendTicketPromises = insertedBadges.map(async (badge) => {
    const { ticketContent, user, emailBodyTicket } =
      await emailContentService.generateTicketContent(
        badge,
        event,
        formattedTickets,
        insertedUsers
      );

    return sendMailService.sendMailWAttachment(
      user.email,
      `Ticket for ${event.name}`,
      `Dear ${user.firstname},\n${emailBodyTicket}`,
      ticketContent
    );
  });

  // Wait for all emails to be sent
  Promise.all(sendTicketPromises);

  // Send invoice
  sendMailService.sendMailWAttachment(
    formFiller.email,
    `Invoice for ${event.name}`,
    `Dear ${formFiller.firstname},\n${emailBodyForm}`,
    invoiceContent
  );
  //get invoice data and return to frontend, user will be redirected to invoice page after successful payment
  return {
    purchase,
    user,
    event,
    tickets: formattedTickets,
    currency,
    promo,
  };
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
