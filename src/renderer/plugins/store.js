import Vue from 'vue'
// import store from 'electron-store'

// Vue.prototype.$store = new store() //全局注册，使用方法为:this.$axios

Vue.prototype.$store = {
  get: key => {
    if (localStorage.getItem(key)) {
      return JSON.parse(localStorage.getItem(key))
    } else {
      return null
    }
  },
  set: (key, val) => {
    return localStorage.setItem(key, JSON.stringify(val))
  },
  del: key => {
    return localStorage.removeItem(key)
  }
}
