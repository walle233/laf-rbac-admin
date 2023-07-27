<script setup lang="ts">
  import { reactive, ref, onMounted } from 'vue';

  import SchemaList from '../components/SchemaList.vue';
  import FieldList from '../components/FieldList.vue';
  import FieldPicker from '../components/FieldPicker.vue';
  import FieldCreateModal from '../components/FieldCreateModal.vue';
  import SchemaCreateModal from '../components/SchemaCreateModal.vue';
  import SchemaDeleteModal from '../components/SchemaDeleteModal.vue';
  import SchemaCloneModal from '../components/SchemaCloneModal.vue';

  import { getAllSchemas } from '@/api/cms/schema';
  import { useDialog, useMessage } from 'naive-ui';
  import { nanoid } from 'nanoid';
  import { saveContentToFile } from '@/utils/file';
  import { logger } from '@/utils/Logger';

  const dialog = useDialog();
  const message = useMessage();

  onMounted(() => {
    handeleFetchSchemaList();
  });

  const schemaList = reactive<Schema[]>([]);
  const currentSchema = ref<Schema>();
  const handleChangeSchema = (key) => {
    currentSchema.value = schemaList.find((_: Schema) => _._id === key);
  };

  const handeleFetchSchemaList = async () => {
    const res = ((await getAllSchemas()) as Schema[]).filter((it) => !it.system);

    schemaList.splice(0, schemaList.length, ...res);

    if (currentSchema.value) {
      currentSchema.value =
        schemaList.find((_) => _._id === currentSchema.value?._id) || schemaList[0];
    } else {
      currentSchema.value = schemaList[0];
    }
  };

  const showSchemaCreateModal = ref(false);
  const schemaModalType = ref<'create' | 'edit'>('create');
  const handleCreateSchema = () => {
    showSchemaCreateModal.value = true;
    schemaModalType.value = 'create';
  };

  const handleUpdateSchema = () => {
    showSchemaCreateModal.value = true;
    schemaModalType.value = 'edit';
  };

  const showSchemaDeleteModal = ref(false);
  const handleDeleteSchema = () => {
    showSchemaDeleteModal.value = true;
  };
  const handleExportSchema = () => {
    dialog.create({
      title: '确认导出模型数据？',
      content: '导出模型数据后，将会生成一个 JSON 文件，您可以在其他项目中导入该文件。',
      positiveText: '确定',
      onPositiveClick: () => {
        if (!currentSchema.value) return;
        const fileName = `schema-${currentSchema.value?.collectionName}-${nanoid(8)}.json`;
        const { fields, collectionName, displayName } = currentSchema.value;
        saveContentToFile(JSON.stringify([{ fields, collectionName, displayName }]), fileName);
        message.success('模型导出成功！');
      },
    });
  };

  const showSchemaCloneModal = ref(false);
  const handleCloneSchema = () => {
    showSchemaCloneModal.value = true;
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
  <div>
    <n-card :bordered="false">
      <n-button class="mr-3" type="primary" @click="handleCreateSchema"> 新增模型 </n-button>
      <n-button class="mr-3" type="primary"> 导入模型 </n-button>
    </n-card>

    <div class="schema-wrap">
      <SchemaCreateModal
        :modelValue="showSchemaCreateModal"
        :modalType="schemaModalType"
        :currentSchema="currentSchema"
        @closeModal="() => (showSchemaCreateModal = false)"
        @fetchSchemaList="handeleFetchSchemaList"
      />

      <SchemaDeleteModal
        :modelValue="showSchemaDeleteModal"
        :currentSchema="currentSchema"
        @closeModal="() => (showSchemaDeleteModal = false)"
        @fetchSchemaList="handeleFetchSchemaList"
      />

      <SchemaCloneModal
        :modelValue="showSchemaCloneModal"
        :currentSchema="currentSchema"
        @closeModal="() => (showSchemaCloneModal = false)"
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
        @updateSchema="handleUpdateSchema"
        @deleteSchema="handleDeleteSchema"
        @exportSchema="handleExportSchema"
        @cloneSchema="handleCloneSchema"
      />

      <FieldPicker @selectField="handleSelectField" />
    </div>
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
