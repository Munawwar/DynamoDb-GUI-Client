<template lang="pug">
  el-row(class="sidebar")
    SidebarDatabases(
      v-if="!currentDb"
      :databaseList="database.list"
      :elementHandler="getCurrentDb"
      :currentDb="currentDb"
    )
    SidebarTables(
      v-if="currentDb"
      :currentDb="currentDb"
      :currentRegion="currentRegion"
      :credentialsExpireAt="credentialsExpireAt"
      :getCurrentDb="getCurrentDb"
      :getDbTables="getDbTables"
      :databaseList="database.list"
      :tableList="filteredTables"
      :switchTable="getCurrentTable"
      :currentTable="currentTable"
      :filterTextChange="filterTextChange"
      :filterText="filterText"
      :disconnect="removeDbFromState"
      :toggleCreateModal="toggleCreateModal"
      :toggleDeleteModal="toggleDeleteModal"
    )
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { Getter, Action, Mutation, State } from 'vuex-class';
import { DatabaseModuleState } from '../store/modules/database/types';
import SidebarDatabases from '../components/SidebarDatabases.vue';
import SidebarTables from '../components/SidebarTables.vue';

const namespace = 'database';

@Component({
  components: {
    SidebarDatabases,
    SidebarTables,
  },
})
export default class Sidebar extends Vue {
  @Getter private currentDb!: string;
  @Getter private currentRegion!: string;
  @Getter private credentialsExpireAt!: string;
  @Getter private currentTable!: string;
  @Getter private filteredTables!: string[];
  @Getter private filterText!: string;
  @Action private getCurrentDb!: (name: string) => Promise<void>;
  @Action private getDbTables!: (tableName?: string) => Promise<void>;
  @Action private getCurrentTable!: (name: string) => void;
  @Mutation private filterTextChange!: (value: string) => void;
  @Mutation private removeDbFromState!: () => void;
  @Mutation('setSelectedProfile', { namespace }) private setSelectedProfile!: (value: string) => void;
  @State(namespace) private database!: DatabaseModuleState;
  @Action('loadProfiles', { namespace }) private loadProfiles!: () => Promise<void>;
  @Mutation('toggleCreateModal', { namespace: 'table' })
  private toggleCreateModal!: () => void;
  @Mutation('toggleDeleteModal', { namespace: 'table' })
  private toggleDeleteModal!: () => void;

  private async created() {
    await this.loadProfiles();
    if (!this.database.selectedProfile) {
      return;
    }
    this.setSelectedProfile(this.database.selectedProfile);
    const lastProfile = localStorage.getItem('__last_profile');
    const nextProfile = this.database.list.some((profile) => profile.name === lastProfile)
      ? lastProfile!
      : this.database.selectedProfile;
    this.getCurrentDb(nextProfile);
  }
}
</script>

<style lang="stylus" scoped>
.sidebar
  height 100%
  width 100%
  min-width 150px
</style>
