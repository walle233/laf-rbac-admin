<script setup lang="ts">
  import { computed, toRefs } from 'vue';
  import { updateSchema } from '@/api/cms/schema';
  import { useMessage } from 'naive-ui';
  import { FieldTypes } from '@/constants/field';
  import { DeleteOutlined, EditOutlined, ExportOutlined, CopyOutlined } from '@vicons/antd';
  import { logger } from '@/utils/Logger';

  const props = defineProps<{
    currentSchema: Schema | undefined;
  }>();
  const emit = defineEmits([
    'updateField',
    'fetchSchemaList',
    'updateSchema',
    'deleteSchema',
    'exportSchema',
    'cloneSchema',
  ]);

  const message = useMessage();

  const { currentSchema } = toRefs(props);
  const title = computed(() => {
    logger.log(currentSchema.value);
    if (currentSchema.value) {
      return `${currentSchema.value?.displayName}（${currentSchema.value?.collectionName}）`;
    }
    return '';
  });
  const fields = computed(() => currentSchema.value?.fields.filter((_) => !_.isSystem));

  const handleUpdateField = (field: SchemaField) => {
    emit('updateField', field);
  };

  const handleUpdateSchema = () => {
    emit('updateSchema');
  };

  const handleDeleteSchema = () => {
    emit('deleteSchema');
  };

  const handleExportSchema = () => {
    emit('exportSchema');
  };

  const handleCloneSchema = () => {
    emit('cloneSchema');
  };

  const handleDeleteField = async (field: SchemaField) => {
    await updateSchema({
      _id: currentSchema.value?._id,
      fields: currentSchema.value?.fields.filter((_) => _.id !== field.id),
    });

    emit('fetchSchemaList');
    message.success('删除成功');
  };
</script>

<template>
  <n-card class="schema-field-box" :title="title">
    <template #header-extra>
      <n-tooltip placement="top">
        <template #trigger>
          <n-button type="primary" class="mr-2" circle text @click="handleUpdateSchema">
            <template #icon>
              <n-icon> <EditOutlined /> </n-icon>
            </template>
          </n-button>
        </template>
        <span>编辑模型</span>
      </n-tooltip>
      <n-tooltip placement="top">
        <template #trigger>
          <n-button type="primary" class="mr-2" circle text @click="handleDeleteSchema">
            <template #icon>
              <n-icon> <DeleteOutlined /> </n-icon>
            </template>
          </n-button>
        </template>
        <span>删除模型</span>
      </n-tooltip>
      <n-tooltip placement="top">
        <template #trigger>
          <n-button type="primary" class="mr-2" circle text @click="handleExportSchema">
            <template #icon>
              <n-icon> <ExportOutlined /> </n-icon>
            </template>
          </n-button>
        </template>
        <span>导出模型</span>
      </n-tooltip>
      <n-tooltip placement="top">
        <template #trigger>
          <n-button type="primary" class="mr-2" circle text @click="handleCloneSchema">
            <template #icon>
              <n-icon> <CopyOutlined /> </n-icon>
            </template>
          </n-button>
        </template>
        <span>复制当前模型为新的模型</span>
      </n-tooltip>
    </template>
    <n-card class="field-item" hoverable v-for="item in fields" :key="item.id">
      <div class="field-content">
        <div class="field-left">
          <div class="field-title">
            <span>{{ item.displayName }}</span>
            <span> #{{ item.name }} </span>
          </div>
          <div class="field-type">
            <n-tag class="tag" size="small" type="info">
              {{ FieldTypes.find((_) => _.type === item.type)?.name }}
            </n-tag>
            <n-tag v-if="item.min && item.max" class="tag" size="small" type="info">
              {{ `长度：${item.min} - ${item.max}` }}
            </n-tag>
            <n-tag v-else-if="item.min" class="tag" size="small" type="info">
              {{ `最大长度${item.min}` }}
            </n-tag>
            <n-tag v-else-if="item.max" class="tag" size="small" type="info">
              {{ `最小长度${item.min}` }}
            </n-tag>
            <n-tag class="tag" v-if="item.defaultValue" size="small" type="info">
              {{ `默认值：${item.defaultValue}` }}
            </n-tag>
            <n-tag class="tag" v-if="item.isRequired" size="small" type="info">
              {{ '必须项' }}
            </n-tag>
            <n-tag class="tag" v-if="item.isHidden" size="small" type="info">
              {{ '隐藏' }}
            </n-tag>
            <n-tag class="tag" v-if="item.isSearch" size="small" type="info">
              {{ '搜索项' }}
            </n-tag>
            <n-tag class="tag" v-if="item.isOrderField" size="small" type="info">
              {{ item.orderDirection === 'asc' ? '升序' : '降序' }}
            </n-tag>
          </div>
        </div>
        <div class="field-right">
          <n-button type="primary" size="small" @click="handleUpdateField(item)"> 编辑 </n-button>
          <n-popconfirm
            positive-text="确定"
            negative-text="取消"
            @positive-click="handleDeleteField(item)"
          >
            <template #trigger>
              <n-button type="error" size="small"> 删除 </n-button>
            </template>
            确定删除该字段吗？
          </n-popconfirm>
        </div>
      </div>
    </n-card>
    <!-- 空数据展示 -->
    <div v-if="!fields?.length" class="flex justify-center items-center h-40">
      <n-empty description="请选择内容类型添加字段" />
    </div>
  </n-card>
</template>

<style lang="less" scoped>
  .schema-field-box {
    width: 760px;
    border: none;
    overflow: hidden;
    overflow-y: scroll;

    .field-item {
      // cursor: pointer;
      margin-bottom: 20px;
      position: relative;

      .field-content {
        display: flex;
        flex-direction: row;
        .field-left {
          flex: 1;
          .field-title {
            align-items: center;
            font-size: 14px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
          }

          .field-type {
            font-size: 12px;
            color: #999;
            margin-bottom: 10px;
            .tag {
              margin-right: 4px;
            }
          }
        }

        .field-right {
          width: 140px;
          display: flex;
          justify-content: space-around;
          align-items: center;
        }
      }
    }
  }
</style>
