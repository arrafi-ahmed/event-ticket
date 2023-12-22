const CustomError = require("../model/CustomError");
const { sql } = require("../db");

exports.getAppUser = async (eventId) => {
  const appUsers = await sql`
        SELECT a.*, u.*, a.role as role, u.role as uRole
        FROM app_user a
                 LEFT JOIN users u ON a.user_id = u.id
        WHERE a.role IN (20, 30)
          AND a.event_id = ${eventId}
        ORDER BY a.id DESC;`;

  const checkinStuffs = appUsers.filter((item) => item.role == 20);
  const exhibitors = appUsers.filter((item) => item.role == 30);

  return { checkinStuffs, exhibitors };
};

exports.generatePassword = (length = 8) => {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,/()-*&^%$#@!";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

exports.saveAppUser = async ({ payload }) => {
  payload.type = payload.type.toLowerCase();
  payload.role =
    payload.type == "admin"
      ? 10
      : payload.type == "checkin"
      ? 20
      : payload.type == "exhibitor"
      ? 30
      : null;
  delete payload.type;
  if (payload.type == "checkin") {
    delete user.userId;
  }
  payload.password = exports.generatePassword();
  return sql`insert into app_user ${sql(payload)} returning *`;
};

exports.getAppUserById = async (id) => {
  const [result] = await sql`
        SELECT *
        FROM app_user
        WHERE id = ${id}`;
  return result;
};
