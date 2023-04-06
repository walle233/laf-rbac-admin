import { h } from 'vue';
import { NAvatar } from 'naive-ui';

export const columns = [
  {
    title: '花型编号',
    key: 'productNumber',
    width: 120,
  },
  {
    title: '图片',
    key: 'image',
    width: 100,
    render(row) {
      return h(NAvatar, {
        size: 60,
        src: row.image,
      });
    },
  },
  {
    title: '宽度',
    key: 'width',
    width: 100,
  },
  {
    title: '备注',
    key: 'remark',
    width: 120,
  },
];
