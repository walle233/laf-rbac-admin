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

export function getList(params) {
  return http.request({
    url: '/oss-list',
    method: 'POST',
    data: params,
  });
}

export function deleteFile(_id) {
  return http.request({
    url: '/oss-delete',
    method: 'POST',
    data: {
      _id,
    },
  });
}
