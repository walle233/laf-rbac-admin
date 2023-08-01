<template>
  <n-card :bordered="false" class="proCard">
    <BasicTable
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row) => row._id"
      ref="actionRef"
      :actionColumn="actionColumn"
      :scroll-x="1090"
    >
      <template #tableTitle> </template>
    </BasicTable>
  </n-card>
</template>

<script lang="ts" setup>
  import { h, reactive, ref, onMounted } from 'vue';
  import { useMessage } from 'naive-ui';
  import { BasicTable, TableAction } from '@/components/Table';
  import { columns } from './columns';
  import { logger } from '@/utils/Logger';
  import { getList, deleteFile } from '@/api/system/oss';

  type TOss = {
    _id: string | null;
    originalname: string;
    mimetype: string;
    key: string;
  };

  onMounted(() => {});

  const actionRef = ref();
  const actionColumn = reactive({
    width: 220,
    title: '操作',
    key: 'action',
    fixed: 'right',
    render(record) {
      return h(TableAction as any, {
        style: 'button',
        actions: [
          {
            label: '删除',
            type: 'error',
            popConfirm: {
              title: '确定删除吗？',
              confirm: handleDelete.bind(null, record),
            },
            ifShow: () => {
              return true;
            },
          },
          {
            label: '下载',
            onClick: handleDownload.bind(null, record),
            ifShow: () => {
              return true;
            },
          },
        ],
      });
    },
  });

  const message = useMessage();

  const loadDataTable = async (params) => {
    const ret = await getList(params);
    console.log(ret);
    return ret;
  };

  function reloadTable() {
    actionRef.value.reload();
  }

  async function handleDownload(item) {}

  async function handleDelete(item) {
    await deleteFile(item._id);

    message.success('删除成功');
    reloadTable();
  }
</script>

<style lang="less" scoped></style>
