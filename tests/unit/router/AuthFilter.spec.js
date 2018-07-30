import AuthFilter from '@/router/AuthFilter'
import { Auth } from 'aws-amplify'

jest.mock('@/store', () => {
  return {
    commit: jest.fn()
  }
})

describe('Authorization filter', () => {
  it('logs with incorrect user / password and redirects to login', () => {
    const next = jest.fn()

    AuthFilter({ matched: [{ meta: { requiresAuth: true } }] }, '', next)
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenLastCalledWith('/login')
  })

  it('logs with incorrect user / password and continues ', () => {
    const next = jest.fn()

    AuthFilter({ matched: [{ meta: { requiresAuth: false } }] }, '', next)
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenLastCalledWith()
  })

  it('logs a correct user', () => {
    const mock = jest.fn()
    Auth.error = false

    AuthFilter({ something: 'hola' }, '', mock)
    expect(mock).toHaveBeenCalledTimes(1)
    expect(mock).toHaveBeenLastCalledWith()
  })
})