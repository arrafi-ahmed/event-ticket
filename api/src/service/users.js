const CustomError = require("../model/CustomError");
const { sql } = require("../db");
const registrationService = require("./registration");

exports.getUsers = async (formId) => {
  return await sql`
        SELECT u.*,
               u.id       as u_id,
               p.payment_method,
               p.payment_status,
               p.total_amount,
               p.registration_id,
               p.id       as p_id,
               t.name     as ticket_name,
               t.currency as ticket_currency,
               r.form_filler
        FROM users u
                 JOIN registration r ON u.id = ANY (r.registered_user_id)
                 JOIN purchase p ON r.id = p.registration_id
                 JOIN ticket t ON t.id = u.ticket_id
        WHERE u.registration_form_id = ${formId}
        ORDER BY p.created_at DESC;
    `;
};

exports.getUserByEmail = async (email) => {
  return await sql`
        select *
        from users
        where email = ${email}
    `;
};

exports.getUserById = async (id) => {
  return await sql`
        select *
        from users
        where id = ${id}
    `;
};

exports.updateUser = async (user, columns) => {
  const [updatedUser] = await sql`
        update users
        set ${sql(user, columns)}
        where id = ${user.uId}`;
  return updatedUser;
};

exports.deleteUser = async (userId, registrationId) => {
  //del from reg
  let registration = await registrationService.findById(registrationId);
  registration.registeredUserId = registration.registeredUserId.filter(
    (item) => item != userId
  );
  const updatedRegistration = await sql`
        update registration
        set ${sql(registration, ["registeredUserId"])}
        where id = ${registrationId}`;
  console.log(88, registration);
  return await sql`
        delete
        from users
        where id = ${userId}
    `;
};
