export const namespaced = true;

export const state = {
  invoice: null,
};

export const mutations = {
  setInvoice(state, payload) {
    state.invoice = payload;
  },
};
