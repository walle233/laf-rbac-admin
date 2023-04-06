import dayjs from 'dayjs';

export const columns = [
  {
    title: '型号',
    key: 'modelNumber',
    width: 120,
    fixed: 'left',
  },
  {
    title: '客户',
    key: 'customerName',
    width: 100,
  },
  {
    title: '客户联系人',
    key: 'customerContact',
    width: 100,
  },
  {
    title: '花宽',
    key: 'width',
    width: 80,
  },
  {
    title: '花高',
    key: 'height',
    width: 80,
  },
  {
    title: '出码率',
    key: 'rate',
    width: 80,
  },
  {
    title: '码重',
    key: 'weight',
    width: 80,
  },
  {
    title: '价格',
    key: 'price',
    width: 80,
  },
  {
    title: '供应商',
    key: 'supplierName',
    width: 100,
  },
  {
    title: '货号',
    key: 'goodsNumber',
    width: 120,
  },
  {
    title: '创建时间',
    key: 'created_at',
    width: 140,
    render: (row) => {
      return dayjs(row.created_at).format('YYYY-MM-DD HH:mm');
    },
  },
  {
    title: '备注',
    key: 'remark',
    width: 140,
  },
];
