const CustomError = require("../model/CustomError");
const { sql } = require("../db");

exports.getUsers = async (formId) => {
  return await sql`
        SELECT u.id   as u_id,
               u.firstname,
               u.surname,
               u.email,
               u.phone,
               u.job_title,
               u.organization,
               u.country,
               u.role,
               p.payment_method,
               p.payment_status,
               p.total_amount,
               p.created_at,
               t.name as ticket_name
        FROM users u
                 JOIN registration r ON u.id = ANY (r.registered_user_id)
                 JOIN purchase p ON r.id = p.registration_id
                 JOIN ticket t ON t.id = ANY (p.ticket_id)
        WHERE u.registration_form_id = ${formId}
        ORDER BY p.created_at DESC;
    `;
};
