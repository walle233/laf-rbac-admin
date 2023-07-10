<script setup lang="ts">
  import { FieldTypes } from '@/constants/field';

  const emit = defineEmits(['selectField']);

  type SchemaFieldTypeOptions = {
    name: string;
    type: SchemaFieldType;
  };

  const handleSelectFieldType = (fieled: SchemaFieldTypeOptions) => {
    emit('selectField', fieled);
  };
</script>

<template>
  <n-card class="filed-wrap" title="内容类型">
    <n-card
      v-for="item in FieldTypes"
      :key="item.type"
      class="filed-item"
      hoverable
      size="small"
      @click="() => handleSelectFieldType(item)"
      >{{ item.name }}</n-card
    >
  </n-card>
</template>

<style lang="less" scoped>
  .filed-wrap {
    width: 200px;
    border: none;
    overflow: hidden;
    overflow-y: scroll;

    .filed-item {
      margin-bottom: 10px;
      cursor: pointer;
    }
  }
</style>
