<template lang="pug">
  div
    div(class="note") This desktop build uses AWS profiles from your machine. Run <code>aws sso login --profile ...</code> in a terminal when the selected profile needs a fresh SSO session.
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
          el-form-item(label="Region")
            el-input(:value="selectedRegion || 'No region configured'" disabled)
          el-alert(
            v-if="!profiles.length"
            title="No AWS profiles found in ~/.aws/config."
            type="warning"
            :closable="false"
            show-icon
          )
          el-alert(
            v-else
            title="Credentials stay on your machine. The app requests short-lived credentials from the selected AWS profile when needed."
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
  @Prop(String) private selectedRegion!: string;
  @Prop(Function) private selectProfile!: (profile: string) => void;
  @Prop(Function) private connectProfile!: () => void;
  @Prop(Function) private refreshProfiles!: () => void;
}
</script>

<style lang="stylus" scoped>
.note
  width 80%
  max-width: 700px;
  margin 30px auto
  text-align center

a
  color #00adff

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
