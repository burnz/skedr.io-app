<template>
  <v-content>
    <v-container
      fluid
      grid-list-md>
      <h1>
        <v-btn
          icon
          ripple
          flat
          @click.stop="$router.push({name: 'Group'})">
          <v-icon color="grey lighten-1">keyboard_arrow_left</v-icon>
        </v-btn> {{ $route.params.title }}
      </h1>
      <v-layout row wrap>
        <v-flex xs9>
          <span v-if="autoimportTags.length">
            <q-chip
              v-for="tag in selectedTags"
              :key="tag.value"
              :tag="tag"
              @selectedTag="selected"/>
          </span>
          <span v-else>
            You don't have any tag selected to autoimport photos to this group
          </span>
        </v-flex>
        <v-flex xs3 class="text-xs-right">
          <v-btn @click="dialog = true">Add</v-btn>
        </v-flex>
      </v-layout>
      <q-popup
        :data="tags"
        :dialog="dialog"
        toolbar-title="Choose tags"
        item-text="value"
        @close="dialog = false">
        <q-tags-dialog-list
          slot="list"
          slot-scope="props"
          :key="props.item.value"
          :tag="props.item"/>
        <q-push
          slot="save"
          slot-scope="props"
          :requests="constructPayload(props.selectedData)"
          style="margin-bottom: 56px"
          @loaded="dialog = false"
        />
      </q-popup>
      <v-layout row wrap>
        <v-flex
          v-for="photo in photos"
          :key="photo.id"
          md4
          sm6
          xs12>
          <photo :photo="photo" :tag="selectedTag"/>
        </v-flex>
      </v-layout>
    </v-container>
  </v-content>
</template>
<script>
import { mapGetters } from 'vuex'

import Photo from '../components/Photo'
import QChip from '../components/QChip'
import QPopup from '../components/QPopup'
import QTagsDialogList from '../components/QTagsDialogList'
import QPush from '../components/QPush'

import GROUP_PHOTOS from '../graphql/groupPhotos.gql'
import AUTOIMPORT_TAGS from '../graphql/autoimportTags.gql'

import _sortBy from 'lodash/sortBy'

export default {
  name: 'GroupView',
  components: { Photo, QChip, QTagsDialogList, QPopup, QPush },
  data() {
    return {
      photos: [],
      loading: 0,
      tags: [],
      autoimportTags: [],
      selectedTag: '',
      dialog: false
    }
  },
  apollo: {
    photos: {
      query: GROUP_PHOTOS,
      variables() {
        return {
          userId: this.userId,
          groupId: this.$route.params.groupId
        }
      },
      update: ({ groupPhotos }) => groupPhotos,
      loadingKey: 'loading',
      fetchPolicy: 'cache-and-network'
    },
    autoimportTags: {
      query: AUTOIMPORT_TAGS,
      variables() {
        return {
          userId: this.userId,
          groupId: this.$route.params.groupId
        }
      },
      update: ({ autoimportTags }) => {
        //TODO GraphQl query should be rethinked
        return autoimportTags.length > 0 ? autoimportTags[0].tags : []
      },
      loadingKey: 'loading',
      fetchPolicy: 'cache-and-network'
    }
  },
  computed: {
    ...mapGetters(['userId']),
    selectedTags() {
      return this.tags.filter(tag => this.autoimportTags.indexOf(tag.value) !== -1)
    }
    /*usefulTags() {
      return this.tags.filter(tag => tag.count / this.photos.length * 100 > 74)
    }*/
  },
  watch: {
    loading(value) {
      this.$emit('isLoading', value)
    },
    photos(photos) {
      const nonDuplicates = new Set()
      const tagsCount = new Object()
      photos.forEach(photo => {
        photo.tags.split(' ').forEach(tagName => {
          tagsCount[tagName] = nonDuplicates.has(tagName) ? tagsCount[tagName] + 1 : 1
          nonDuplicates.add(tagName)
        })
      })
      this.tags = this.compressArray(tagsCount)
    }
  },
  methods: {
    selected(name) {
      this.selectedTag = name
    },
    compressArray(tagsCount) {
      const tagsArr = new Array()
      for (let tagName in tagsCount) {
        let tag = new Object({
          selected: this.autoimportTags.indexOf(tagName) >= 0,
          value: tagName,
          total: this.photos.length,
          count: tagsCount[tagName],
          percentage: function() {
            return Math.round((this.count / this.total) * 100)
          }
        })
        tagsArr.push(tag)
      }

      return _sortBy(tagsArr, ['selected', 'count']).reverse()
    },
    constructPayload(tags) {
      const payload = {
        body: {
          tags: tags.map(tag => tag.value),
          userId: this.userId,
          groupId: this.groupId
        }
      }

      return [{ path: '/tags', payload }]
    }
  }
}
</script>