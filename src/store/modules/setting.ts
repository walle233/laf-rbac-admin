import { defineStore } from 'pinia';
import { store } from '@/store';
import { getSetting, updateSetting } from '@/api/setting/system';
import { logger } from '@/utils/Logger';

export const useSystemSettingStore = defineStore('app-system-setting', {
  state: () => ({
    email: {
      emailAddr: '',
      smtpAddr: '',
      smtpPort: '',
      smtpName: '',
      smtpPassword: '',
    },
    setting: {
      name: '',
      logo: [],
      icpCode: '',
      mobile: '',
      address: '',
      loginCode: 0,
      systemOpen: true,
      closeText: '',
    },
  }),
  getters: {
    settings: (state) => {
      return state.setting;
    },
    emails: (state) => {
      return state.email;
    },
  },
  actions: {
    updateSystemSetting(setting) {
      this.setting.name = setting.name;
      this.setting.logo = setting.logo;
      this.setting.icpCode = setting.icpCode;
      this.setting.mobile = setting.mobile;
      this.setting.address = setting.address;
      this.setting.loginCode = setting.loginCode;
      this.setting.systemOpen = setting.systemOpen;
      this.setting.closeText = setting.closeText;
    },
    updateSystemEmail(email) {
      this.email.emailAddr = email.emailAddr;
      this.email.smtpAddr = email.smtpAddr;
      this.email.smtpPort = email.smtpPort;
      this.email.smtpName = email.smtpName;
      this.email.smtpPassword = email.smtpPassword;
    },
    // 获取系统设置
    async getSystemSettings() {
      try {
        const result = await getSetting({ key: 'basic' });
        this.updateSystemSetting(result);
      } catch (e) {
        logger.log('error', e);
      }
    },
    async getSystemEmail() {
      try {
        const result = await getSetting({ key: 'email' });
        this.updateSystemEmail(result);
      } catch (e) {
        logger.log('error', e);
      }
    },
    // 更新系统设置信息
    async save(key: string): Promise<boolean> {
      try {
        if (key === 'basic') {
          const params = this.setting;
          await updateSetting({ key: key, ...params });
        } else if (key === 'email') {
          const params = this.email;
          await updateSetting({ key: key, ...params });
        }
        return true;
      } catch (e) {
        logger.log('error', e);
      }
      return false;
    },
  },
});

export function useSystemSettingStoreWidthOut() {
  return useSystemSettingStore(store);
}
