const CustomError = require("../model/CustomError");
const { sql } = require("../db");

exports.save = async ({ body, files }) => {
  body.logos = JSON.parse(body.logos);

  if (body.logos.length > 0 && files && files.length > 0) {
    let filesMarker = 0;

    body.logos.map((item, index) => {
      if (item && filesMarker <= files.length) {
        body.logos[index] = files[filesMarker].filename;
        filesMarker++;
      }
    });
  }
  const [logoLeft, logoRight] = body.logos;
  body.logoLeft = logoLeft;
  body.logoRight = logoRight;

  return await sql`
        insert into event
            (name, date, location, logo_left, logo_right, tax_percentage, terms)
        values (${body.name}, ${body.date}, ${body.location}, ${logoLeft}, ${logoRight}, ${body.taxPercentage},
                ${body.terms})
        returning *`;
};

exports.getAllEvents = async () => {
  return await sql`select *
                     from event`;
};

exports.getEvent = async (eventId) => {
  return await sql`select *
                     from event
                     where id = ${eventId}`;
};
