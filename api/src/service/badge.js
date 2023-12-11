const CustomError = require("../model/CustomError");
const { sql } = require("../db");
const { v4: uuidv4 } = require("uuid");

exports.createBadge = async (badges) => {
  const formattedBadges = badges.map((badge) => {
    const qrUuid = uuidv4();
    const badgeStatus = 0;
    return { ...badge, qrUuid, badgeStatus };
  });
  return await sql`insert into badge ${sql(formattedBadges)} returning *`;
};
