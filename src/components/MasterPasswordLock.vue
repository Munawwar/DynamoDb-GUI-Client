<template lang="pug">
  div(class="lock-screen")
    div(class="lock-container")
      div(class="lock-icon")
        v-icon(name="lock" scale="3")
      h2(class="lock-title") {{ title }}

      //- Setup flow (first-time user)
      template(v-if="!isConfigured")
        el-form(@submit.native.prevent="handleSetup")
          el-form-item(label="Create Master Password")
            el-input(
              v-model="newPassword"
              type="password"
              placeholder="Enter master password"
              @keyup.enter.native="handleSetup"
              ref="passwordInput"
            )
          el-form-item(label="Confirm Password")
            el-input(
              v-model="confirmPassword"
              type="password"
              placeholder="Confirm master password"
              @keyup.enter.native="handleSetup"
            )
          el-button(type="primary" @click="handleSetup" :loading="loading" class="lock-btn") Set Master Password

      //- Unlock flow (returning user)
      template(v-else-if="!showForgotConfirm")
        el-form(@submit.native.prevent="handleUnlock")
          el-form-item(label="Master Password")
            el-input(
              v-model="unlockPassword"
              type="password"
              placeholder="Enter master password"
              @keyup.enter.native="handleUnlock"
              ref="passwordInput"
            )
          el-button(type="primary" @click="handleUnlock" :loading="loading" class="lock-btn") Unlock
          el-button(type="text" @click="showForgotConfirm = true" class="forgot-btn") Forgot master password?

      //- Forgot password confirmation
      template(v-else)
        p(class="forgot-warning") This will permanently delete all saved database connections. You will need to re-enter them after setting a new master password.
        div(class="forgot-actions")
          el-button(type="danger" @click="handleForgotPassword") Yes, reset everything
          el-button(@click="showForgotConfirm = false") Cancel

      p(v-if="error" class="error-text") {{ error }}
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { Action, Getter } from 'vuex-class';

const ns = 'masterPassword';

@Component
export default class MasterPasswordLock extends Vue {
  @Getter(`${ns}/isConfigured`) private isConfigured!: boolean;
  @Action(`${ns}/setupMasterPassword`) private setupMasterPassword: any;
  @Action(`${ns}/unlockWithPassword`) private unlockWithPassword: any;
  @Action(`${ns}/forgotPassword`) private forgotPassword: any;

  private newPassword: string = '';
  private confirmPassword: string = '';
  private unlockPassword: string = '';
  private error: string = '';
  private loading: boolean = false;
  private showForgotConfirm: boolean = false;

  private get title(): string {
    if (this.showForgotConfirm) { return 'Reset Master Password'; }
    return this.isConfigured ? 'Unlock App' : 'Set Up Master Password';
  }

  private mounted() {
    this.$nextTick(() => {
      const input = this.$refs.passwordInput as any;
      if (input) { input.focus(); }
    });
  }

  private async handleSetup() {
    this.error = '';
    if (!this.newPassword.trim()) {
      this.error = 'Password cannot be empty.';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Passwords do not match.';
      return;
    }
    this.loading = true;
    try {
      await this.setupMasterPassword(this.newPassword);
    } catch (e) {
      this.error = (e as any).message || 'Failed to set master password.';
    }
    this.loading = false;
  }

  private async handleUnlock() {
    this.error = '';
    if (!this.unlockPassword) {
      this.error = 'Please enter your master password.';
      return;
    }
    this.loading = true;
    const success = await this.unlockWithPassword(this.unlockPassword);
    this.loading = false;
    if (!success) {
      this.error = 'Incorrect master password.';
      this.unlockPassword = '';
    }
  }

  private handleForgotPassword() {
    this.forgotPassword();
    this.showForgotConfirm = false;
    this.error = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }
}
</script>

<style lang="stylus" scoped>
.lock-screen
  display flex
  justify-content center
  align-items center
  width 100%
  height 100%
  background #121820

.lock-container
  width 400px
  padding 40px
  background #191d25
  border-radius 4px
  text-align center
  font-family 'Roboto', sans-serif

.lock-icon
  margin-bottom 20px
  color #00f97c

.lock-title
  color #fff
  font-weight 400
  margin-bottom 24px
  font-size 20px
  font-family 'Roboto', sans-serif

.lock-btn
  width 100%
  margin-top 8px

.forgot-btn
  margin-top 12px
  color #aaa
  &:hover
    color #00f97c

.error-text
  color #f56c6c
  margin-top 12px
  font-size 13px

.forgot-warning
  color #f0c78a
  font-size 14px
  line-height 1.6
  margin-bottom 20px

.forgot-actions
  display flex
  justify-content center
  gap 12px
</style>
