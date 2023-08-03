import { http } from '@/utils/http/axios';

export interface BasicResponseModel<T = any> {
  code: number;
  message?: string;
  result?: T;
  data?: T;
}

export interface BasicPageParams {
  pageNumber: number;
  pageSize: number;
  total: number;
}

/**
 * @description: 获取用户信息
 */
export function getUserInfo() {
  return http.request({
    url: '/admin-getinfo',
    method: 'get',
  });
}

/**
 * @description: 用户登录
 */
export function login(params) {
  return http.request<BasicResponseModel>(
    {
      url: '/admin-login',
      method: 'POST',
      params,
    },
    {
      isTransformResponse: false,
    }
  );
}

/**
 * @description: 用户修改密码
 */
export function changePassword(params, uid) {
  return http.request(
    {
      url: `/user/u${uid}/changepw`,
      method: 'POST',
      params,
    },
    {
      isTransformResponse: false,
    }
  );
}

/**
 * @description: 用户登出
 */
export function logout(params) {
  return http.request({
    url: '/logout',
    method: 'POST',
    params,
  });
}

/**
 * @description: 获取管理员列表
 * @param {BasicPageParams} params
 * @return {*}
 */
export function getAdminList(params: BasicPageParams) {
  return http.request({
    url: '/admin-list',
    method: 'POST',
    params,
  });
}

/**
 * @description: 创建管理员
 * @param {BasicPageParams} params
 */
export function createAdmin(params) {
  return http.request({
    url: '/admin-create',
    method: 'POST',
    params,
  });
}

/**
 * @description: 更新管理员
 * @param {BasicPageParams} params
 * @return {*}
 */
export function updateAdmin(params) {
  return http.request({
    url: '/admin-update',
    method: 'POST',
    params,
  });
}

/**
 * @description: 删除管理员
 * @param {BasicPageParams} params
 * @return {*}
 */
export function deleteAdmin(_id) {
  return http.request({
    url: '/admin-delete',
    method: 'POST',
    data: {
      _id,
    },
  });
}

/**
 * @description: 重置管理员密码
 * @param params
 */
export function resetPasswordAdmin(params) {
  return http.request({
    url: '/admin-resetpassword',
    method: 'POST',
    params,
  });
}

