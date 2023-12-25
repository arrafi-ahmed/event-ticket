import $axios from "@/plugins/axios";
import FileSaver from "file-saver";

export const namespaced = true;

export const state = {
  // report: {},
};

export const mutations = {
  // setReport(state, payload) {
  //   state.badge = payload;
  // },
};

export const actions = {
  downloadAttendeeReport({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .get("/api/report/downloadAttendeeReport", {
          params: { eventId: request },
          responseType: "blob",
        })
        .then((response) => {
          const filename = `attendee-report-${new Date()
            .toISOString()
            .slice(0, 19)}.xlsx`;

          const blob = new Blob([response.data], { type: response.data.type });
          FileSaver.saveAs(blob, filename);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  downloadCheckinReport({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .get("/api/report/downloadCheckinReport", {
          params: { eventId: request },
          responseType: "blob",
        })
        .then((response) => {
          const filename = `checkin-report-${new Date()
            .toISOString()
            .slice(0, 19)}.xlsx`;

          const blob = new Blob([response.data], { type: response.data.type });
          FileSaver.saveAs(blob, filename);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  downloadFinancialReport({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .get("/api/report/downloadFinancialReport", {
          params: { eventId: request },
          responseType: "blob",
        })
        .then((response) => {
          const filename = `financial-report-${new Date()
            .toISOString()
            .slice(0, 19)}.xlsx`;

          const blob = new Blob([response.data], { type: response.data.type });
          FileSaver.saveAs(blob, filename);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  downloadScannedBadgeReport({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .get("/api/report/downloadScannedBadgeReport", {
          params: { eventId: request },
          responseType: "blob",
        })
        .then((response) => {
          const filename = `scanned-badge-report-${new Date()
            .toISOString()
            .slice(0, 19)}.zip`;

          const blob = new Blob([response.data], { type: response.data.type });
          FileSaver.saveAs(blob, filename);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  downloadSurveyReport({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .get("/api/report/downloadSurveyReport", {
          params: { eventId: request },
          responseType: "blob",
        })
        .then((response) => {
          const filename = `survey-report-${new Date()
            .toISOString()
            .slice(0, 19)}.zip`;

          const blob = new Blob([response.data], { type: response.data.type });
          FileSaver.saveAs(blob, filename);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
};

export const getters = {};
