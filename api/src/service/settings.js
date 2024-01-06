const CustomError = require("../model/CustomError");
const { sql } = require("../db");
const { arrToObj, objToArr } = require("../others/util");

exports.getSettingsWOPrivateKeys = async () => {
  const settings = await exports.getSettings();
  delete settings.stripeSecret;
  return settings;
};

exports.getSettings = async () => {
  const settingsArr = await sql`
        select *
        from settings`;

  return arrToObj(settingsArr);
};

exports.saveSettings = async (payload) => {
  const payloadArr = objToArr(payload);
  return sql`
        insert into settings ${sql(payloadArr)}
        ON CONFLICT (key)
        DO UPDATE SET value = EXCLUDED.value`;
};
