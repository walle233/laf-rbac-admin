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

export function getSchemas(params) {
  return http.request({
    url: '/schema-list',
    method: 'POST',
    data: params,
  });
}

export function getSchema(id) {
  return http.request({
    url: `/schema-info`,
    method: 'POST',
    data: {
      _id: id,
    },
  });
}

export function getAllSchemas() {
  return http.request({
    url: '/schema-all',
    method: 'POST',
    data: {},
  });
}

export function createSchema(params) {
  return http.request({
    url: '/schema-create',
    method: 'POST',
    data: params,
  });
}

export function updateSchema(params) {
  return http.request({
    url: '/schema-update',
    method: 'POST',
    data: params,
  });
}

export function deleteSchema(data) {
  return http.request({
    url: `/schema-delete`,
    method: 'POST',
    data,
  });
}
