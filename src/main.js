import Vue from 'vue'

import './plugins/vuetify'
import apolloProvider from './plugins/apolloProvider'
import aws_exports from './plugins/aws-exports'

import App from './App'
import router from './router'
import store from './store'
import './registerServiceWorker'
import './libs/storage'
import VueAnalytics from 'vue-analytics'
import Amplify, { Auth, Logger } from 'aws-amplify'

Amplify.configure(aws_exports)
Amplify.Logger.LOG_LEVEL = process.env.NODE_ENV === 'production' ? '' : '' // use DEBUG to show detailed logs from Amplify library
const logger = new Logger('main')
Auth.currentUserInfo()
  .then(user => logger.debug(user))
  .catch(err => logger.debug(err))

const isProd = process.env.NODE_ENV === 'production'

import Raven from 'raven-js'
import RavenVue from 'raven-js/plugins/vue'
if (isProd) {
  Raven.config(process.env.VUE_APP_SENTRY)
    .addPlugin(RavenVue, Vue)
    .install()
}

Vue.config.productionTip = false
Vue.use(VueAnalytics, {
  id: process.env.VUE_APP_GA,
  router,
  debug: {
    enabled: false,
    sendHitTask: isProd
  }
})

new Vue({
  router,
  store,
  provide: apolloProvider.provide(),
  beforeCreate() {
    store.dispatch('pool/load', localStorage.getObject('pool.photos'))
  },
  render: h => h(App)
}).$mount('#app')
