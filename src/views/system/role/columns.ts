import dayjs from 'dayjs';
import { h } from 'vue';
import { NTag } from 'naive-ui';

export const columns = [
  {
    title: '角色',
    key: 'name',
    width: 140,
  },
  {
    title: '角色名称',
    key: 'label',
    width: 140,
  },
  {
    title: '权限',
    key: 'permissions',
    width: 140,
    render(row) {
      if (!row.permissions || row.permissions.length === 0) {
        return '';
      }
      return h(
        'div',
        row.permissions.map((item) => {
          return h('div', { style: 'margin-bottom: 2px' }, h(NTag, { type: 'success' }, item));
        })
      );
    },
  },
  {
    title: '状态',
    key: 'status',
    width: 140,
    render(row) {
      return row.status === 0 ? '禁用' : '启用';
    },
  },
  {
    title: '创建时间',
    key: 'created_at',
    width: 200,
    render(row) {
      return dayjs(row.created_at).format('YYYY-MM-DD HH:mm');
    },
  },
];
