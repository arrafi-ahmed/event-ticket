const CustomError = require("../model/CustomError");
const { sql } = require("../db");
const { v4: uuidv4 } = require("uuid");

exports.createBadge = async (badges) => {
  const formattedBadges = badges.map((badge) => {
    const qrcodeUuid = uuidv4();
    return { ...badge, qrcodeUuid };
  });
  const insertedBadges = await sql`insert into badge ${sql(
    formattedBadges
  )} returning *`;
  console.log(92, insertedBadges);
  return insertedBadges;
};
