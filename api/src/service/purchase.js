const CustomError = require("../model/CustomError");
const { sql } = require("../db");
const settingsService = require("./settings");
// const stripe = require("stripe")(process.env.STRIPE_SECRET);

exports.createPaymentIntent = async ({ payload: { amount, currency } }) => {
  const settings = await settingsService.getSettings();
  console.log(33, settings.stripeSecret);
  const stripe = require("stripe")(settings.stripeSecret);
  console.log(34, stripe);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(Number(amount) * 100),
    currency,
    // automatic_payment_methods: { enabled: true },
    payment_method_types: ["card"],
  });
  return paymentIntent.client_secret;
};

exports.savePurchase = async (purchase) => {
  delete purchase.ticketType;
  const [insertedPurchase] = await sql`insert into purchase ${sql(
    purchase
  )} returning *`;
  return insertedPurchase;
};

exports.updatePurchase = async (purchase, columns) => {
  return await sql`
        update purchase
        set ${sql(purchase, columns)}
        where id = ${purchase.id}`;
};

exports.getPurchaseById = async (id) => {
  return await sql`
        select *
        from purchase
        where id = ${id}
    `;
};
