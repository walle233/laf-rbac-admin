<script setup lang="ts">
  import { computed } from 'vue';
  import { toRefs } from 'vue';

  const props = defineProps<{
    apiList: SchemaApi[];
    currentApi: SchemaApi | undefined;
  }>();

  const emit = defineEmits(['changeApi']);

  const { apiList } = toRefs(props);

  const activeKey = computed(() => props.currentApi?._id);

  const handleChangeApi = (key: string) => {
    emit('changeApi', key);
  };
</script>

<template>
  <n-menu
    class="schema-list-box"
    v-model:value="activeKey"
    mode="vertical"
    :options="apiList.map((_) => ({ key: _._id, label: _.displayName }))"
    @update:value="handleChangeApi"
  />
</template>

<style>
  .schema-list-box {
    width: 200px;
    border: none;
    padding: 20px 0;
    background-color: #fff;
  }
</style>
