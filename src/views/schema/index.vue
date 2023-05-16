<script lang="ts" setup>
  import { reactive, ref, onMounted } from 'vue';

  import SchemaList from './components/SchemaList.vue';
  import FieldList from './components/FieldList.vue';
  import FieldPicker from './components/FieldPicker.vue';
  import SchemaCreateModal from './components/SchemaCreateModal.vue';
  import FieldCreateModal from './components/FieldCreateModal.vue';

  import { getAllSchemas } from '@/api/cms/schema';
  import { useRouter } from 'vue-router';

  const router = useRouter();

  onMounted(() => {
    handeleFetchSchemaList();
  });

  const schemaList = reactive<Schema[]>([]);
  const currentSchema = ref<Schema>();
  const handleChangeSchema = (key) => {
    currentSchema.value = schemaList.find((_: Schema) => _._id === key);
  };

  const handeleFetchSchemaList = async () => {
    const res = (await getAllSchemas()) as Schema[];

    schemaList.splice(0, schemaList.length, ...res);

    if (currentSchema.value) {
      currentSchema.value = schemaList.find((_) => _._id === currentSchema.value?._id);
    } else {
      currentSchema.value = schemaList[0];
    }
  };

  const showSchemaCreateModal = ref(false);
  const handleCreateSchema = () => {
    showSchemaCreateModal.value = true;
  };

  const toSchemaContent = () => {
    router.push({ path: `/content/${currentSchema.value?._id}` });
  };

  const showFieldCreateModal = ref(false);
  const fieldAction = ref<'create' | 'edit'>('create');
  const selectField = ref<Partial<SchemaField>>();
  const handleSelectField = (fieled) => {
    selectField.value = fieled;
    fieldAction.value = 'create';
    showFieldCreateModal.value = true;
  };

  const handleUpdateField = (field) => {
    selectField.value = field;
    fieldAction.value = 'edit';
    showFieldCreateModal.value = true;
  };
</script>

<template>
  <n-card :bordered="false" title="">
    <n-button class="mr-3" type="primary" @click="handleCreateSchema"> 新增模型 </n-button>
    <n-button :disabled="!currentSchema" type="primary" @click="toSchemaContent">
      内容列表
    </n-button>
  </n-card>

  <div class="schema-wrap">
    <SchemaCreateModal
      :modelValue="showSchemaCreateModal"
      modalType="create"
      @closeModal="() => (showSchemaCreateModal = false)"
      @fetchSchemaList="handeleFetchSchemaList"
    />

    <FieldCreateModal
      :modelValue="showFieldCreateModal"
      :fieldAction="fieldAction"
      :selectField="selectField"
      :currentSchema="currentSchema"
      :allSchemas="schemaList"
      @closeModal="() => (showFieldCreateModal = false)"
      @fetchSchemaList="handeleFetchSchemaList"
    />

    <SchemaList
      :currentSchema="currentSchema"
      :schemaList="schemaList"
      @changeSchema="handleChangeSchema"
    />

    <FieldList
      :currentSchema="currentSchema"
      @updateField="handleUpdateField"
      @fetchSchemaList="handeleFetchSchemaList"
    />

    <FieldPicker @selectField="handleSelectField" />
  </div>
</template>

<style lang="less" scoped>
  .schema-wrap {
    margin: 10px;
    display: flex;
    flex-direction: row;
    height: calc(100vh - 190px);
    justify-content: space-between;
  }
</style>
