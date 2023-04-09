import dayjs from 'dayjs';

export const columns = [
  {
    title: '权限',
    key: 'name',
    width: 140,
  },
  {
    title: '名称',
    key: 'label',
    width: 140,
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
