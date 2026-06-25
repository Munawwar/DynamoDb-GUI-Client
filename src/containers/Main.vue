<template lang="pug">
  el-col(:span="24" class="main" v-loading="loading" element-loading-background="rgba(0, 0, 0, 0)")  
    ConnectDatabase(
      v-if="!currentDb"
      :profiles="database.list"
      :selectedProfile="database.selectedProfile"
      :selectedRegion="selectedProfileRegion"
      :selectProfile="setSelectedProfile"
      :connectProfile="connectProfile"
      :refreshProfiles="loadProfiles"
    )
    el-col(:span="24" v-if="currentTable")
      el-tabs(v-if="currentTable" v-model="activeTab" type="card" class="Main_el-tabs")
        el-tab-pane(label="Records" name="records")
          TableRecords
        el-tab-pane(label="Meta" name="meta")
          TableMeta
    span(v-if="response.message")
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { Getter, Action, Mutation, State } from 'vuex-class';
import ConnectDatabase from '../components/ConnectDatabase.vue';
import TableRecords from './TableRecords.vue';
import TableMeta from './TableMeta.vue';
import { DatabaseModuleState } from '../store/modules/database/types';

const namespace = 'database';

@Component({
  components: {
    ConnectDatabase,
    TableRecords,
    TableMeta,
  },
})
export default class Main extends Vue {
  public $notify: any;
  private activeTab: string = 'records';
  @Getter private currentDb!: string;
  @Getter private currentTable!: string;
  @Getter private response!: { message: string; title: string; type: string };
  @Getter private loading!: boolean;
  @Mutation private notified: any;
  @State(namespace) private database!: DatabaseModuleState;
  @Action('loadProfiles', { namespace }) private loadProfiles!: () => Promise<void>;
  @Action private getCurrentDb!: (name: string) => Promise<void>;
  @Mutation('setSelectedProfile', { namespace }) private setSelectedProfile!: (name: string) => void;

  private get selectedProfileRegion() {
    const selected = this.database.list.find(
      (profile) => profile.name === this.database.selectedProfile,
    );
    return (selected && selected.region) || '';
  }

  private connectProfile() {
    this.database.selectedProfile && this.getCurrentDb(this.database.selectedProfile);
  }

  private updated() {
    if (this.response.message) {
      this.$notify({
        title: this.response.title,
        message: this.response.message,
        type: this.response.type,
        duration: 3000,
      });
      this.notified();
    }
  }
}
</script>

<style lang="stylus">
  .Main_el-tabs
    height 100%
    display flex
    flex-direction column
    .el-tabs__content
      flex: 1;
</style>

<style lang="stylus" scoped>
.main
  display flex
  justify-content center
  height 100vh
  margin auto
  margin-left -2px
</style>
