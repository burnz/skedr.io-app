<template>
  <v-content style="background-image: url(/img/login-blur-min.jpg); background-size: cover;" alt="Sometext">
    <v-container
      fluid
      fill-height
      grid-list-md>
      <v-layout
        align-center
        justify-center>
        <v-flex
          xs11
          sm8
          order-md2
          order-xs1
          md5>
          <v-card class="elevation-12">

            <v-progress-linear
              v-show="protectedUI"
              :indeterminate="true"
              height="3"
              class="my-0 topFloat"/>
            <v-toolbar dark color="primary">
              <v-toolbar-title>Create a Skedr.io account</v-toolbar-title>
            </v-toolbar>
            <div class="px-5 pb-5 pt-3">
              <v-stepper
                v-model="step"
                class="elevation-0"
                vertical>
                <v-alert
                  v-show="alert.message"
                  :color="alert.color"
                  :icon="alert.icon"
                  class="mt-0"
                  value="true">
                  {{ alert.message }}
                </v-alert>
                <v-stepper-step
                  :complete="step > 1"
                  step="1">
                  Sign up with Flickr
                </v-stepper-step>
                <v-stepper-content step="1">
                  <small>First we need to connect to you flickr account. Upon pressing Connect button you will
                  be redirected to your flickr account to grant us access.
                  </small>
                  <br>
                  <v-btn
                    :disabled="protectedUI"
                    color="primary"
                    @click="handleSubmit">{{ button }}
                  </v-btn>
                </v-stepper-content>
                <v-stepper-step
                  :complete="step > 2"
                  step="2">Create your account
                </v-stepper-step>
                <v-stepper-content step="2">
                  <v-form method="post" @submit.stop.prevent="signupUser">
                    <v-text-field
                      v-model="email"
                      :disabled="disableAllInputs"
                      :rules="[rules.required, rules.email]"
                      label="Email"
                      prepend-icon="person"
                      min="1"
                      required
                    />
                    <v-text-field
                      v-model="password"
                      :disabled="disableAllInputs"
                      :append-icon-cb="() => (passVisibility = !passVisibility)"
                      :append-icon="passVisibility ? 'visibility' : 'visibility_off'"
                      :type="passVisibility ? 'password' : 'text'"
                      :rules="[rules.lowerCaseLetters, rules.upperCaseLetters, rules.numbers, rules.specialCharacters, rules.length]"
                      label="Password"
                      prepend-icon="lock"
                    />
                    <v-btn
                      :disabled="protectedUI || disableAllInputs"
                      type="submit"
                      color="primary">
                      Signup
                    </v-btn>
                  </v-form>
                </v-stepper-content>
                <v-stepper-step
                  :complete="step > 3"
                  step="3">Validate your email
                </v-stepper-step>
                <v-stepper-content step="3">
                  <small>We have sent you an email with a validation code. Please paste the code here to validate your email. If you haven't received in a few minutes check your spam folder.</small>
                  <br>
                  <v-form @submit.stop.prevent="validateCode">
                    <v-text-field
                      v-model="code"
                      :disabled="disableAllInputs"
                      :rules="[rules.numbers]"
                      label="Code"
                      counter="6"
                    />
                    <div
                      v-show="showResendButton"
                      class="form-group">
                      <button
                        class="btn btn-sm btn-info"
                        @click.stop.prevent="resendCode">Resend
                        confirmation code
                      </button>
                    </div>
                    <v-btn
                      :disabled="protectedUI || disableAllInputs"
                      type="submit"
                      color="primary">
                      Confirm code
                    </v-btn>
                    <v-btn flat>Cancel</v-btn>
                  </v-form>
                </v-stepper-content>
              </v-stepper>
          </div></v-card>
          <p class="text-xs-center mb-0 white--text subheading">Already have an account? <router-link :to="{name: 'Login'}">Log in</router-link></p>
        </v-flex>
      </v-layout>
    </v-container>
  </v-content>
</template>

<script>
import { API } from 'aws-amplify'
import { validations } from '../mixins/validation'

import { Auth, Logger } from 'aws-amplify'
const logger = new Logger('SignUpComp')

export default {
  name: 'SignUp',
  mixins: [validations],
  data: () => {
    return {
      step: 1,
      userId: '',
      email: '',
      firstName: '',
      lastName: '',
      code: '',
      alert: {
        color: '',
        icon: '',
        message: ''
      },
      passVisibility: true,
      password: '',
      protectedUI: false,
      queryString: {},
      button: 'Connect',
      disableAllInputs: false,
      showResendButton: false
    }
  },
  computed: {
    user() {
      return encodeURIComponent(this.userId)
    }
  },
  watch: {
    queryString(queryString) {
      if (queryString.oauth_verifier === undefined && queryString.oauth_token === undefined) {
        return
      }
      this.protectedUI = true
      this.button = 'Validating account'
      const myInit = {
        body: {
          userId: this.userId,
          oauthToken: queryString.oauth_token,
          oauthVerifier: queryString.oauth_verifier
        }
      }
      API.post(process.env.VUE_APP_API_NAME, '/oauth/callback', myInit)
        .then(data => {
          this.protectedUI = false
          this.userId = data.userId
          this.firstName = data.firstName
          this.lastName = data.lastName
          this.email = data.email
          localStorage.setItem('userId', '')
          this.step = 2
        })
        .catch(err => {
          this.error(err.message)
          this.protectedUI = false
          this.step = 1
          this.button = 'Connect'
        })
    }
  },
  created() {
    this.queryString = this.$route.query
    this.userId = localStorage.getItemDef('userId', '')
  },
  methods: {
    handleSubmit() {
      this.protectedUI = true
      this.reset()
      API.get(process.env.VUE_APP_API_NAME, '/oauth')
        .then(data => {
          this.userId = data.userId
          localStorage.setItem('userId', this.userId)
          window.location.href = data.redirectUrl
        })
        .catch(err => {
          this.protectedUI = false
          this.error(err.message)
        })
    },
    signupUser() {
      this.reset()
      this.protectedUI = true
      Auth.signUp({
        username: this.user,
        password: this.password,
        attributes: {
          email: this.email.toLowerCase(),
          name: this.firstName,
          family_name: this.lastName
        }
      })
        .then(data => {
          this.disableAllInputs = false
          this.protectedUI = false
          this.step = 3
          logger.debug('sign up success', data)
          this.success('Successfuly signed up')
        })
        .catch(err => {
          this.error(err.message)
          this.protectedUI = false
        })
    },
    validateCode() {
      // Remove alert boxes and resend confirmation parts first
      this.reset()
      this.showResendButton = false
      // Protect UI from being used
      this.protectedUI = true

      Auth.confirmSignUp(this.user, this.code)
        .then(() => Auth.signIn(this.user, this.password))
        .then(() => {
          const payload = { body: { userId: this.userId, email: this.email.toLowerCase() } }
          API.post(process.env.VUE_APP_API_NAME, '/oauth/user', payload)
        })
        .then(() => this.$router.push({ name: 'Photostream' }))
        .catch(err => {
          this.error(err.message)
          this.protectedUI = false
          // TODO: should it be checked for `CodeMismatchException`?
          if (err.code === 'ExpiredCodeException') {
            this.showResendButton = true
          }
        })
    },
    resendCode() {
      // Remove alert boxes first
      this.reset()

      Auth.resendSignUp(this.username)
        .then(() => {
          logger.debug('code resent')
          this.showResendButton = false
          this.success('Confirmation code has been successfuly sent')
          // Hide success message after 5 seconds
          setTimeout(() => {
            this.reset()
          }, 5000)
        })
        .catch(err => {
          this.error(err.message)
        })
    },
    success(text) {
      this.alert.icon = 'check_circle'
      this.alert.message = text
      this.alert.color = 'success'
    },
    error(text) {
      this.alert.icon = 'warning'
      this.alert.message = text
      this.alert.color = 'error'
    },
    reset() {
      this.alert.message = null
    }
  }
}
</script>
<style>
.explanation {
  background: rgba(255, 255, 255, 0.534);
}
.explanation .block {
  display: flex;
}

.informatin .icon {
  float: left;
  align-content: flex-start;
}
.explanation .text {
  float: right;
}
</style>