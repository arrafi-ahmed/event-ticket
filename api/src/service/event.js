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

  const event = {
    name: body.name,
    startDate: body.startDate,
    endDate: body.endDate,
    location: body.location,
    taxPercentage: body.taxPercentage,
    logoLeft,
    logoRight,
  };
  return sql`insert into event ${sql(event)} returning *`;
};

exports.getAllEvents = async () => {
  return sql`select *
               from event`;
};

exports.getEventById = async (id) => {
  return await sql`select *
                     from event
                     where id = ${id}`;
};
