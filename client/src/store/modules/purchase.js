import $axios from "@/plugins/axios";

export const namespaced = true;

export const state = {
  clientSecret: null,
  invoice: null,
};

export const mutations = {
  setClientSecret(state, payload) {
    state.clientSecret = payload;
  },
  setInvoice(state, payload) {
    state.invoice = payload;
  },
};

export const actions = {
  setClientSecret({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .post("/api/purchase/createPaymentIntent", { payload: request })
        .then((response) => {
          commit("setClientSecret", response.data?.payload);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  printInvoice({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
          .get("/api/purchase/printInvoice", { params: { payload: request } })
          .then((response) => {
            commit("setInvoice", response.data?.payload);
            resolve(response);
          })
          .catch((err) => {
            reject(err);
          });
    });
  },
};

export const getters = {};
