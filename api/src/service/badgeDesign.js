const CustomError = require("../model/CustomError");
const { sql } = require("../db");

exports.getBadgeDesign = async (id) => {
  const [foundBadgeDesign] = await sql`select *
                                         from badge_design
                                         where id = ${id}`;
  return foundBadgeDesign;
};

exports.getBadgeDesignByFormId = async (formId) => {
  const [foundBadgeDesign] = await sql`select *
                                         from badge_design
                                         where registration_form_id = ${formId}`;
  return foundBadgeDesign;
};

exports.saveBadgeDesign = async ({
  payload: { badgeDesign, badgeVisibility },
}) => {
  const foundBadgeDesign = await exports.getBadgeDesignByFormId(
    badgeDesign.registrationFormId
  );
  if (foundBadgeDesign)
    throw new CustomError("Badge design already exist!", 409);

  const [insertedBadgeDesign] = await sql`insert into badge_design ${sql(
    badgeDesign
  )} returning *`;

  badgeVisibility.badgeDesignId = insertedBadgeDesign.id;

  const insertedBadgeVisibility = await sql`insert into badge_visibility ${sql(
    badgeVisibility
  )} returning *`;

  return insertedBadgeDesign;
};

exports.getAllBadgeDesigns = async (eventId) => {
  return await sql`select *
                     from badge_design
                     where event_id = ${eventId}`;
};

exports.getBadgeDesignWVisibility = async (badgeDesignId) => {
  const badgeData = await exports.getBadgeDesign(badgeDesignId);
  const [badgeVisibility] = await sql`select *
                                        from badge_visibility
                                        where badge_design_id = ${badgeDesignId}`;

  return { badgeData, badgeVisibility };
};
