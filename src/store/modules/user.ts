import { defineStore } from 'pinia';
import { createStorage } from '@/utils/Storage';
import { store } from '@/store';
import { ACCESS_TOKEN, CURRENT_USER, IS_LOCKSCREEN, USER_INFO } from '@/store/mutation-types';
// import { ResultEnum } from '@/enums/httpEnum';

const Storage = createStorage({ storage: localStorage });
import { getUserInfo, login } from '@/api/system/admin';
import { storage } from '@/utils/Storage';
import { logger } from '@/utils/Logger';

export interface IUserState {
  token: string;
  username: string;
  welcome: string;
  avatar: string;
  permissions: any[];
  info: any;
}

export const useUserStore = defineStore({
  id: 'app-user',
  state: (): IUserState => ({
    token: Storage.get(ACCESS_TOKEN, ''),
    username: '',
    welcome: '',
    avatar: '',
    permissions: [],
    info: Storage.get(CURRENT_USER, {}),
  }),
  getters: {
    getToken(): string {
      return this.token;
    },
    getAvatar(): string {
      return this.avatar;
    },
    getNickname(): string {
      return this.username;
    },
    getPermissions(): [any][] {
      return this.permissions;
    },
    getUserInfo(): object {
      return this.info;
    },
  },
  actions: {
    setToken(token: string) {
      this.token = token;
    },
    setAvatar(avatar: string) {
      this.avatar = avatar;
    },
    setPermissions(permissions) {
      this.permissions = permissions;
    },
    setUserInfo(info) {
      this.info = info;
    },
    // 登录
    async login(userInfo) {
      try {
        const response = await login(userInfo);
        const { data, code } = response;
        if (code === 0) {
          const ex = 7 * 24 * 60 * 60 * 1000;
          storage.set(ACCESS_TOKEN, data.access_token, ex);
          storage.set(CURRENT_USER, data, ex);
          storage.set(IS_LOCKSCREEN, false);
          this.setToken(data.access_token);
          this.setUserInfo(data);
        }
        return Promise.resolve(response);
      } catch (e) {
        return Promise.reject(e);
      }
    },

    // 获取用户信息
    async GetInfo() {
      try {
        const result = await getUserInfo();

        if (result.permissions && result.permissions.length) {
          const permissionsList = result.permissions;
          this.setPermissions(permissionsList);
          this.setUserInfo(result);
          storage.set(USER_INFO, result);
        }
        this.setAvatar(result.avatar);
        return Promise.resolve(result);
      } catch (error) {
        logger.log(error);
        return;
      }
    },

    // 登出
    async logout() {
      this.setPermissions([]);
      this.setUserInfo('');
      storage.remove(ACCESS_TOKEN);
      storage.remove(CURRENT_USER);
      return Promise.resolve('');
    },
  },
});

// Need to be used outside the setup
export function useUserStoreWidthOut() {
  return useUserStore(store);
}
