<script setup lang="ts">
  import { useMessage } from 'naive-ui';
  import { reactive, ref, toRefs, watch } from 'vue';
  import { createSchema } from '@/api/cms/schema';

  const props = defineProps<{
    modelValue: boolean;
    currentSchema: Schema | undefined;
  }>();
  const emit = defineEmits(['closeModal', 'fetchSchemaList']);

  const { modelValue, currentSchema } = toRefs(props);

  const handleClose = () => {
    emit('closeModal');
  };

  const handeleFetchSchemaList = () => {
    emit('fetchSchemaList');
  };

  const message = useMessage();
  const formRef: any = ref(null);
  const formBtnLoading = ref(false);

  const formParams = reactive({
    displayName: '',
    collectionName: '',
    description: '',
    fields: [] as SchemaField[],
  });

  watch(
    () => modelValue.value,
    (val) => {
      if (val && currentSchema.value) {
        formParams.displayName = currentSchema.value.displayName;
        formParams.collectionName = currentSchema.value.collectionName + '-copy';
        formParams.description = currentSchema.value.description;
        formParams.fields = currentSchema.value.fields;
      }
    },
    { immediate: true }
  );

  const resetFormParams = () => {
    formParams.displayName = '';
    formParams.collectionName = '';
    formParams.description = '';
    formParams.fields = [];
  };

  const rules = {
    displayName: [
      { required: true, message: '请输入展示名称', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' },
    ],
    collectionName: [
      { required: true, message: '请输入数据库集合名称', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' },
    ],
  };

  const confirmForm = (e) => {
    e.preventDefault();
    formBtnLoading.value = true;
    formRef.value.validate(async (errors) => {
      if (!errors) {
        await createSchema(formParams);

        message.success('复制成功');
        handleClose();
        handeleFetchSchemaList();
        resetFormParams();
      } else {
        message.error('请填写完整信息');
      }
      formBtnLoading.value = false;
    });
  };
</script>

<template>
  <n-modal
    :show="modelValue"
    :show-icon="false"
    style="width: 600px"
    preset="dialog"
    :mask-closable="false"
    :on-after-leave="resetFormParams"
    title="复制模型"
    @close="handleClose"
  >
    <n-form
      :model="formParams"
      :rules="rules"
      ref="formRef"
      label-placement="left"
      :label-width="80"
      class="py-4"
    >
      <n-form-item label="展示名称" path="displayName">
        <n-input v-model:value="formParams.displayName" placeholder="请输入展示名称" />
      </n-form-item>
      <n-form-item label="集合名称" path="collectionName">
        <n-input v-model:value="formParams.collectionName" placeholder="请输入数据库集合名称" />
      </n-form-item>
      <n-form-item label="描述信息">
        <n-input v-model="formParams.description" placeholder="请输入描述" />
      </n-form-item>
    </n-form>
    <template #action>
      <n-space>
        <n-button @click="handleClose">取消</n-button>
        <n-button type="info" :loading="formBtnLoading" @click="confirmForm">确定</n-button>
      </n-space>
    </template>
  </n-modal>
</template>
