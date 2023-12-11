const CustomError = require("../model/CustomError");
const { sql } = require("../db");

exports.findById = async (id) => {
  const [registration] = await sql`
        select *
        from registration
        where id = ${id}`;
  return registration;
};
