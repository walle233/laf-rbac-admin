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

export function getProducts(params) {
  return http.request({
    url: '/products',
    method: 'POST',
    data: params,
  });
}

export function getProduct(id) {
  return http.request({
    url: `/product-info/`,
    method: 'POST',
    data: {
      _id: id,
    },
  });
}

export function createProduct(params) {
  return http.request({
    url: '/product-create',
    method: 'POST',
    data: params,
  });
}

export function updateProduct(params) {
  return http.request({
    url: '/product-update',
    method: 'POST',
    data: params,
  });
}

export function deleteProduct(id) {
  return http.request({
    url: `/product-delete`,
    method: 'POST',
    data: {
      _id: id,
    },
  });
}
