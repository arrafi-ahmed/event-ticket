const CustomError = require("../model/CustomError");
const { sql } = require("../db");

exports.saveTicket = async ({ payload: { ticket, earlyBird } }) => {
  ticket.stockCurr = ticket.stockInit;
  if (ticket.ticketType.toLowerCase() === "extras")
    delete ticket.registrationFormId;

  const [insertedTicket] = await sql`insert into ticket ${sql(
    ticket
  )} returning *`;

  if (earlyBird?.earlyBirdPrice) {
    earlyBird.ticketId = insertedTicket.id;

    const [insertedEarlyBird] = await sql`insert into early_bird ${sql(
      earlyBird
    )} returning *`;
  }
  return insertedTicket;
};

exports.getTickets = async ({ eventId, registrationFormId }) => {
  const tickets = await sql`
        SELECT t.*,
               e.*,
               e.id as e_id,
               t.id as id
        FROM ticket t
                 LEFT JOIN early_bird e
                           ON t.id = e.ticket_id AND CURRENT_DATE BETWEEN e.start_date AND e.end_date
        WHERE (t.ticket_type = 'Extras' AND t.event_id = ${eventId})
           OR (t.ticket_type != 'Extras' AND t.registration_form_id = ${registrationFormId});`;

  console.log(18, tickets);
  console.log(19, exports.sortExtrasLast(tickets));
  return exports.sortExtrasLast(tickets);
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
