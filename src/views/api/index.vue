<script setup lang="ts">
import {onMounted, reactive, ref} from 'vue';
  import SchemaList from '../components/SchemaList.vue';
  import ApiControlList from '@/views/components/ApiControlList.vue';
  import {getAllSchemas} from '@/api/cms/schema';

  onMounted(() => {
    handleFetchSchemaList();
  });

  const schemaList = reactive<Schema[]>([]);
  const currentSchema = ref<Schema>();
  const handleChangeSchema = (key) => {
    currentSchema.value = schemaList.find((_: Schema) => _._id === key);
  };

  const handleFetchSchemaList = async () => {
    const res = (await getAllSchemas()) as Schema[];

    schemaList.splice(0, schemaList.length, ...res);

    if (currentSchema.value) {
      currentSchema.value =
        schemaList.find((_) => _._id === currentSchema.value?._id) || schemaList[0];
    } else {
      currentSchema.value = schemaList[0];
    }
  };

</script>

<template>
  <div class="schema-wrap">
    <SchemaList
      :currentSchema="currentSchema"
      :schemaList="schemaList"
      @changeSchema="handleChangeSchema"
    />

    <ApiControlList
      style="margin-left: 20px"
      :currentSchema="currentSchema"
      @fetchSchemaList="handleFetchSchemaList"
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
