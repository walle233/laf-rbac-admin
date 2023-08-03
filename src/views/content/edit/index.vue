<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicForm } from '@/components/Form/index';
  import { useMessage } from 'naive-ui';
  import { useRouter, useRoute } from 'vue-router';
  import { getSchema } from '@/api/cms/schema';
  import { getContent, createContent, updateContent, getAllContents } from '@/api/cms/content';
  import { onMounted } from 'vue';
  import { logger } from '@/utils/Logger';

  const { schemaId, contentId } = useRoute().params;
  const router = useRouter();
  const routerName = router.currentRoute.value.name;
  logger.log(routerName, schemaId, contentId);

  const schemaInfo = ref<any>({});
  const contentInfo = ref<any>({});

  onMounted(async () => {
    if (routerName === 'ContentEdit') {
      await getContentInfo();
    }

    await getSchemaInfo();
  });

  const formSchemas = ref<any[]>([]);
  const getSchemaInfo = async () => {
    const res = await getSchema(schemaId);

    schemaInfo.value = res;
    formSchemas.value = await getFormSchemas();
  };

  const getContentInfo = async () => {
    const res = await getContent({ schemaId, _id: contentId });

    contentInfo.value = res;
  };

  const getConnectResourceContents = async (connectResource) => {
    const res = await getAllContents(connectResource);

    return res;
  };

  // type SchemaFieldType =
  // | 'String'
  // | 'MultiLineString'
  // | 'Number'
  // | 'Boolean'
  // | 'DateTime'
  // | 'Date'
  // | 'File'
  // | 'Image'
  // | 'Media'
  // | 'Email'
  // | 'Tel'
  // | 'Url'
  // | 'RichText'
  // | 'Markdown'
  // | 'Connect'
  // | 'Array'
  // | 'Enum'
  // | 'Object';

  const getComponentByType = (type: SchemaFieldType) => {
    switch (type) {
      case 'String':
        return 'NInput';
      case 'MultiLineString':
        return 'NInputTextArea';
      case 'Number':
        return 'NInputNumber';
      case 'Boolean':
        return 'NSwitch';
      case 'Date':
        return 'NDatePicker';
      case 'DateTime':
        return 'NDateTimePicker';
      case 'RichText':
        return 'NRichText';
      case 'Markdown':
        return 'NMarkdown';
      case 'Image':
      case 'Media':
      case 'File':
        return 'NUpload';
      case 'Email':
        return 'NInputEmail';
      case 'Tel':
        return 'NInputMobile';
      case 'Url':
        return 'NInputUrl';
      // case 'Array':
      //   return 'NInput';
      case 'Object':
        return 'NInput';
      case 'Enum':
        return 'NSelect';
      case 'Connect':
        return 'NSelect';
      default:
        return 'NInput';
    }
  };

  const getFormSchemas = async () => {
    for (const item of schemaInfo.value.fields) {
      if (item.type === 'Connect') {
        const connectResourceContents = await getConnectResourceContents(item.connectResource);

        item.options = connectResourceContents.map((_) => ({
          label: _[item.connectField],
          value: _._id,
        }));
      }
      if (item.type === 'Enum') {
        item.options = item.enumElements;
      }
    }

    const schemas = schemaInfo.value.fields
      .filter((item) => !item.isSystem)
      .map((item: any) => {
        const component = getComponentByType(item.type);
        const isMultiple = item.type === 'Array';

        const componentProps = {
          // placeholder: '请输入' + item.displayName,
          multiple: isMultiple,
          options: item.options,
          clearable: !item.isRequired,
          multipleLimit: 0,
          onSearch: () => {},
          onSelect: () => {},
          onClear: () => {},
        };

        return {
          field: item.name,
          component,
          label: item.displayName,
          type: item.type,
          defaultValue:
            routerName === 'ContentEdit' ? contentInfo.value[item.name] : item.defaultValue,
          componentProps,
          rules: [{ required: item.isRequired, message: '需要' + item.displayName }],
        };
      });

    return schemas;
  };

  const message = useMessage();

  async function handleSubmit(values) {
    if (routerName === 'ContentEdit') {
      logger.log('编辑');
      await updateContent({ schemaId, _id: contentId, params: values });
    } else {
      logger.log('创建');
      await createContent({ schemaId, params: values });
    }

    message.success('创建成功');

    router.push({ path: `/content/${schemaId}` });
  }

  function handleReset(values) {
    logger.log(values);
    router.push({ path: `/content/${schemaId}` });
  }
</script>

<template>
  <div>
    <div class="n-layout-page-header">
      <n-card
        :bordered="false"
        :title="
          (routerName === 'ContentCreate' ? '创建' : '更新') +
          '【' +
          schemaInfo.displayName +
          '】' +
          '内容'
        "
      />
    </div>
    <n-card :bordered="false" class="mt-4 proCard">
      <div class="BasicForm">
        <BasicForm
          submitButtonText="提交"
          resetButtonText="取消"
          layout="horizontal"
          :gridProps="{ cols: 1 }"
          :schemas="formSchemas"
          @handleSubmit="handleSubmit"
          @reset="handleReset"
        >
          <template #statusSlot="{ model, field }">
            <n-input v-model:value="model[field]" />
          </template>
        </BasicForm>
      </div>
    </n-card>
  </div>
</template>

<style lang="less" scoped>
  .BasicForm {
    width: 700px;
    margin: 0 auto;
    overflow: hidden;
    padding-top: 20px;
  }
</style>
