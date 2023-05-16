<script lang="ts" setup>
  import { h, reactive, ref, onMounted } from 'vue';
  import { useMessage } from 'naive-ui';
  import { BasicTable, TableAction } from '@/components/Table';
  import { getSchema } from '@/api/cms/schema';
  import { getContents, deleteContent } from '@/api/cms/content';
  import { PlusOutlined } from '@vicons/antd';
  import { useRoute, useRouter } from 'vue-router';
  import dayjs from 'dayjs';

  const { schemaId } = useRoute().params;
  const router = useRouter();
  const message = useMessage();

  const columns = ref<
    {
      title: string;
      dataIndex: string;
      key: string;
      width?: number;
      slots?: { customRender: string };
    }[]
  >([]);
  const displayName = ref('');

  const getSchemaInfo = async () => {
    const res = await getSchema(schemaId);
    let fields: SchemaField[] = res.fields.filter((item) => !item.isHidden) || [];
    fields = [
      ...fields.filter((item) => !item.isSystem),
      ...fields.filter((item) => item.isSystem),
    ];

    columns.value = fields.map((item) => {
      return {
        title: item.displayName,
        dataIndex: item.name,
        key: item.name,
        width: 150,
        render(row) {
          if (item.type === 'Boolean') {
            return row[item.name] ? '是' : '否';
          }
          if (item.type === 'Array') {
            return row[item.name].join(',');
          }
          if (item.type === 'Image') {
            return h('img', {
              src: row[item.name],
              style: {
                width: '100px',
              },
            });
          }
          if (item.type === 'Date') {
            return dayjs(row[item.name]).format('YYYY-MM-DD');
          }
          if (item.type === 'DateTime') {
            return dayjs(row[item.name]).format('YYYY-MM-DD HH:mm:ss');
          }
          if (item.type === 'RichText') {
            return h('span', {
              innerHTML: row[item.name],
            });
          }
          if (item.type === 'File') {
            return h('a', {
              href: row[item.id],
              target: '_blank',
            });
          }
          if (item.type === 'Enum') {
            const enumItem = item.enumElements.find((_) => _.value === row[item.name]);
            return enumItem ? enumItem.label : '';
          }
          return row[item.name];
        },
      };
    });
    displayName.value = res.displayName;
  };

  onMounted(async () => {
    await getSchemaInfo();
  });

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
            label: '编辑',
            type: 'primary',
            onClick: handleEdit.bind(null, record),
          },
          {
            label: '删除',
            type: 'error',
            popConfirm: {
              title: '确定删除吗？',
              confirm: handleDelete.bind(null, record),
            },
          },
        ],
        select: (key) => {
          message.info(`您点击了，${key} 按钮`);
        },
      });
    },
  });

  const loadDataTable = async (params) => {
    const ret = await getContents({
      schemaId,
      ...params,
    });
    console.log(ret);
    return ret;
  };

  function reloadTable() {
    actionRef.value.reload();
  }

  function handleCreate() {
    router.push({
      name: 'ContentCreate',
      params: {
        schemaId,
      },
    });
  }

  function handleEdit(record) {
    router.push({
      name: 'ContentEdit',
      params: {
        schemaId,
        contentId: record._id,
      },
    });
  }

  async function handleDelete(record) {
    await deleteContent({
      schemaId,
      _id: record._id,
    });

    message.success('删除成功');
    reloadTable();
  }
</script>

<template>
  <n-card :bordered="false" class="proCard" :title="displayName">
    <BasicTable
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row) => row._id"
      ref="actionRef"
      :actionColumn="actionColumn"
      :scroll-x="1090"
    >
      <template #tableTitle>
        <n-button type="primary" @click="handleCreate">
          <template #icon>
            <n-icon>
              <PlusOutlined />
            </n-icon>
          </template>
          新增
        </n-button>
      </template>
    </BasicTable>
  </n-card>
</template>

<style lang="less" scoped></style>
