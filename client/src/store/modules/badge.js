import $axios from "@/plugins/axios";

export const namespaced = true;

export const state = {
    badge: {},
    userScannedByExhibitor: {},
    exhibitorVisibility: {},
};

export const mutations = {
    setBadge(state, payload) {
        state.badge = payload;
    },
    resetBadge(state) {
        state.badge = {};
    },
    setUserScannedByExhibitor(state, payload) {
        state.userScannedByExhibitor = payload;
    },
    setExhibitorVisibility(state, payload) {
        state.exhibitorVisibility = payload;
    },
    resetUserScannedByExhibitor(state) {
        state.userScannedByExhibitor = {};
    },
};

export const actions = {
    print({commit}, request) {
        return new Promise((resolve, reject) => {
            $axios
                .get("/api/badge/print", {
                    params: {badgeId: request.badgeId},
                })
                .then((response) => {
                    commit("setBadge", response.data?.payload);
                    resolve(response);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    },
    checkin({commit}, request) {
        return new Promise((resolve, reject) => {
            $axios
                .get("/api/badge/checkin", {
                    params: {userId: request.userId, purchaseId: request.purchaseId},
                })
                .then((response) => {
                    commit("setBadge", response.data?.payload);
                    resolve(response);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    },
    scanBadge({commit}, request) {
        return new Promise((resolve, reject) => {
            $axios
                .get("/api/badge/scanBadge", {
                    params: {qrCodeData: request.qrCodeData, eventId: request.eventId},
                })
                .then((response) => {
                    commit("setBadge", response.data?.payload);
                    resolve(response);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    },
    setUserScannedByExhibitor({commit}, request) {
        return new Promise((resolve, reject) => {
            $axios
                .get("/api/badge/scanBadgeByExhibitor", {
                    params: {qrCodeData: request.qrCodeData, eventId: request.eventId},
                })
                .then((response) => {
                    commit("setUserScannedByExhibitor", response.data?.payload);
                    resolve(response);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    },
    setExhibitorVisibilityByFormId({commit}, request) {
        return new Promise((resolve, reject) => {
            $axios
                .get("/api/badge/getExhibitorVisibilityByFormId", {
                    params: {formId: request},
                })
                .then((response) => {
                    commit("setExhibitorVisibility", response.data?.payload);
                    resolve(response.data?.payload);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    },
    addExhibitorVisibility({commit}, request) {
        return new Promise((resolve, reject) => {
            $axios
                .post("/api/badge/addExhibitorVisibility", request)
                .then((response) => {
                    resolve(response);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    },
};

export const getters = {};
