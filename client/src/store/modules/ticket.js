import $axios from "@/plugins/axios";

export const namespaced = true;

export const state = {
  tickets: [],
  ticket: {},
};

export const mutations = {
  setTickets(state, payload) {
    state.tickets = payload;
  },
  setTicket(state, payload) {
    state.ticket = payload;
  },
  addTicket(state, payload) {
    state.tickets.unshift(payload);
  },
};

export const actions = {
  setTicketsWEarlyBirdActivated({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .get("/api/ticket/getTicketsWEarlyBirdActivated", { params: { formId: request } })
        .then((response) => {
          commit("setTickets", response.data?.payload);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  setTickets({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .get("/api/ticket/getTickets", { params: { formId: request } })
        .then((response) => {
          commit("setTickets", response.data?.payload);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  setTicket({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .get("/api/ticket/getTicket", { params: { ticketId: request } })
        .then((response) => {
          commit("setTicket", response.data?.payload);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  addTicket({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .post("/api/ticket/save", { payload: request })
        .then((response) => {
          // commit("addTicket", response.data?.payload);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
};

export const getters = {};
