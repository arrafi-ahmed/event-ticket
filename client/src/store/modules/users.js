import $axios from "@/plugins/axios";

export const namespaced = true;

export const state = {
  users: [],
};

export const mutations = {
  setUsers(state, payload) {
    state.users = payload;
  },
  resetUsers(state) {
    state.users = [];
  },
  updateUser(state, payload) {
    const foundIndex = state.users.findIndex((item) => item.uId == payload.uId);
    if (foundIndex != -1)
      state.users[foundIndex] = { ...state.users[foundIndex], ...payload };
  },
  deleteUser(state, payload) {
    const foundIndex = state.users.findIndex((item) => item.uId == payload);
    if (foundIndex != -1) state.users.splice(foundIndex, 1);
  },
};

export const actions = {
  setUsers({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .get("/api/users/getUsers", { params: { formId: request } })
        .then((response) => {
          commit("setUsers", response.data?.payload);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  setUsersByNameNEventId({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .get("/api/users/getUsersByNameNEventId", {
          params: { name: request.name, eventId: request.eventId },
        })
        .then((response) => {
          commit("setUsers", response.data?.payload);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  getExhibitorsByFormId({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .get("/api/users/getExhibitorsByFormId", {
          params: { formId: request },
        })
        .then((response) => {
          commit("setUsers", response.data?.payload);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  updateUser({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .post("/api/users/updateUser", { payload: request })
        .then((response) => {
          commit("updateUser", request);
          if (request.paymentStatus) {
            const targetInvoiceId = request.pId;
            let updatingUsers = state.users.value.filter(
              (item) => item.pId == targetInvoiceId
            );

            updatingUsers.forEach((item) => {
              item.paymentStatus = request.paymentStatus;
              commit("users/updateUser", item);
            });
          }
          resolve(response.data?.payload);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  updatePaymentStatus({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .post("/api/users/updatePaymentStatus", { payload: request })
        .then((response) => {
          commit("updateUser", request);
          resolve(response.data?.payload);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  deleteUser({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .get("/api/users/deleteUser", {
          params: {
            userId: request.userId,
            registrationId: request.registrationId,
          },
        })
        .then((response) => {
          commit("deleteUser", request.userId);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
};

export const getters = {};
