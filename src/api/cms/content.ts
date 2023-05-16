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

// { schemaId, page, pageSize }
export function getContents(params) {
  return http.request({
    url: '/cms-content-list',
    method: 'POST',
    data: params,
  });
}

export function getContent({ schemaId, _id }) {
  return http.request({
    url: `/cms-content-info`,
    method: 'POST',
    data: {
      schemaId,
      _id,
    },
  });
}

export function getAllContents(schemaId) {
  return http.request({
    url: '/cms-content-all',
    method: 'POST',
    data: { schemaId },
  });
}

export function createContent({ schemaId, params }) {
  return http.request({
    url: '/cms-content-create',
    method: 'POST',
    data: { params, schemaId },
  });
}

export function updateContent({ params, schemaId, _id }) {
  return http.request({
    url: '/cms-content-update',
    method: 'POST',
    data: { params, schemaId, _id },
  });
}

export function deleteContent({ schemaId, _id }) {
  return http.request({
    url: `/cms-content-delete`,
    method: 'POST',
    data: { schemaId, _id },
  });
}
