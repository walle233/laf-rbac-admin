import { http } from '@/utils/http/axios';

/**
 * @description: 获取用户信息
 */
export function getSetting(params) {
  return http.request({
    url: '/setting-get-info',
    method: 'post',
    params,
  });
}

export function updateSetting(params) {
  return http.request({
    url: '/setting-update-info',
    method: 'post',
    params,
  });
}
