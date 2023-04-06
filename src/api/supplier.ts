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

export function getSuppliers(params) {
  return http.request({
    url: '/suppliers',
    method: 'POST',
    data: params,
  });
}

export function getAllSuppliers() {
  return http.request({
    url: '/suppliers-all',
    method: 'POST',
    data: {},
  });
}

export function getSupplier(id) {
  return http.request({
    url: `/supplier-info/`,
    method: 'POST',
    data: {
      id,
    },
  });
}

export function createSupplier(params) {
  return http.request({
    url: '/supplier-create',
    method: 'POST',
    data: params,
  });
}

export function updateSupplier(params) {
  return http.request({
    url: '/supplier-update',
    method: 'POST',
    data: params,
  });
}

export function deleteSupplier(id) {
  return http.request({
    url: `/supplier-delete`,
    method: 'POST',
    data: {
      _id: id,
    },
  });
}
