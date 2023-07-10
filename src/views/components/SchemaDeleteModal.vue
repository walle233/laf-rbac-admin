<script setup lang="ts">
  import { reactive, ref, toRefs } from 'vue';
  import { deleteSchema, deleteSchemaApi } from '@/api/cms/schema';
  import { useMessage } from 'naive-ui';

  const message = useMessage();

  const props = defineProps<{
    modelValue: boolean;
    currentSchema: Schema | undefined;
  }>();
  const emit = defineEmits(['closeModal', 'fetchSchemaList']);

  const { modelValue, currentSchema } = toRefs(props);

  const handleClose = () => {
    emit('closeModal');
  };

  const formBtnLoading = ref(false);

  const formParams = reactive({
    deleteCollection: false,
  });

  const resetFormParams = () => {
    formParams.deleteCollection = false;
  };

  const confirmForm = async (e) => {
    e.preventDefault();
    formBtnLoading.value = true;

    const params = {
      schemaId: currentSchema.value?._id,
      deleteCollection: formParams.deleteCollection,
    };

    await deleteSchema(params);
    await deleteSchemaApi({
      collectionName: currentSchema.value?.collectionName,
    });

    formBtnLoading.value = false;
    message.success('删除成功');
    emit('closeModal');
    emit('fetchSchemaList');
  };
</script>

<template>
  <n-modal
    :show="modelValue"
    :show-icon="false"
    preset="dialog"
    :mask-closable="false"
    :on-after-leave="resetFormParams"
    title="删除内容模型"
    @close="handleClose"
  >
    <n-card :bordered="false">
      <n-form-item
        :label="`确认删除【${currentSchema?.displayName} (${currentSchema?.collectionName})】内容模型？`"
        path="displayName"
      >
        <n-checkbox
          :checked="formParams.deleteCollection"
          label="同时删除数据表（警告：删除后数据无法找回）"
          @update-checked="formParams.deleteCollection = $event"
        />
      </n-form-item>
    </n-card>
    <template #action>
      <n-space>
        <n-button @click="handleClose">取消</n-button>
        <n-button type="info" :loading="formBtnLoading" @click="confirmForm">确定</n-button>
      </n-space>
    </template>
  </n-modal>
</template>
