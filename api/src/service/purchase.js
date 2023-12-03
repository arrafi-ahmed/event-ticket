const CustomError = require("../model/CustomError");
const { sql } = require("../db");
// const { paymentIntents } = require("stripe");
const stripe = require("stripe")(process.env.STRIPE_SECRET);

exports.createPaymentIntent = async ({ payload: { amount, currency } }) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Number(amount) * 100,
    currency,
    // automatic_payment_methods: { enabled: true },
    payment_method_types: ["card"],
  });
  return paymentIntent.client_secret;
};
