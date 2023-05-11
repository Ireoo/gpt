import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
// import store from './store'

import './plugins/element-ui'
// import './plugins/adsense'
import './plugins/axios'
import './plugins/store'
import './plugins/find'
import './plugins/load'
// import { remote } from 'electron'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: {
    App
  },
  router,
  // store,
  template: '<App/>'
}).$mount('#app')

Array.prototype.diff = function (a) {
  return this.filter(function (i) {
    return a.indexOf(i) < 0
  })
}

Array.prototype.chunk = function (size) {
  let result = []
  for (let x = 0; x < Math.ceil(this.length / size); x++) {
    let start = x * size
    let end = start + size
    result.push(this.slice(start, end))
  }
  return result
}
