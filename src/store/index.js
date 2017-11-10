let _ = require('lodash')
import Vue from 'vue'
import Vuex from 'vuex'
import createLogger from 'vuex/dist/logger'

Vue.use(Vuex)

import cognitoConfig from './cognito'
import CognitoAuth from 'vue-auth-cognito'

const debug = process.env.NODE_ENV !== 'production'
const devenv = process.env.NODE_ENV === 'dev'

export default new Vuex.Store({
  modules: {
    cognito: new CognitoAuth(cognitoConfig)
  },
  strict: debug,
  plugins: devenv ? [createLogger()] : [],
  state: {
    userId: '144521588@N08',
    rightDrawer: false,
    pageTitle: '',
    pool: [],
    groups: [],
    selectedGroups: [],
    token: '',
    groupFilter: ''
  },
  mutations: {
    loadPool (state, payload) {
      state.pool = payload.photos
    },
    addToPool (state, payload) {
      if (payload.add) {
        state.pool.unshift(payload.photo)
        state.pool = _.uniqBy(state.pool, 'id')
      } else {
        state.pool = _.filter(state.pool, function (o) { return o.id !== payload.photo.id })
      }
      localStorage.setObject('pool.photos', state.pool)
    },
    selectedGroups (state, payload) {
      state.selectedGroups = payload.groups
    },
    clearPool (state) {
      state.pool = []
      localStorage.setObject('pool.photos', [])
    },
    updateRightDrawer (state, message) {
      state.rightDrawer = message
    },
    updateGroupFilter (state, value) {
      state.groupFilter = value.toLowerCase()
    },
    setPageTitle (state, value) {
      state.pageTitle = value
    }
  },
  getters: {
    activeFab (state, getter) {
      if (getter.addingPhotosToGroup) {
        return {'class': 'deep-purple lighten-2', icon: 'add_to_photos', html: 'Add photos to group'}
      } else {
        return {'class': 'deep-purple', icon: 'add_a_photo', html: 'Search photos'}
      }
    },
    addingPhotosToGroup (state) {
      return state.selectedGroups.length > 0
    }
  }
})
