<template lang="pug">
  div
    div(class="note") Privacy note: Credentials are encrypted with your master key and saved to local storage. All data is processed locally. We don't track you. Code is <a href="https://github.com/Munawwar/DynamoDb-GUI-Client" target="_blank" rel="noopener">open source</a>.
    el-col(:span="24")
      el-tabs(type="border-card" @tab-click="setToDefault")
        el-tab-pane(label="Remote")
          el-form(:model="configs")
            el-form-item(label="Database Name (Optional)")
              el-input(placeholder="Database display name" v-model="submitForm.name")
                template(slot="append")
                  el-color-picker(v-model="submitForm.color" size="mini")
            el-form-item(label="AWS region" required)
              el-select(v-model="configs.region" placeholder="AWS Region")
                el-option(v-for="(region, index) in regionList" :key="index" :label="region" :value="region")
            el-form-item(label="Access Key Id" required)
              el-input(v-model="configs.accessKeyId" placeholder="AWS access key id")
            el-form-item(label="Secret Access Key"  @keyup.enter.native="submitRemoteForm" required)
              el-input(v-model="configs.secretAccessKey" :type="inputType" placeholder="AWS secret access key")
                template(slot="append")
                  el-button(icon="el-icon-view" @click="showSecretKey")
            el-form-item(label="Session Token (Optional)")
              el-input(v-model="configs.sessionToken" placeholder="Session token")
          ActionButtons(
            :cancelHandler="setToDefault"
            :confirmHandler="submitRemoteForm"
            :confirmText="'Connect'"
            :cancelText="'Clear'"
          )
        el-tab-pane(label="Local")
          el-form(:model="configs")
            el-form-item(label="Database Name (Optional)")
              el-input(placeholder="Database display name" v-model="submitForm.name")
                template(slot="append")
                  el-color-picker(v-model="submitForm.color" size="mini")
            el-form-item(label="Local Database Endpoint" required)
              el-input(placeholder="Enter Endpoint" @keyup.enter.native="submitLocalForm" v-model="submitForm.configs.endpoint")
            el-form-item(label="AWS region" required)
              el-input(v-model="submitForm.configs.region" placeholder="AWS Region" @keyup.enter.native="submitLocalForm")
            el-form-item(label="Access Key Id" required)
              el-input(v-model="submitForm.configs.accessKeyId" placeholder="AWS access key id")
            el-form-item(label="Secret Access Key"  @keyup.enter.native="submitLocalForm" required)
              el-input(v-model="submitForm.configs.secretAccessKey" :type="inputType" placeholder="AWS secret access key")
                template(slot="append")
                  el-button(icon="el-icon-view" @click="showSecretKey")
          ActionButtons(
            :cancelHandler="setToDefault"
            :confirmHandler="submitLocalForm"
            :confirmText="'Connect'"
            :cancelText="'Clear'"
          )
        el-tab-pane(v-if="isDesktop" label="AWS SSO")
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
import { DbConfigs, SubmitForm } from '../store/modules/database/types';
import ActionButtons from './ActionButtons.vue';

@Component({
  components: {
    ActionButtons,
  },
})
export default class ConnectDatabase extends Vue {
  private inputType: string = 'password';
  @Prop(Boolean) private isDesktop!: boolean;
  @Prop(Function) private submitRemoteForm: any;
  @Prop(Function) private submitLocalForm: any;
  @Prop(Function) private setToDefault: any;
  @Prop(Function) private selectProfile!: (profile: string) => void;
  @Prop(Function) private connectProfile!: () => void;
  @Prop(Function) private refreshProfiles!: () => void;
  @Prop(Object) private submitForm!: SubmitForm;
  @Prop(Array) private regionList!: string[];
  @Prop(Object) private configs!: DbConfigs;
  @Prop(Array) private profiles!: Array<{ name: string; region: string }>;
  @Prop(String) private selectedProfile!: string;

  private mounted() {
    this.setToDefault();
  }
  private showSecretKey() {
    if (this.inputType === 'password') {
      this.inputType = 'text';
    } else {
      this.inputType = 'password';
    }
  }
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

.el-tabs
  width 80%
  margin 0 auto
  max-width 700px

.el-form
  width 100%
  border-radius 2px
  height 65vh
</style>
