import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';
import { renderIcon } from '@/utils/index';
import { UserOutlined } from '@vicons/antd';

/**
 * @param name 路由名称, 必须设置,且不能重名
 * @param meta 路由元信息（路由附带扩展信息）
 * @param redirect 重定向地址, 访问这个路由时,自定进行重定向
 * @param meta.disabled 禁用整个菜单
 * @param meta.title 菜单名称
 * @param meta.icon 菜单图标
 * @param meta.keepAlive 缓存该路由
 * @param meta.sort 排序越小越排前
 *
 * */
const routes: Array<RouteRecordRaw> = [
  {
    path: '/user',
    name: 'User',
    redirect: '/user/user',
    component: Layout,
    meta: {
      title: '用户管理',
      icon: renderIcon(UserOutlined),
      sort: 100,
    },
    children: [
      {
        path: 'user',
        name: 'User',
        meta: {
          title: '用户列表',
          activeMenu: 'User',
          permissions: ['user'],
        },
        component: () => import('@/views/user/user/index.vue'),
      },
      {
        path: 'user-token',
        name: 'Token',
        meta: {
          title: '鉴权Token',
          activeMenu: 'Token',
          permissions: ['user.token'],
        },
        component: () => import('@/views/user/token/list/index.vue'),
      },
      {
        path: ':schemaId/edit/:contentId',
        name: 'UserContentEdit',
        meta: {
          title: '更新内容',
          activeMenu: 'Schema',
          hidden: true,
        },
        component: () => import('@/views/user/token/edit/index.vue'),
      },
      {
        path: ':schemaId/create',
        name: 'UserContentCreate',
        meta: {
          title: '增加内容',
          activeMenu: 'Schema',
          hidden: true,
        },
        component: () => import('@/views/user/token/edit/index.vue'),
      },
    ],
  },
];

export default routes;
