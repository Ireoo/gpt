const state = {
  username: '',
  userid: ''
}

// Object.assign(state, localStorage.get('userinfo') || {})

const mutations = {
  UPDATE_USERINFO (state, userinfo) {
    Object.assign(state, userinfo)
  }
}

// const actions = {
//   someAsyncTask ({ commit }) {
//     // do something async
//     // commit('INCREMENT_MAIN_COUNTER')
//   }
// }

export default {
  state,
  mutations
  // actions
}
