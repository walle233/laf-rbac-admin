<script setup lang="ts">
  import { computed, reactive, toRefs, watch } from 'vue';
  import { getSchemaApi, updateSchemaApi } from '@/api/cms/schema';
  import { useMessage } from 'naive-ui';
  import { logger } from '@/utils/Logger';
  // import { updateSchema } from '@/api/cms/schema';
  // import { useMessage } from 'naive-ui';
  // import { FieldTypes } from '@/constants/field';
  // import { DeleteOutlined, EditOutlined, ExportOutlined, CopyOutlined } from '@vicons/antd';
  // import { Space } from '../../../dist/assets/index.4073d1ff';

  const API_URL = import.meta.env.VITE_GLOB_LAF_URL;
  const message = useMessage();

  const props = defineProps<{
    currentSchema: Schema | undefined;
  }>();
  const { currentSchema } = toRefs(props);
  // const emit = defineEmits(['updateField', 'fetchSchemaList']);
  //
  // const message = useMessage();
  //

  const title = computed(() => {
    logger.log(currentSchema.value);
    if (currentSchema.value) {
      return `${currentSchema.value?.displayName}（${currentSchema.value?.collectionName}）`;
    }
    return '';
  });
  const collection = computed(() => currentSchema.value?.collectionName);

  let api = reactive({
    id: '',
    enable: false,
  });
  let apiItems = reactive({
    read: {
      name: '读取 / Read',
      url: '',
      method: 'GET',
      enable: false,
      collapse: false,
      params: {
        id: '数据ID（可选:传入ID返回对应数据，不传则返回列表）',
        page: '分页(列表可选)',
        count: '分页数据数(列表可选)',
        order: '排序字段(列表可选)',
      },
    },
    add: {
      name: '添加 / Add',
      url: '',
      method: 'POST',
      enable: false,
      collapse: false,
      params: {},
    },
    update: {
      name: '更新 / Update',
      url: '',
      method: 'PUT',
      enable: false,
      collapse: false,
      params: { id: '数据ID' },
    },
    remove: {
      name: '删除 / Remove',
      url: '',
      method: 'DELETE',
      enable: false,
      collapse: false,
      params: { id: '数据ID' },
    },
  });

  watch(collection, (nv) => {
    apiItems.read.url = `/api/cms/${nv}/{id}`;
    apiItems.add.url = `/api/cms/${nv}/{id}`;
    apiItems.update.url = `/api/cms/${nv}/{id}`;
    apiItems.remove.url = `/api/cms/${nv}/{id}`;
    apiItems.read.collapse = false;
    apiItems.add.collapse = false;
    apiItems.update.collapse = false;
    apiItems.remove.collapse = false;
    getSchemaApiInfo(nv);
  });

  const getSchemaApiInfo = async (collection) => {
    const res = await getSchemaApi(collection);
    if (res) {
      api.id = res._id;
      api.enable = res.enable;
      apiItems.read.enable = res.read;
      apiItems.add.enable = res.add;
      apiItems.update.enable = res.update;
      apiItems.remove.enable = res.remove;
      currentSchema.value?.fields
        .filter((field) => {
          return !(field.name == 'updated_at' || field.name == 'created_at');
        })
        .forEach((field) => {
          apiItems.add.params[field.name] = `${field.displayName}(${
            field.isRequired ? '必须' : '可选'
          } | ${field.type})`;
        });
    } else {
      api.id = '';
      api.enable = false;
      apiItems.read.enable = false;
      apiItems.add.enable = false;
      apiItems.update.enable = false;
      apiItems.remove.enable = false;
      apiItems.add.params = {};
    }
  };

  const updateSchemaApiInfo = async (key: string, value: boolean) => {
    const params = {};
    params['_id'] = api.id;
    params[key] = value;
    await updateSchemaApi(params);
  };

  const handleApiEnable = (value: boolean) => {
    api.enable = value;
    updateSchemaApiInfo('enable', value);
  };
  const handleApiItemEnable = (key: string, value: boolean) => {
    apiItems[key].enable = value;
    updateSchemaApiInfo(key, value);
  };
  const handleApiCollect = (key: string, value: boolean) => {
    apiItems[key].collapse = value;
  };
  const handleCopyText = (txt: String) => {
    message.info('已经复制');
  };
</script>

<template>
  <n-card class="schema-api-box" :title="title">
    <template #header-extra>
      <n-tooltip v-if="currentSchema" placement="top">
        <template #trigger>
          <n-switch size="large" :value="api.enable" @update:value="handleApiEnable">
            <template #checked>已开启</template>
            <template #unchecked>已关闭</template>
          </n-switch>
        </template>
        <span>启用</span>
      </n-tooltip>
    </template>

    <div v-if="collection" class="api-content">
      <n-card v-for="(it, key) in apiItems" :key="key" class="api-item" size="small" hoverable>
        <div>
          <div class="item-top">
            <span>{{ it.name }}</span>
            <n-switch
              :round="false"
              :value="it.enable"
              :disabled="!api.enable"
              @update:value="handleApiItemEnable(key, !it.enable)"
            />
          </div>
          <div v-if="it.collapse">
            <div class="item-tag">
              <p
                ><space class="item-tag-point">Url：</space
                ><n-tag type="info">{{ API_URL }}{{ it.url }}</n-tag></p
              >
              <n-button
                strong
                secondary
                round
                type="primary"
                size="tiny"
                @click="handleCopyText(API_URL + it.url)"
                >复制</n-button
              >
            </div>
            <div class="item-tag">
              <p
                ><space class="item-tag-point">Method：</space><space>{{ it.method }}</space></p
              >
            </div>
            <div class="item-tag" style="justify-content: start"
              ><space class="item-tag-point">Params：</space
              ><div class="item-tag-params"
                ><space v-for="(value, key) in it.params" :key="key"
                  >{{ key }} ： {{ value }}</space
                ></div
              >
            </div>
          </div>
          <div class="item-bottom">
            <n-button type="primary" class="mr-2" text @click="handleApiCollect(key, !it.collapse)"
              >{{ it.collapse ? '收起' : '展开' }}
            </n-button>
          </div>
        </div>
      </n-card>
    </div>
    <div v-else class="flex justify-center items-center h-40">
      <n-empty description="请选择集合" />
    </div>
  </n-card>
</template>

<style lang="less" scoped>
  .n-card__content {
    padding: 0;
  }
  .schema-api-box {
    width: 800px;
    border: none;
    overflow: hidden;
    overflow-y: scroll;

    .api-item {
      // cursor: pointer;
      margin-bottom: 10px;
      position: relative;

      .item-top {
        font-size: 16px;
        font-weight: bold;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
      }
      .item-bottom {
        font-size: 12px;
        display: flex;
        justify-content: right;
        margin-top: 8px;
      }

      .item-tag {
        margin-top: 6px;
        font-size: 14px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
      }

      .item-tag-point {
        display: inline-block;
        width: 80px;
      }
      .item-tag-params {
        display: flex;
        flex-direction: column;
      }
    }
  }
</style>
