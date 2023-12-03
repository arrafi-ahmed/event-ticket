const CustomError = require("../model/CustomError");
const { sql } = require("../db");

exports.getBadgeDesign = async (eventId, formId) => {
  const [foundBadgeDesign] = await sql`select *
                                         from badge_design
                                         where event_id = ${eventId}
                                           and registration_form_id = ${formId}`;
  return foundBadgeDesign;
};

exports.saveBadge = async ({ payload: { badgeDesign, badgeVisibility } }) => {
  const foundBadgeDesign = await exports.getBadgeDesign(
    badgeDesign.eventId,
    badgeDesign.registrationFormId
  );
  if (foundBadgeDesign)
    throw new CustomError("Badge design already exist!", 409);

  const [insertedBadgeDesign] = await sql`insert into badge_design ${sql(
    badgeDesign
  )} returning *`;

  badgeVisibility.badgeId = insertedBadgeDesign.id;

  const insertedBadgeVisibility = await sql`insert into badge_visibility ${sql(
    badgeVisibility
  )} returning *`;

  return insertedBadgeDesign;
};

exports.getAllBadges = async (eventId) => {
  return await sql`select *
                     from badge_design
                     where event_id = ${eventId}`;
};

exports.getBadge = async (badgeId, registrationFormId) => {
  const [badgeData] = await sql`
        select *
        from badge_design bd
        where bd.registration_form_id = ${registrationFormId}`;

  const [badgeVisibility] = await sql`select *
                                        from badge_visibility
                                        where badge_id = ${badgeId}`;

  return { badgeData, badgeVisibility };
};
