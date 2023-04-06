// supplierId: string;
//     supplierName: string;
//     modelNumber: string;
//     width: number | null;
//     height: number | null;
//     rate: number | null;
//     weight: number | null;
//     price: number | null;
//     goodsNumber: string;

export const columns = [
  {
    title: '型号',
    key: 'modelNumber',
    width: 120,
    fixed: 'left',
  },
  {
    title: '花宽',
    key: 'width',
    width: 100,
  },
  {
    title: '花高',
    key: 'height',
    width: 100,
  },
  {
    title: '码重',
    key: 'weight',
    width: 100,
  },
  {
    title: '码价',
    key: 'price',
    width: 100,
  },
  {
    title: '出码率',
    key: 'rate',
    width: 100,
  },
  {
    title: '供应商',
    key: 'supplierName',
    width: 120,
  },
  {
    title: '货号',
    key: 'goodsNumber',
    width: 120,
  },
  {
    title: '备注',
    key: 'remark',
    width: 120,
  },
];
