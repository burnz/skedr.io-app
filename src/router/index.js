import Vue from 'vue'
import Router from 'vue-router'
import Group from './pages/Group.vue'
import Home from './pages/Home.vue'
import Toolbar from './Toolbar.vue'
import AppToolbar from './AppToolbar.vue'
import RightBar from './RightBar.vue'
import Login from './pages/Login.vue'
import Signup from './pages/Signup.vue'
import Scheduled from './pages/Scheduled.vue'
import Photostream from './pages/Photostream.vue'
import { authUser } from '../libs/aws-lib'
import store from '../store'

Vue.use(Router)

const mainTitle = 'Beta - Skedr.io - Improved Flickr groups workflow'

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      pathToRegexpOptions: {
        strict: true
      },
      name: 'Home',
      components: {
        default: Home,
        toolbar: Toolbar
      },
      meta: {
        title: mainTitle,
        description:
          'Improve your Flickr groups workflow with Skedr.io. Autoschedule failed shared photos due to group restriccions.'
      }
    },
    {
      path: '/groups',
      name: 'Group',
      components: {
        default: Group,
        toolbar: AppToolbar,
        rightBar: RightBar
      },
      meta: { requiresAuth: true }
    },
    {
      path: '/scheduled',
      name: 'Scheduled photos',
      components: {
        default: Scheduled,
        toolbar: AppToolbar,
        rightBar: RightBar
      },
      meta: { requiresAuth: true }
    },
    {
      path: '/photostream',
      name: 'Photostream',
      components: {
        default: Photostream,
        toolbar: AppToolbar,
        rightBar: RightBar
      },
      meta: { requiresAuth: true }
    },
    {
      path: '/login/',
      pathToRegexpOptions: {
        strict: true
      },
      name: 'Login',
      components: {
        default: Login,
        toolbar: Toolbar
      },
      meta: {
        title: `Login - ${mainTitle}`,
        description:
          'Login with your Flickr account into Skedr.io. Access a whole new interface that helps to manage your flickr photos in groups.'
      }
    },
    {
      path: '/signup/',
      pathToRegexpOptions: {
        strict: true
      },
      name: 'Signup',
      components: {
        default: Signup,
        toolbar: Toolbar
      },
      meta: {
        title: `Signup - ${mainTitle}`,
        description:
          'Signup into Skedr.io. You need a Flickr account to be able to use this product. Go to Flickr.com to create one and comeback to signup.'
      }
    },
    {
      path: '/login',
      redirect: '/login/'
    },
    {
      path: '/signup',
      redirect: '/signup/'
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  document.title = to.meta.title
  document.querySelector('meta[name="description"]').setAttribute('content', to.meta.description)
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (store.state.cognito.user === null) {
      await store
        .dispatch('getCurrentUser')
        .then(() => authUser(store.state.cognito.user.tokens.IdToken))
        .catch(() =>
          next({
            path: '/login',
            query: { redirect: to.fullPath }
          })
        )
    } else {
      authUser(store.state.cognito.user.tokens.IdToken)
    }
  }
  store.commit('setPageTitle', to.name)
  next()
})

export default router
