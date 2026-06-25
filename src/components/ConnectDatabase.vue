<template lang="pug">
  div
    el-col(:span="24")
      .panel
        el-form
          el-form-item(label="AWS Profile")
            el-select(
              :value="selectedProfile"
              placeholder="Select AWS profile"
              filterable
              @change="selectProfile"
              @keyup.enter.native="connectProfile"
            )
              el-option(
                v-for="profile in profiles"
                :key="profile.name"
                :label="`${profile.name} (${profile.region || 'no region'})`"
                :value="profile.name"
              )
          el-alert(
            v-if="!profiles.length"
            title="No SSO profiles found in ~/.aws/config."
            type="warning"
            :closable="false"
            show-icon
          )
          el-alert(
            v-else
            title="Run aws sso login for the selected profile when it needs a fresh session."
            type="info"
            :closable="false"
            show-icon
          )
        ActionButtons(
          :cancelHandler="refreshProfiles"
          :confirmHandler="connectProfile"
          :confirmText="'Connect'"
          :cancelText="'Reload Profiles'"
        )
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import ActionButtons from './ActionButtons.vue';

@Component({
  components: {
    ActionButtons,
  },
})
export default class ConnectDatabase extends Vue {
  @Prop(Array) private profiles!: Array<{ name: string; region: string }>;
  @Prop(String) private selectedProfile!: string;
  @Prop(Function) private selectProfile!: (profile: string) => void;
  @Prop(Function) private connectProfile!: () => void;
  @Prop(Function) private refreshProfiles!: () => void;
}
</script>

<style lang="stylus" scoped>
.el-col
  display flex
  justify-content center
  align-items center

.panel
  width 80%
  margin 0 auto
  max-width 700px
  background #121820
  padding 30px
  border-radius 8px

.el-form
  width 100%
  border-radius 2px
</style>
