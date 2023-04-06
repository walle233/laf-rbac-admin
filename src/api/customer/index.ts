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

export function getCustomers(params) {
  return http.request({
    url: '/customers',
    method: 'POST',
    data: params,
  });
}

export function getAllCustomers() {
  return http.request({
    url: '/customers-all',
    method: 'POST',
    data: {},
  });
}

export function getCustomer(id) {
  return http.request({
    url: `/customers-info/`,
    method: 'POST',
    data: {
      id,
    },
  });
}

export function createCustomer(params) {
  return http.request({
    url: '/customer-create',
    method: 'POST',
    data: params,
  });
}

export function updateCustomer(params) {
  return http.request({
    url: '/customer-update',
    method: 'POST',
    data: params,
  });
}

export function deleteCustomer(id) {
  return http.request({
    url: `/customer-delete`,
    method: 'POST',
    data: {
      _id: id,
    },
  });
}
