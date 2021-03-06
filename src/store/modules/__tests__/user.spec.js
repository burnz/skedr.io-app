import { getters, mutations, actions } from '@/store/modules/user'
import { Auth } from 'aws-amplify'

describe('Store user.js', () => {
  describe('getters', () => {
    it('returns username', () => {
      const state = {
        username: '12345@N01'
      }

      expect(getters.userId(state)).toBe('12345@N01')
    })
  })

  describe('mutations', () => {
    it('triggers setUser mutation', () => {
      const state = {
        user: null,
        username: null
      }

      const user = { username: '144521588%40N08', name: 'Enric' }

      mutations.setUser(state, user)
      expect(state.user).toEqual(user)
      expect(state.username).toBe('144521588@N08')
    })

    it('triggers setUserId mutation', () => {
      const state = {
        userId: null
      }

      mutations.setUserId(state, 'userId')
      expect(state.userId).toBe('userId')
    })

    it('triggers setUserVerification mutation', () => {
      const state = {}

      const verification = { verification: 'something' }
      mutations.setUserVerification(state, verification)
      expect(state.userVerification).toEqual(verification)
    })
  })

  describe('actions', () => {
    it('log in an authenticated user', async () => {
      const store = {
        state: {
          username: '12345@N01'
        },
        commit: jest.fn()
      }
      const user = { username: 'test@mail.com', password: '123456' }

      const response = await actions.loginUser(store, user)
      expect(store.commit).toHaveBeenCalledTimes(2)
      expect(store.commit).toHaveBeenNthCalledWith(1, 'setUser', { user: 'User-test@mail.com', password: '123456' })
      expect(store.commit).toHaveBeenNthCalledWith(2, 'setUserVerification', {
        verified: { email: 'Verified-User-test@mail.com' }
      })
      expect(response).toEqual(true)
    })

    it('validates current user is not authenticated and needs to redirect to /login', async () => {
      const store = {
        commit: jest.fn()
      }
      const to = { matched: [{ meta: { requiresAuth: true } }] }

      const path = await actions.getAuthenticated(store, to)
      expect(store.commit).toHaveBeenCalledTimes(1)
      expect(store.commit).toHaveBeenCalledWith('setUser', null)
      expect(path).toBe('/login')
    })

    it('validates current user is not authenticated', async () => {
      const store = {
        commit: jest.fn()
      }
      const to = { matched: [{ meta: { requiresAuth: false } }] }

      const path = await actions.getAuthenticated(store, to)
      expect(store.commit).toHaveBeenCalledTimes(1)
      expect(store.commit).toHaveBeenCalledWith('setUser', null)
      expect(path).toBe(null)
    })

    it('validates current user is still authenticated', async () => {
      const store = {
        commit: jest.fn()
      }
      Auth.error = false
      const path = await actions.getAuthenticated(store, {})
      expect(store.commit).toHaveBeenCalledTimes(2)
      expect(store.commit).toHaveBeenNthCalledWith(1, 'setUser', { user: 'enric' })
      expect(store.commit).toHaveBeenNthCalledWith(2, 'setUserId', '12345')
      expect(path).toBe(null)
    })
  })
})
