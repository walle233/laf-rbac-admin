import { http } from '@/utils/http/axios';

export interface BasicResponseModel<T = any> {
  code: number;
  message?: string;
  result?: T;
  data?: T;
}

export function getMatchers(params) {
  return http.request({
    url: '/match-records',
    method: 'POST',
    data: params,
  });
}

export function createMatcher(params) {
  return http.request({
    url: '/match-record-create',
    method: 'POST',
    data: params,
  });
}
