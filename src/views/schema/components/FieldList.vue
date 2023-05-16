<script setup lang="ts">
  import { computed, toRefs } from 'vue';
  import { updateSchema } from '@/api/cms/schema';
  import { useMessage } from 'naive-ui';
  import { FieldTypes } from '@/constants/field';

  const props = defineProps<{
    currentSchema: Schema | undefined;
  }>();
  const emit = defineEmits(['updateField', 'fetchSchemaList']);

  const message = useMessage();

  const { currentSchema } = toRefs(props);
  const fields = computed(() => currentSchema.value?.fields.filter((_) => !_.isSystem));

  const handleUpdateField = (field: SchemaField) => {
    emit('updateField', field);
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
  <n-card class="schema-field-box" title="模型信息">
    <n-card class="field-item" hoverable v-for="item in fields" :key="item.id">
      <div class="field-content">
        <div class="field-left">
          <div class="field-title">
            <span>{{ item.displayName }}</span>
            <span> # {{ item.name }} </span>
          </div>
          <div class="field-type">
            <n-tag size="small">
              {{ FieldTypes.find((_) => _.type === item.type)?.name }}
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
  </n-card>
</template>

<style lang="less" scoped>
  .schema-field-box {
    width: 600px;
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
