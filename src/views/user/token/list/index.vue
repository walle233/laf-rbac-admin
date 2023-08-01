<script lang="ts" setup>
  import { h, reactive, ref, onMounted } from 'vue';
  import { useMessage } from 'naive-ui';
  import { BasicTable, TableAction } from '@/components/Table';
  import { getSchema } from '@/api/cms/schema';
  import { getContents, deleteContent } from '@/api/cms/content';
  import { PlusOutlined } from '@vicons/antd';
  import { useRoute, useRouter } from 'vue-router';
  import dayjs from 'dayjs';
  import { logger } from '@/utils/Logger';

  const route = useRoute();
  const schemaId = route.path.split('/').pop();
  const router = useRouter();
  const message = useMessage();

  const searches = ref<
    {
      key: string;
      title: string;
      value: string;
      type: string;
      options: [];
    }[]
  >([]);
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

    searches.value = fields
      .filter((item) => {
        return item.isSearch;
      })
      .map((item) => {
        return {
          key: item.name,
          title: item.displayName,
          value: item.enumElements ? null : '',
          type: item.type,
          options: item.enumElements,
        };
      });
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
            if (!Array.isArray(row[item.name])) return row[item.name];
            return row[item.name]?.join(',');
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
          // todo connect
          if (item.type === 'Connect') {
            return row[`relation-${item.connectCollection}`][item.connectField];
          }
          return row[item.name];
        },
      };
    });
    logger.log(columns.value);
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
    const filters = {};
    searches.value.forEach((item) => (filters[item.key] = item.value));
    const ret = await getContents({
      schemaId,
      ...params,
      filters: filters,
    });
    logger.log(ret);
    return ret;
  };
  const handlerSearch = async () => {
    actionRef.value.updatePage();
  };
  const handlerClear = async () => {
    searches.value.forEach((item) => {
      item.value = '';
    });
  };

  function reloadTable() {
    actionRef.value.reload();
  }

  function handleCreate() {
    router.push({
      name: 'UserContentCreate',
      params: {
        schemaId,
      },
    });
  }

  function handleEdit(record) {
    router.push({
      name: 'UserContentEdit',
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
        <div class="table_head">
          <n-button class="add" type="primary" @click="handleCreate">
            <template #icon>
              <n-icon>
                <PlusOutlined />
              </n-icon>
            </template>
            新增
          </n-button>
          <n-input-group v-for="(item, index) in searches" :key="index" style="margin-left: 8px">
            <n-input-group-label>{{ item.title }}</n-input-group-label>
            <n-select
              v-if="'Enum' === item.type"
              class="search_input"
              v-model:value="item.value"
              :placeholder="`请选择${item.title}`"
              :options="item.options"
              clearable
            />
            <n-input
              v-else
              class="search_input"
              v-model:value="item.value"
              :placeholder="`请输入${item.title}`"
            />
          </n-input-group>
          <n-button
            v-if="searches.length > 0"
            class="search_button"
            type="primary"
            @click="handlerSearch"
            >搜索</n-button
          >
          <n-button
            v-if="searches.length > 0"
            class="search_button"
            type="warning"
            @click="handlerClear"
            >清除</n-button
          >
        </div>
      </template>
    </BasicTable>
  </n-card>
</template>

<style lang="less" scoped>
  .table_head {
    display: flex;
    .add {
      margin-right: 16px;
    }
    .search_input {
      width: 120px;
      margin-right: 8px;
    }
    .search_button {
      margin-right: 8px;
    }
  }
</style>
