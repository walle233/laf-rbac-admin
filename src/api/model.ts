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

export function getModels(params) {
  return http.request({
    url: '/get-models',
    method: 'POST',
    data: params,
  });
}

export function getModelsByProduct(params) {
  return http.request({
    url: `/get-models-by-product/`,
    method: 'POST',
    data: params,
  });
}

export function createModel(params) {
  return http.request({
    url: '/product-model-create',
    method: 'POST',
    data: params,
  });
}

export function updateModel(params) {
  return http.request({
    url: '/product-model-update',
    method: 'POST',
    data: params,
  });
}

export function deleteModel(id) {
  return http.request({
    url: `/product-model-delete`,
    method: 'POST',
    data: {
      _id: id,
    },
  });
}

export function searchModel(params) {
  return http.request({
    url: '/models-search',
    method: 'POST',
    data: params,
  });
}
