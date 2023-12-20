import $axios from "@/plugins/axios";

export const namespaced = true;

export const state = {
  checkinStuffs: [],
  exhibitors: [],
};

export const mutations = {
  setCheckinStaffs(state, payload) {
    state.checkinStuffs = payload;
  },
  setExhibitors(state, payload) {
    state.exhibitors = payload;
  },
  addCheckinStuffs(state, payload) {
    state.checkinStuffs.unshift(payload);
  },
  addExhibitors(state, payload) {
    state.exhibitors.unshift(payload);
  },
};

export const actions = {
  saveAppUser({ commit }, request) {
    const action =
      request.type.toLowerCase() === "checkin" ? "CheckinStuffs" : "Exhibitors";
    return new Promise((resolve, reject) => {
      $axios
        .post("/api/appUser/saveAppUser", { payload: request })
        .then((response) => {
          commit(`add${action}`, response.data?.payload);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  setAppUser({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .get("/api/appUser/getAppUser", {
          params: { eventId: request },
        })
        .then((response) => {
          commit("setCheckinStaffs", response.data?.payload?.checkinStuffs);
          commit("setExhibitors", response.data?.payload?.exhibitors);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
};

export const getters = {};
