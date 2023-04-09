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

export function getPermissions(params) {
  return http.request({
    url: '/permission-list',
    method: 'POST',
    data: params,
  });
}

export function getAllPermissions() {
  return http.request({
    url: '/permission-all',
    method: 'POST',
    data: {},
  });
}

export function createPermission(params) {
  return http.request({
    url: '/permission-create',
    method: 'POST',
    data: params,
  });
}

export function updatePermission(params) {
  return http.request({
    url: '/permission-update',
    method: 'POST',
    data: params,
  });
}

export function deletePermission(id) {
  return http.request({
    url: `/permission-delete`,
    method: 'POST',
    data: {
      _id: id,
    },
  });
}
