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
    state.checkinStuffs.unshift(payload.appUser);
  },
  addExhibitors(state, payload) {
    state.exhibitors.unshift({
      ...payload.additionalExhibitorData,
      ...payload.appUser,
    });
  },
  editCheckinStuffs(state, payload) {
    const foundIndex = state.checkinStuffs.findIndex(
      (item) => item.aId == payload.appUser.id
    );
    console.log(32, foundIndex, payload, state.checkinStuffs);
    if (foundIndex !== -1) state.checkinStuffs[foundIndex] = payload.appUser;
  },
  editExhibitors(state, payload) {
    const foundIndex = state.exhibitors.findIndex(
      (item) => item.aId == payload.appUser.id
    );
    console.log(32, foundIndex, payload, state.exhibitors);
    if (foundIndex !== -1)
      state.exhibitors[foundIndex] = {
        ...payload.additionalExhibitorData,
        ...payload.appUser,
      };
  },
  removeCheckinStuffs(state, payload) {
    const foundIndex = state.checkinStuffs.findIndex(
      (item) => item.aId == payload
    );
    console.log(32, foundIndex, payload, state.checkinStuffs);
    if (foundIndex !== -1) state.checkinStuffs.splice(foundIndex, 1);
  },
  removeExhibitors(state, payload) {
    const foundIndex = state.exhibitors.findIndex(
      (item) => item.aId == payload
    );
    console.log(32, foundIndex, payload, state.exhibitors);
    if (foundIndex !== -1) state.exhibitors.splice(foundIndex, 1);
  },
};

export const actions = {
  saveAppUser({ commit }, request) {
    const commitName =
      (request.user.id ? "edit" : "add") +
      (request.user.type.toLowerCase() === "checkin"
        ? "CheckinStuffs"
        : "Exhibitors");
    console.log(
      33,
      commitName,
      request.user.id,
      request.user.type.toLowerCase()
    );

    return new Promise((resolve, reject) => {
      $axios
        .post("/api/appUser/saveAppUser", { payload: request.user })
        .then((response) => {
          commit(commitName, {
            appUser: {
              ...response.data?.payload,
              aId: response.data?.payload?.id,
            },
            additionalExhibitorData: request.additionalExhibitorData,
          });
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
  remove({ commit }, request) {
    const commitName =
      request.type.toLowerCase() === "checkin" ? "CheckinStuffs" : "Exhibitors";
    return new Promise((resolve, reject) => {
      $axios
        .get("/api/appUser/remove", {
          params: { id: request.id },
        })
        .then((response) => {
          commit(`remove${commitName}`, request.id);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
};

export const getters = {};
