const CustomError = require("../model/CustomError");
const { sql } = require("../db");

exports.getAllForms = async (eventId) => {
  return await sql`select *, rf.id as rf_id, ft.id as ft_id
                     from registration_form rf
                              join registration_form_type ft on rf.form_type_id = ft.id
                     where rf.event_id = ${eventId}`;
};
// for admin
exports.getFormSubmission = async (formId) => {
  return await sql`select *
                     from registration_form rf
                              join registration_form_type ft on rf.form_type_id = ft.id
                              join registration r on r.registration_form_id = rf.id
                              join users u on r.registered_user_id = u.id
                              join question q on q.registration_form_id = rf.id
                              join answer a on q.id = a.question_id
                     where rf.id = ${formId}`;
};
exports.getForm = async (formId) => {
  return await sql`select rf.*, ft.*, rf.id as rf_id, ft.id as ft_id
                     from registration_form rf
                              join registration_form_type ft on rf.form_type_id = ft.id
                     where rf.id = ${formId}`;
};
exports.getFormWQuestion = async (formId) => {
  return await sql`select rf.*, ft.*, json_agg(q) as questions
                     from registration_form rf
                              join registration_form_type ft on rf.form_type_id = ft.id
                              left join question q on q.registration_form_id = rf.id
                     where rf.id = ${formId}
                     group by rf.id, ft.id`;
};
exports.saveForm = async ({ payload }) => {
  const [existingForm] = await sql`select *
                                     from registration_form
                                     where event_id = ${payload.eventId}
                                       and form_type_id = ${payload.formTypeId}`;
  if (existingForm) {
    throw new CustomError("Registration Form already exists!", 409);
  }

  const [insertedForm] = await sql`
        insert into registration_form ${sql(payload, "formTypeId", "eventId")}
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
  return await sql`select form_type_id
                     from registration_form
                     where id = ${formId}`;
};

exports.areRegisteredUsersExist = async (users, formId) => {
  const results = await Promise.all(
    users.map(async (user) => {
      const [foundUser] = await sql`select *
                                          from users
                                          where email = ${user.email}`;

      if (foundUser?.id) {
        const [existingRegisteredUser] = await sql`
                    select *
                    from users u
                             join registration r on u.id = ANY (r.registered_user_id)
                    where r.registration_form_id = ${formId}
                      and ${foundUser.id} = ANY (r.registered_user_id)`;

        return !!existingRegisteredUser;
      } else return false;
    })
  );
  return results.some((value) => value === true);
};

exports.submitUserForm = async ({
  payload: {
    registrationForm: {
      formId,
      allStandardAnswers,
      qustionIds,
      additionalAnswers,
    },
    purchase,
  },
}) => {
  const [formType] = await exports.getFormTypeByFormId(formId);
  const ticketIds = [];
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
      else if (childIndex === 7) ticketIds.push(childItem);
      user = {
        ...user,
        role: Number.parseInt(formType?.formTypeId),
        createdAt: new Date(),
        registrationFormId: formId,
      };
      return user;
    });
    return user;
  });

  const insertedUsers = await sql`insert into users ${sql(users)} returning id`;

  if (additionalAnswers.length > 0) {
    const answers = additionalAnswers.map((item, index) => ({
      answerText: item,
      questionId: qustionIds[index],
    }));

    const insertedAnswers = await sql`insert into answer ${sql(
      answers
    )} returning *`;
  }
  const registration = {
    createdAt: new Date(),
    registeredUserId: insertedUsers.map((item) => item.id),
    registrationFormId: formId,
  };
  const [result] = await sql`insert into registration ${sql(
    registration
  )} returning id`;

  purchase = { ...purchase, registrationId: result.id, createdAt: new Date() };

  return await sql`insert into purchase ${sql(purchase)} returning *`;
};

exports.saveFormType = async ({ newFormType }) => {
  return await sql`
        insert into registration_form_type (name)
        values (${newFormType})
        returning *`;
};

exports.getAllFormTypes = async () => {
  return await sql`select *
                     from registration_form_type`;
};

exports.getFields = async () => {
  return await sql`select *
                     from field`;
};
