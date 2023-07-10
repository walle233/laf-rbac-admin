import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';
import { PartitionOutlined } from '@vicons/antd';
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
    path: '/content',
    name: 'Content',
    redirect: '/content',
    component: Layout,
    meta: {
      title: '内容集合',
      icon: renderIcon(PartitionOutlined),
      sort: 3,
    },
    children: [
      {
        path: ':schemaId/edit/:contentId',
        name: 'ContentEdit',
        meta: {
          title: '更新内容',
          activeMenu: 'Schema',
          hidden: true,
        },
        component: () => import('@/views/content/edit/index.vue'),
      },
      {
        path: ':schemaId/create',
        name: 'ContentCreate',
        meta: {
          title: '增加内容',
          activeMenu: 'Schema',
          hidden: true,
        },
        component: () => import('@/views/content/edit/index.vue'),
      },
    ],
  },
];

export default routes;
