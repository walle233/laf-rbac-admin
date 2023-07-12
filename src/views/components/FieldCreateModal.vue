<script setup lang="ts">
  import { useMessage } from 'naive-ui';
  import { reactive, ref, computed, toRefs } from 'vue';
  import SpecificFormItem from './SpecificFormItem.vue';
  import { FieldTypes } from '@/constants/field';
  import { updateSchema } from '@/api/cms/schema';
  import { nanoid } from 'nanoid';
  import { watch } from 'vue';
  import { logger } from '@/utils/Logger';

  type FieldType = Partial<SchemaField>;

  const props = defineProps<{
    modelValue: boolean;
    fieldAction: 'create' | 'edit';
    selectField: FieldType | undefined;
    currentSchema: Schema | undefined;
    allSchemas: Schema[];
  }>();

  const { modelValue, fieldAction, selectField, currentSchema } = toRefs(props);
  const emit = defineEmits(['closeModal', 'fetchSchemaList']);
  const fieldTypeName = computed(() => {
    return FieldTypes.find((_) => _.type === selectField.value?.type)?.name;
  });

  const handleClose = () => {
    emit('closeModal');
  };

  const message = useMessage();
  const formRef: any = ref(null);
  const formBtnLoading = ref(false);

  // 不能设置默认值的类型
  const NoDefaultValueTypes = ['File', 'Image', 'Array', 'Connect'];
  const hasDefaultValue = (type: SchemaFieldType | undefined) => {
    if (!type) return false;
    return !NoDefaultValueTypes.includes(type);
  };

  const getDefaultValue = (type: SchemaFieldType | undefined) => {
    switch (type) {
      case 'String':
      case 'MultiLineString':
        return '';
      case 'Number':
        return 0;
      case 'Boolean':
        return false;
      case 'DateTime':
      case 'Date':
        return new Date().getTime();
      case 'File':
      case 'Image':
      case 'Media':
        return null;
      case 'Array':
        return [];
      case 'Connect':
        return null;
      default:
        return '';
    }
  };

  const formParams = reactive<FieldType>({
    displayName: '',
    name: '',
    description: '',
    isRequired: false,
    isHidden: false,
    isOrderField: false,
    defaultValue: getDefaultValue(selectField.value?.type),
  });

  const resetFormParams = () => {
    for (const key in formParams) {
      Reflect.deleteProperty(formParams, key);
    }
    formParams.displayName = '';
    formParams.name = '';
    formParams.description = '';
    formParams.isRequired = false;
    formParams.isHidden = false;
    formParams.isOrderField = false;
    formParams.defaultValue = getDefaultValue(selectField.value?.type);
  };

  watch(
    () => selectField.value,
    (val) => {
      if (val) {
        resetFormParams();
        if (fieldAction.value === 'edit') {
          for (const key in val) {
            if (Object.prototype.hasOwnProperty.call(val, key)) {
              formParams[key] = val[key];
            }
          }
        }
      }
    },
    { immediate: true }
  );

  const rules = {
    displayName: [
      { required: true, message: '请输入展示名称', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' },
    ],
    name: [
      { required: true, message: '请输入数据库字段名称', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' },
    ],
  };

  const confirmForm = (e) => {
    e.preventDefault();
    formBtnLoading.value = true;
    formRef.value.validate(async (errors) => {
      if (!errors) {
        logger.log(formParams, currentSchema.value);
        if (fieldAction.value === 'create') {
          await updateSchema({
            _id: currentSchema.value?._id,
            fields: [
              ...(currentSchema.value?.fields ?? []),
              {
                ...formParams,
                id: nanoid(),
                type: selectField.value?.type,
              },
            ],
          });
        } else {
          const fields = currentSchema.value?.fields.map((_) => {
            if (_.id === selectField.value?.id) {
              return {
                ..._,
                ...formParams,
                type: selectField.value?.type,
              };
            }
            return _;
          });
          await updateSchema({
            _id: currentSchema.value?._id,
            fields,
          });
        }

        message.success(fieldAction.value === 'create' ? '创建成功' : '修改成功');
        handleClose();
        resetFormParams();
        emit('fetchSchemaList');
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
    :title="
      fieldAction === 'create'
        ? `添加【${selectField?.name}】字段`
        : `编辑【${selectField?.displayName}】字段 #${fieldTypeName}`
    "
    @close="handleClose"
  >
    <n-form :model="formParams" :rules="rules" ref="formRef" :label-width="120" class="py-4">
      <n-form-item label="展示名称" path="displayName">
        <n-input v-model:value="formParams.displayName" placeholder="请输入展示名称" />
      </n-form-item>
      <n-form-item label="数据库字段名称" path="name">
        <n-input v-model:value="formParams.name" placeholder="请输入数据库字段名称" />
      </n-form-item>
      <n-form-item label="描述信息">
        <n-input v-model="formParams.description" placeholder="请输入描述" />
      </n-form-item>

      <n-form-item v-if="hasDefaultValue(selectField?.type)" label="默认值">
        <n-input-number
          v-if="selectField?.type === 'Number'"
          v-model="formParams.defaultValue"
          placeholder="请输入默认值"
        />
        <n-switch
          v-else-if="selectField?.type === 'Boolean'"
          v-model:value="formParams.defaultValue"
        />
        <n-date-picker
          v-else-if="selectField?.type === 'Date' || selectField?.type === 'DateTime'"
          v-model:value="formParams.defaultValue"
          :type="selectField?.type === 'Date' ? 'date' : 'datetime'"
          placeholder="请输入默认值"
        />
        <n-input v-else v-model:value="formParams.defaultValue" placeholder="请输入默认值" />
      </n-form-item>

      <SpecificFormItem
        :type="selectField?.type"
        :options="{
          formValue: formParams as any,
          schemas: allSchemas,
          selectField: selectField,
          fieldAction: 'create',
          connectSchema: {} as Schema,
        }"
      />

      <n-form-item label="是否必须" path="isRequired">
        <n-switch v-model:value="formParams.isRequired" />
      </n-form-item>
      <n-form-item label="是否隐藏" path="isHidden">
        <n-switch v-model:value="formParams.isHidden" />
      </n-form-item>
      <n-form-item
        label="是否搜索项"
        path="isSearch"
        :hidden="
          [
            'String',
            'MultiLineString',
            'Number',
            'Boolean',
            'Email',
            'Tel',
            'Url',
            'RichText',
            'Markdown',
            'Enum',
          ].indexOf(selectField?.type) === -1
        "
      >
        <n-switch v-model:value="formParams.isSearch" />
      </n-form-item>
      <n-form-item label="设为排序字段" path="isOrderField">
        <n-grid :x-gap="12" :cols="2">
          <n-grid-item>
            <n-switch v-model:value="formParams.isOrderField" />
          </n-grid-item>
          <n-grid-item>
            <n-select
              v-if="formParams.isOrderField"
              v-model:value="formParams.orderDirection"
              placeholder="请选择排序字段类型"
              size="small"
              :options="[
                { label: '升序', value: 'asc' },
                { label: '降序', value: 'desc' },
              ]"
            />
          </n-grid-item>
        </n-grid>
      </n-form-item>
    </n-form>
    <template #action>
      <n-space>
        <n-button @click="handleClose()">取消</n-button>
        <n-button type="info" :loading="formBtnLoading" @click="confirmForm">确定</n-button>
      </n-space>
    </template>
  </n-modal>
</template>
