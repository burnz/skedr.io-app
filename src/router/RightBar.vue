<template>
  <v-navigation-drawer
    v-model="rightDrawer"
    clipped
    fixed
    app
    right>
    <v-container fluid grid-list-md>
      <v-layout pa-0 fluid>
        <v-flex xs6>
          <v-btn
            :disabled="disable"
            block
            color="success"
            small
            outline
            @click="share({photos:pool})">
            <v-icon>share</v-icon>&nbsp;Sked
          </v-btn>
        </v-flex>
        <v-flex xs6>
          <v-btn
            v-if="hasBackup"
            :disabled="!hasBackup"
            block
            color="accent"
            small
            outline
            @click="restoreBackup" >
            <v-icon>restore_from_trash</v-icon>&nbsp;Restore
          </v-btn>
          <v-btn
            v-else
            :disabled="disable"
            block
            color="error"
            small
            outline
            @click="clearPool" >
            <v-icon>delete</v-icon>&nbsp;Clear
          </v-btn>
        </v-flex>
      </v-layout>
      <v-list subheader>
        <transition-group name="list">
          <template v-for="(photo, key) in pool">
            <v-divider
              v-if="key !== 0"
              :key="key"
              inset />
            <v-list-tile :key="photo.id" avatar>
              <v-list-tile-avatar>
                <img :src="photo.url_sq">
              </v-list-tile-avatar>
              <v-list-tile-content>
                <v-list-tile-title v-html="photo.title"/>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-btn
                  icon
                  ripple
                  @click.native.stop="remove(photo.photoId)">
                  <v-icon>close</v-icon>
                </v-btn>
              </v-list-tile-action>
            </v-list-tile>
          </template>
        </transition-group>
      </v-list>
    </v-container>
    <q-share-dialog/>
  </v-navigation-drawer>
</template>
<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import QShareDialog from '../components/QShareDialog'

export default {
  name: 'RightBar',
  components: { QShareDialog },
  computed: {
    ...mapState('pool', {
      pool: state => state.photos
    }),
    ...mapGetters({
      disable: 'pool/isEmpty',
      hasBackup: 'pool/hasBackup'
    }),
    rightDrawer: {
      get() {
        return this.$store.state.rightDrawer
      },
      set(value) {
        this.$store.commit('updateRightDrawer', value)
      }
    }
  },
  methods: {
    ...mapActions({
      remove: 'pool/remove',
      clearPool: 'pool/clearPool',
      restoreBackup: 'pool/restoreBackup',
      share: 'sharedPool/share'
    })
  }
}
</script>
<style>
.list-enter-active {
  transition: all 0.5s;
}

.list-leave-active {
  transition: all 0.3s;
}

.list-enter {
  opacity: 0;
  transform: translateY(-30px);
}

.list-leave-to {
  opacity: 0;
}
</style>
