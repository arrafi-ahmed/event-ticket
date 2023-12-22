const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const CustomError = require("../model/CustomError");
const { sql } = require("../db");

exports.register = (payload) => {};
const generateAuthData = ({ id, role, username, image }) => {
  let token = "";
  let currentUser = {};
  if (id) {
    currentUser = {
      id,
      role:
        role === 10
          ? "admin"
          : role === 20
          ? "checkin"
          : role === 30
          ? "exhibitor"
          : "user",
      username,
      image,
    };
    token = jwt.sign({ currentUser }, process.env.TOKEN_SECRET);
  }
  return { token, currentUser };
};

exports.signin = async ({ username, password }) => {
  const [result] = await sql`select *
                               from app_user
                               where username = ${username}
                                 and password = ${password}`;
  if (result) {
    return generateAuthData(result);
  } else {
    throw new CustomError("Incorrect email/password!", 401);
  }
};
