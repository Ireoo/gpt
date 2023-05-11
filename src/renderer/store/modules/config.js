const state = {
  list: [],
  languages: []
}

const mutations = {
  UPDATE_LIST (state, list) {
    state.list = list
  }
}

const actions = {
  someAsyncTask ({ commit }) {
    // do something async
    // commit('INCREMENT_MAIN_COUNTER')
  }
}

export default {
  state,
  mutations,
  actions
}
