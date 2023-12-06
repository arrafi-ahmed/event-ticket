const CustomError = require("../model/CustomError");
const { sql } = require("../db");
// const { paymentIntents } = require("stripe");
const stripe = require("stripe")(process.env.STRIPE_SECRET);

exports.createPaymentIntent = async ({ payload: { amount, currency } }) => {
  console.log(36, Number(amount), Math.round(Number(amount) * 100))
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(Number(amount) * 100),
    currency,
    // automatic_payment_methods: { enabled: true },
    payment_method_types: ["card"],
  });
  return paymentIntent.client_secret;
};

exports.savePurchase = async (purchase) => {
  delete purchase.ticketType
  const [insertedPurchase] = await sql`insert into purchase ${sql(
      purchase
  )} returning *`;
  return insertedPurchase;
};
