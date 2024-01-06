const CustomError = require("../model/CustomError");
const { sql } = require("../db");
const appUserService = require("./appUser");

let filesMarker = 0;
exports.save = async ({ body, files }) => {
  body.logos = JSON.parse(body.logos);

  if (body.logos.length > 0 && files && files.length > 0) {
    body.logos.map((item, index) => {
      if (item && filesMarker <= files.length) {
        body.logos[index] = files[filesMarker].filename;
        filesMarker++;
      }
    });
  }
  const logoUploadCount = body.logos.filter((item) => item !== null).length;
  console.log(11, { ...body });

  //if 2 logo uploaded, check if files[2] exists, then its banner
  if (files && files[logoUploadCount]) {
    body.banner = files[logoUploadCount].filename;
  }
  const [logoLeft, logoRight] = body.logos;

  const event = {
    name: body.name,
    startDate: body.startDate,
    endDate: body.endDate,
    location: body.location,
    taxPercentage: body.taxPercentage,
    taxWording: body.taxWording,
    bankDetailsCurrencies: body.bankDetailsCurrencies.split(",").map(Number),
    logoLeft,
    logoRight,
    banner: body.banner,
  };

  if (body.id) event.id = body.id;
  if (!logoLeft) delete event.logoLeft;
  if (!logoRight) delete event.logoRight;
  if (!body.banner) delete event.banner;

  const [upsertedEvent] = await sql`
        insert into event ${sql(event)}
        ON CONFLICT (id)
        DO UPDATE SET ${sql(event)}
        returning *`;

  return upsertedEvent;
};

exports.getAllEvents = async () => {
  return sql`
        select *
        from event
        order by id desc `;
};

exports.getEventById = async (id) => {
  return await sql`select *
                     from event
                     where id = ${id}`;
};

exports.getEventByAppUserId = async (userId) => {
  const appUser = await appUserService.getAppUserById(userId);
  const [event] = await sql`
        select *
        from event
        where id = ${appUser.eventId}`;
  return event;
};
