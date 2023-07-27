<script setup lang="ts">
  import { onMounted, reactive, ref } from 'vue';
  import ApiControlList from '@/views/components/ApiControl.vue';
  import { getAllSchemaApi, updateSchemaApi } from '@/api/cms/schema';
  import ApiList from '@/views/components/ApiList.vue';

  onMounted(() => {
    handleFetchApiList();
  });

  const apiList = reactive<SchemaApi[]>([]);
  const currentApi = ref<SchemaApi>();

  const handleFetchApiList = async () => {
    const res = (await getAllSchemaApi()) as SchemaApi[];
    apiList.splice(0, apiList.length, ...res);
    if (currentApi.value) {
      currentApi.value = apiList.find((_) => _._id === currentApi.value?._id || apiList[0]);
    } else {
      currentApi.value = apiList[0];
    }
  };

  const handleChangeApi = (key) => {
    currentApi.value = apiList.find((_: SchemaApi) => _._id === key);
  };

  const handleEnableApi = (value) => {
    if (currentApi.value) {
      currentApi.value.enable = value;
      updateSchemaApi({ _id: currentApi.value._id, enable: value });
    }
  };

  const handleEnableApiItem = (key, value) => {
    if (currentApi.value) {
      currentApi.value.apis[key].enable = value;
      updateSchemaApi({ _id: currentApi.value._id, apis: currentApi.value.apis });
    }
  };

  const handleTokenApiItem = (key, value) => {
    if (currentApi.value) {
      currentApi.value.apis[key].token = value;
      if (value) {
        if (!currentApi.value.apis[key].headers) {
          currentApi.value.apis[key].headers = {};
        }
        currentApi.value.apis[key].headers['Authorization'] = 'Token (必填|String)';
      } else {
        delete currentApi.value.apis[key].headers['Authorization'];
      }
      updateSchemaApi({ _id: currentApi.value._id, apis: currentApi.value.apis });
    }
  };

  const handleCollapseApiItem = (key, value) => {
    if (currentApi.value) {
      currentApi.value.apis[key].collapse = value;
      updateSchemaApi({ _id: currentApi.value._id, apis: currentApi.value.apis });
    }
  };
</script>

<template>
  <div class="schema-wrap">
    <ApiList :currentApi="currentApi" :apiList="apiList" @changeApi="handleChangeApi" />

    <ApiControlList
      style="margin-left: 20px"
      :currentApi="currentApi"
      @enableApi="handleEnableApi"
      @enableApiItem="handleEnableApiItem"
      @tokenApiItem="handleTokenApiItem"
      @collapseApiItem="handleCollapseApiItem"
    />
  </div>
</template>

<style scoped>
  .schema-wrap {
    margin: 10px;
    display: flex;
    flex-direction: row;
    height: calc(100vh - 100px);
  }
</style>
