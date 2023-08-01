import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';
import { SettingOutlined } from '@vicons/antd';
import { renderIcon } from '@/utils/index';

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
    path: '/system',
    name: 'System',
    redirect: '/system/admin',
    component: Layout,
    meta: {
      title: '系统管理',
      icon: renderIcon(SettingOutlined),
      sort: 101,
    },
    children: [
      {
        path: 'admin',
        name: 'Admin',
        meta: {
          title: '管理员列表',
          activeMenu: 'Admin',
          permissions: ['admin.read'],
        },
        component: () => import('@/views/system/admin/index.vue'),
      },
      {
        path: 'role',
        name: 'Role',
        meta: {
          title: '角色列表',
          activeMenu: 'Role',
          permissions: ['role.read'],
        },
        component: () => import('@/views/system/role/index.vue'),
      },
      {
        path: 'permission',
        name: 'Permission',
        meta: {
          title: '权限列表',
          activeMenu: 'Permission',
          permissions: ['permission.read'],
        },
        component: () => import('@/views/system/permission/index.vue'),
      },
      {
        path: 'oss',
        name: 'OSS',
        meta: {
          title: '资源管理',
          activeMenu: 'OSS',
          permissions: ['oss.manager'],
        },
        component: () => import('@/views/system/oss/index.vue'),
      },
      {
        path: 'system',
        name: 'setting-system',
        meta: {
          title: '系统设置',
          activeMenu: 'setting-system',
          permissions: ['system.setting'],
        },
        component: () => import('@/views/setting/system/system.vue'),
      },
    ],
  },
];

export default routes;
