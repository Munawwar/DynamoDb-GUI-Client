<template lang="pug">
  .container
    el-row(class="title") AWS PROFILES
    .list-item(
      v-for="profile in databaseList"
      :key="profile.name"
      :class="{active: profile.name === currentDb}"
    )
      .item-content(@click='elementHandler(profile.name)')
        v-icon(name="database" class="db-icon")
        .meta
          span {{profile.name}}
          small {{profile.region || 'no region'}}
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
@Component
export default class SidebarDatabases extends Vue {
  @Prop(Function) private elementHandler: any;
  @Prop(Array) private databaseList!: Array<{ name: string; region: string }>;
  @Prop(String) private currentDb!: string;
}
</script>

<style lang="stylus" scoped>
.title
  font-size .9em
  padding 10px
  border-bottom 1px solid #121820

.item-content
  display flex
  justify-content space-between
  align-items center
  padding 2.5px

.list-item
  background #121820
  margin 10px
  align-items center
  display flex
  color #eee
  min-width 130px
  border-radius 5px

.list-item:hover
  cursor pointer
  background rgba(#00397f, .5)

.db-icon
  margin-left 5px

.item-content
  width 100%

.meta
  display flex
  flex-direction column
  margin-left 5px
  margin-right 5px

.meta span
  overflow hidden
  line-height 20px

.meta small
  color #8d96a5

.active
  background #00397f
</style>
