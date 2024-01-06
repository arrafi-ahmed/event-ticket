const CustomError = require("../model/CustomError");
const { sql } = require("../db");

exports.savePromo = async ({ payload: { promo } }) => {
  const [upsertedPromo] = await sql`
        INSERT INTO promo ${sql(promo)}
        ON CONFLICT (id)
        DO UPDATE SET ${sql(promo)}
        RETURNING *`;

  return upsertedPromo;
};

exports.getPromos = async (formId) => {
  return await sql`
        SELECT *
        FROM promo
        WHERE registration_form_id = ${formId};`;
};

exports.getPromo = async (promoId) => {
  const [promo] = await sql`
        SELECT *
        FROM promo
        WHERE id = ${promoId};`;
  return promo;
};

exports.getPromoByCodeNFormId = async (code, formId) => {
  const [promo] = await sql`
        SELECT *
        FROM promo
        WHERE code = ${code}
          and registration_form_id = ${formId}
          and stock_curr > 0;`;

  if (!promo) throw new CustomError("Invalid Promo Code", 401);

  return promo;
};

exports.updatePromo = async (promo, columns) => {
  const [updatedPromo] = await sql`
        update promo
        set ${sql(promo, columns)}
        where id = ${promo.id}
        returning *, id as pc_id`;

  return updatedPromo;
};
