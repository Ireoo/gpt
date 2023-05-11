import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: require('@/components/home').default
    },
    {
      path: '/login',
      name: 'Login',
      component: require('@/components/login').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
