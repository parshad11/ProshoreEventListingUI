import Vue from 'vue'
import VueRouter from 'vue-router'
import EventIndex from '../components/EventIndex.vue'

Vue.use(VueRouter)

const routes = [
    {
      path: '/',
      name: 'EventIndex',
      component: EventIndex
    },
  ]
  
  const router = new VueRouter({
    mode: 'history',
    routes
  })
  
  export default router