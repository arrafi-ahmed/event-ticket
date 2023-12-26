const CustomError = require("../model/CustomError");
const { sql, raw } = require("../db");
const registrationService = require("./registration");

exports.saveUsers = async (users) => {
  return sql`insert into users ${sql(users)} returning *`;
};

exports.getUsers = async (formId) => {
  return sql`
        SELECT u.*,
               u.id       as u_id,
               p.payment_method,
               p.payment_status,
               p.total_amount,
               p.registration_id,
               p.id       as p_id,
               t.name     as ticket_name,
               t.currency as ticket_currency,
               r.form_filler,
               b.badge_status
        FROM users u
                 Left JOIN registration r ON u.id = ANY (r.registered_user_id)
                 JOIN purchase p ON r.id = p.registration_id
                 Left JOIN ticket t ON t.id = u.ticket_id
                 join badge b on u.id = b.user_id
        WHERE u.registration_form_id = ${formId}
        ORDER BY p.created_at DESC;
    `;
};

exports.getUserByEmail = async (email) => {
  return sql`
        select *
        from users
        where email = ${email}
    `;
};

exports.getUsersByNameNEventId = async (name, eventId) => {
  const [firstName, lastName] = name.split(" ");

  return await sql`
        SELECT u.*, p.payment_status, u.id as u_id, p.id as p_id
        FROM users u
                 join purchase p on u.purchase_id = p.id
        WHERE event_id = ${eventId}
          AND ((firstname ILIKE ${"%" + firstName + "%"} AND surname ILIKE ${
    "%" + lastName + "%"
  })
            OR firstname ILIKE ${"%" + name + "%"}
            OR surname ILIKE ${"%" + name + "%"})
    `;
};

exports.getUserById = async (id) => {
  const [user] = await sql`
        select *
        from users
        where id = ${id}
    `;
  return user;
};

exports.updateUser = async (user, columns) => {
  const [updatedUser] = await sql`
        update users
        set ${sql(user, columns)}
        where id = ${user.uId}`;
  return updatedUser;
};

exports.updateUsersPurchaseId = async (users) => {
  const formattedUsers = users.map((obj) => Object.values(obj));

  return sql`
        update users
        set purchase_id = (update_data.purchaseId)::int
        from (values ${sql(formattedUsers)}) as update_data (id, purchaseId)
        where users.id = (update_data.id)::int
    `;
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

  await sql`delete
              from badge
              where user_id = ${userId}`;

  return sql`
        delete
        from users
        where id = ${userId}
    `;
};
//getUsersByFormId
exports.getExhibitorsByFormId = async (formId) => {
  return sql`
        select *
        from users
        WHERE registration_form_id = ${formId}
        ORDER BY created_at DESC;`;
};
