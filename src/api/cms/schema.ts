import { http } from '@/utils/http/axios';
import {logger} from "@/utils/Logger";

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

export function getAllSchemaApi() {
  return http.request({
    url: `/schema-api-all`,
    method: 'POST',
    data: {},
  });
}

export function getSchemaApi(name) {
  return http.request({
    url: `/schema-api-info`,
    method: 'POST',
    data: {
      collectionName: name,
    },
  });
}

export function createSchemaApi(params) {
  return http.request({
    url: '/schema-api-create',
    method: 'POST',
    data: params,
  });
}

export function updateSchemaApi(params) {
  return http.request({
    url: '/schema-api-update',
    method: 'POST',
    data: params,
  });
}

export function deleteSchemaApi(data) {
  logger.log(data);
  return http.request({
    url: '/schema-api-delete',
    method: 'POST',
    data,
  });
}

export function requestSchemaApiGet(method: string, collection: string, data) {
  return http.request({
    url: '/schema-api-request',
    headers: {
      method: method,
      collection: collection,
    },
    method: 'GET',
    data,
  });
}

export function requestSchemaApiPost(method: string, collection: string, data) {
  return http.request({
    url: '/schema-api-request',
    headers: {
      method: method,
      collection: collection,
    },
    method: 'GET',
    data,
  });
}
