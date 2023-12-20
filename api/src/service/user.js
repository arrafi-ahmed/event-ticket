const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const CustomError = require("../model/CustomError");
const { sql } = require("../db");

exports.register = (payload) => {};
const generateAuthData = (result) => {
  let token = "";
  let currentUser = {};
  if (result) {
    currentUser = {
      id: result.id,
      role:
        result.role === 10
          ? "admin"
          : result.role === 20
          ? "checkin"
          : result.role === 30
          ? "exhibitor"
          : "user",
      name: result.fullname,
      image: result.image,
    };
    token = jwt.sign({ currentUser }, process.env.TOKEN_SECRET);
  }
  return { token, currentUser };
};

exports.signin = async ({ username, password }) => {
  const results = await sql`select *
                              from app_user
                              where username = ${username}
                                and password = ${password}`;
  if (results.length > 0) {
    return generateAuthData(results[0]);
  } else {
    throw new CustomError("Incorrect email/password!", 401);
  }
};
