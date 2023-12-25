const CustomError = require("../model/CustomError");
const { sql } = require("../db");

exports.getBadgeDesign = async (id) => {
  const [foundBadgeDesign] = await sql`select *
                                         from badge_design
                                         where id = ${id}`;
  return foundBadgeDesign;
};

exports.getBadgeDesignByFormId = async (formId) => {
  const [foundBadgeDesign] = await sql`
        select *
        from badge_design
        where registration_form_id = ${formId}`;
  return foundBadgeDesign;
};

exports.saveBadgeDesign = async ({
  payload: { badgeDesign, badgeVisibility },
}) => {
  const [insertedBadgeDesign] = await sql`
        insert into badge_design ${sql(badgeDesign)}
        on conflict (id)
        do update set ${sql(badgeDesign)} returning *`;

  badgeVisibility.badgeDesignId = insertedBadgeDesign.id;

  const insertedBadgeVisibility = await sql`
        insert into badge_visibility ${sql(badgeVisibility)}
        on conflict (id)
        do update set ${sql(badgeVisibility)} returning *`;

  return insertedBadgeDesign;
};

exports.getAllBadgeDesigns = async (eventId) => {
  return await sql`select *
                     from badge_design
                     where event_id = ${eventId}`;
};

exports.getBadgeDesignWVisibility = async (badgeDesignId) => {
  const [result] = await sql`
        select bd.*, bv.*, bd.id as bd_id, bv.id as bv_id
        from badge_design bd
                 join badge_visibility bv on bd.id = bv.badge_design_id
        where bd.id = ${badgeDesignId}`;

  return result;
};
