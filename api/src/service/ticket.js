const CustomError = require("../model/CustomError");
const { sql } = require("../db");

exports.saveTicket = async ({ payload: { ticket, earlyBird } }) => {
  ticket.stockCurr = ticket.stockInit;
  if (ticket.ticketType.toLowerCase() === "free") ticket.price = 0;

  const [upsertedTicket] = await sql`
        INSERT INTO ticket ${sql(ticket)}
        ON CONFLICT (id)
        DO UPDATE SET ${sql(ticket)}
        RETURNING *`;

  if (earlyBird?.earlyBirdPrice) {
    earlyBird.ticketId = upsertedTicket.id;

    const [upsertedEarlyBird] = await sql`
            INSERT INTO early_bird ${sql(earlyBird)}
            ON CONFLICT (id)
            DO UPDATE SET ${sql(earlyBird)}
            RETURNING *`;
  }

  return upsertedTicket;
};

exports.getTicketsWEarlyBirdActivated = async (formId) => {
  const tickets = await sql`
        SELECT t.*,
               e.*,
               e.id as e_id,
               t.id as id
        FROM ticket t
                 LEFT JOIN early_bird e
                           ON t.id = e.ticket_id AND CURRENT_DATE BETWEEN e.start_date AND e.end_date
        WHERE t.registration_form_id = ${formId};`;

  return exports.sortExtrasLast(tickets);
};

exports.getTickets = async (formId) => {
  const tickets = await sql`
        SELECT t.*,
               e.*,
               e.id as e_id,
               t.id as id
        FROM ticket t
                 LEFT JOIN early_bird e
                           ON t.id = e.ticket_id
        WHERE t.registration_form_id = ${formId};`;

  return exports.sortExtrasLast(tickets);
};

exports.getTicket = async (ticketId) => {
  const [ticket] = await sql`
        SELECT t.*,
               e.*,
               e.id as e_id,
               t.id as id
        FROM ticket t
                 LEFT JOIN early_bird e
                           ON t.id = e.ticket_id
        WHERE t.id = ${ticketId};`;
  return ticket;
};

exports.getTicketsByIds = async (ids) => {
  const idsArray = `{${ids.join(",")}}`;
  return await sql`
        SELECT *
        FROM ticket
        WHERE id = ANY (${idsArray}::int[]);`;
};

exports.sortExtrasLast = (tickets) => {
  const standardTickets = tickets.filter(
    (item) => item.ticketType.toLowerCase() !== "extras"
  );
  const extrasTickets = tickets.filter(
    (item) => item.ticketType.toLowerCase() === "extras"
  );

  return standardTickets.concat(extrasTickets);
};
