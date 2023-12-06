import { toast } from "vuetify-sonner";

export const submitStripePayment = async (elements, stripe) => {
  if (!stripe) return;

  const { error } = await stripe.confirmPayment({
    elements,
    redirect: "if_required",
  });

  if (error) {
    let msg = "";
    if (error.type === "card_error" || error.type === "validation_error") {
      msg = error.message;
    } else {
      msg = "An unexpected error occurred.";
    }
    toast(msg, {
      cardProps: { color: "error" },
      action: {
        label: "Close",
        buttonProps: {
          color: "white",
        },
        onClick() {},
      },
    });
  }
};

export async function checkStripeStatus(clientSecret, stripe) {
  if (!clientSecret.value) return;

  const { paymentIntent } = await stripe.retrievePaymentIntent(
    clientSecret.value
  );

  let msg = "";
  let color = "";
  switch (paymentIntent.status) {
    case "succeeded":
      msg = "Payment succeeded!";
      color = "success";
      break;
    case "processing":
      msg = "Your payment is processing.";
      color = "info";
      break;
    case "requires_payment_method":
      msg = "Your payment was not successful, please try again.";
      color = "error";
      break;
    default:
      msg = "Something went wrong.";
      color = "error";
      break;
  }

  toast(msg, {
    cardProps: { color },
    action: {
      label: "Close",
      buttonProps: {
        color: "white",
      },
      onClick() {},
    },
  });
  return paymentIntent.status;
}
