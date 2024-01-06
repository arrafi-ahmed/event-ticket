import { toast } from "vuetify-sonner";
import { countries } from "@/others/country-list";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export const appName = "Torch Events";
export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
export const clientBaseUrl = import.meta.env.VITE_BASE_URL;
export const isProd = import.meta.env.PROD;

export const printBadge = async (badge) => {
  await new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        html2canvas(badge, {
          width: badge.clientWidth,
          height: badge.clientHeight,
          useCORS: true,
        }).then((canvas) => {
          const canvasData = canvas.toDataURL("image/png", 1.0);
          const pdf = new jsPDF("l", "mm", "a5");
          pdf.addImage(canvasData, "PNG", 10, 21, 190, 120, "", "FAST");
          const blob = pdf.output("blob");

          // Create the invisible iframe
          const foundIframe = document.querySelector("iframe");
          if (foundIframe) foundIframe.parentNode.removeChild(foundIframe);
          const iframe = document.createElement("iframe");
          iframe.style.display = "none";
          document.body.appendChild(iframe);
          iframe.src = URL.createObjectURL(blob);
          iframe.onload = function () {
            iframe.contentWindow.print();
          };
        });
        console.log(1);
        resolve();
      } catch (err) {
        console.error(err);
        reject(err);
      }
    }, 100);
  });
};

export const formatDate = (inputDate) => {
  const date = new Date(inputDate);
  const day = `0${date.getDate()}`.slice(-2);
  const month = `0${date.getMonth() + 1}`.slice(-2);
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// get iso datetime offset with timezone
export const toLocalISOString = (inputDate) => {
  const date = new Date(inputDate);
  const tzoffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
  const localISOTime = new Date(date - tzoffset).toISOString().slice(0, -1);
  return localISOTime;
};

export const formatDateTime = (inputDateTime) => {
  const formattedDate = formatDate(inputDateTime);
  const date = new Date(inputDateTime);
  const hours = `0${date.getHours()}`.slice(-2);
  const minutes = `0${date.getMinutes()}`.slice(-2);
  // const seconds = `0${date.getSeconds()}`.slice(-2);
  return `${formattedDate} ${hours}:${minutes}`;
};

export const padStr = (str, num) => String(str).padStart(num, "0");

export const getDateFromDateTime = (date) =>
  new Date(date).toISOString().slice(0, 10);

export const getClientPublicImgUrl = (imageName) =>
  imageName ? `/img/${imageName}` : null;

export const getApiPublicImgUrl = (imageName, type) =>
  isProd
    ? `${apiBaseUrl}/api/public/${type}/${imageName}`
    : `${apiBaseUrl}/${type}/${imageName}`;

export const getUserImageUrl = (imageName) => {
  return imageName === "null" || !imageName
    ? getClientPublicImgUrl("default-user.jpg")
    : getApiPublicImgUrl(imageName, "user");
};

export const getEventLogoUrl = (imageName) => {
  return imageName === "null" || !imageName
    ? getClientPublicImgUrl("default-event.jpg")
    : getApiPublicImgUrl(imageName, "event-logo");
};

export const getToLink = (item) => {
  if (item.to.params) {
    const paramKey = Object.keys(item.to.params)[0];
    const paramVal = item.to.params[paramKey];
    return {
      name: item.to.name,
      params: { [paramKey]: paramVal },
    };
  }
  return item.to;
};

export const getQueryParam = (param) => {
  const queryParams = new URLSearchParams(window.location.search);
  return queryParams.get(param);
};

export const removeQueryParams = (url, paramsToRemove) => {
  const parsedUrl = new URL(url);

  // Create a URLSearchParams object from the URL's search parameters
  const searchParams = new URLSearchParams(parsedUrl.search);

  // Remove the specified query parameters
  paramsToRemove.forEach((param) => {
    searchParams.delete(param);
  });

  // Construct the new URL with the updated search parameters
  parsedUrl.search = searchParams.toString();

  // Return the updated URL as a string
  return parsedUrl.toString();
};

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidImage = (file) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
  return allowedTypes.includes(file.type);
};

export const isValidPass = [
  (v) => !!v || "Password is required!",
  (v) => v.length >= 8 || "Password must be 8 or more characters!",
  (v) => /\d/.test(v) || "Password must include at least one number!",
];

export const showApiQueryMsg = (color = "blue") => {
  if (localStorage.hasOwnProperty("apiQueryMsg")) {
    toast(localStorage.getItem("apiQueryMsg"), {
      cardProps: { color },
      action: {
        label: "Close",
        buttonProps: {
          color: "white",
        },
        onClick() {},
      },
    });
    localStorage.removeItem("apiQueryMsg");
  }
};

export const input_fields = [
  { id: 0, title: "Short answer" },
  { id: 1, title: "Paragraph" },
  { id: 2, title: "Multiple choice" },
  { id: 3, title: "Checkboxes" },
  { id: 4, title: "Dropdown" },
];

export const getInputType = (typeId) => {
  return input_fields.find((item) => item.id == typeId);
};

export const getCountryList = (filterName) => {
  if (filterName === "all") return countries;
  return countries.map((item) => item[filterName]);
};

export const getCurrencySymbol = (currencyCode, type) => {
  const currencyCodeLower = currencyCode.toString().toLowerCase();

  const currencyMap = {
    usd: { icon: "mdi-currency-usd", symbol: "$" },
    gbp: { icon: "mdi-currency-gbp", symbol: "£" },
    eur: { icon: "mdi-currency-eur", symbol: "€" },
  };

  return currencyMap[currencyCodeLower][type];
};

export const generateQrCode = async ({ id, qrUuid }) => {
  const data = JSON.stringify({ id, qrUuid });
  const qrCode = await qr.toDataURL(data);
  return qrCode.split(",")[1]; // Extract base64 data
};

export const currencyItems = [
  { title: "USD", value: 0 },
  { title: "GBP", value: 1 },
  { title: "EUR", value: 2 },
];
