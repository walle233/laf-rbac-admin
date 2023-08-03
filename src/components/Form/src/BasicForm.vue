<template>
  <n-form v-bind="getBindValue" :model="formModel" ref="formElRef">
    <n-grid v-bind="getGrid">
      <n-gi v-bind="schema.giProps" v-for="schema in getSchema" :key="schema.field">
        <n-form-item :label="schema.label" :path="schema.field">
          <!--标签名右侧温馨提示-->
          <template #label v-if="schema.labelMessage">
            {{ schema.label }}
            <n-tooltip trigger="hover" :style="schema.labelMessageStyle">
              <template #trigger>
                <n-icon size="18" class="text-gray-400 cursor-pointer">
                  <QuestionCircleOutlined />
                </n-icon>
              </template>
              {{ schema.labelMessage }}
            </n-tooltip>
          </template>

          <!--判断插槽-->
          <template v-if="schema.slot">
            <slot
              :name="schema.slot"
              :model="formModel"
              :field="schema.field"
              :value="formModel[schema.field]"
            ></slot>
          </template>

          <!-- NInputTextArea -->
          <template v-else-if="schema.component === 'NInputTextArea'">
            <n-input
              type="textarea"
              v-model:value="formModel[schema.field]"
              :class="{ isFull: schema.isFull != false && getProps.isFull }"
            />
          </template>

          <!--NInputMobile-->
          <template v-else-if="schema.component === 'NInputMobile'">
            <n-input
              :input-props="{ type: 'tel' }"
              v-model:value="formModel[schema.field]"
              :class="{ isFull: schema.isFull != false && getProps.isFull }"
            />
          </template>

          <!--NInputPassword-->
          <template v-else-if="schema.component === 'NInputPassword'">
            <n-input
              :input-props="{ type: 'password' }"
              v-model:value="formModel[schema.field]"
              :class="{ isFull: schema.isFull != false && getProps.isFull }"
            />
          </template>

          <!--NInputEmail-->
          <template v-else-if="schema.component === 'NInputEmail'">
            <n-input
              :input-props="{ type: 'email' }"
              v-model:value="formModel[schema.field]"
              :class="{ isFull: schema.isFull != false && getProps.isFull }"
            />
          </template>

          <!--NInputUrl-->
          <template v-else-if="schema.component === 'NInputUrl'">
            <n-input
              :input-props="{ type: 'url' }"
              v-model:value="formModel[schema.field]"
              :class="{ isFull: schema.isFull != false && getProps.isFull }"
            />
          </template>

          <!--NCheckbox-->
          <template v-else-if="schema.component === 'NCheckbox'">
            <n-checkbox-group v-model:value="formModel[schema.field]">
              <n-space>
                <n-checkbox
                  v-for="item in schema.componentProps.options"
                  :key="item.value"
                  :value="item.value"
                  :label="item.label"
                />
              </n-space>
            </n-checkbox-group>
          </template>

          <!--NRadioGroup-->
          <template v-else-if="schema.component === 'NRadioGroup'">
            <n-radio-group v-model:value="formModel[schema.field]">
              <n-space>
                <n-radio
                  v-for="item in schema.componentProps.options"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </n-radio>
              </n-space>
            </n-radio-group>
          </template>

          <!--NSelect-->
          <template v-else-if="schema.component === 'NSelect'">
            <n-select
              v-model:value="formModel[schema.field]"
              :options="schema.componentProps.options"
              :class="{ isFull: schema.isFull != false && getProps.isFull }"
            />
          </template>

          <!--NSelectRemote-->
          <template v-else-if="schema.component === 'NSelectRemote'">
            <n-select
              v-model:value="formModel[schema.field]"
              :options="schema.componentProps.options"
              remote
              clearable
              @search="schema.componentProps.onSearch"
              :class="{ isFull: schema.isFull != false && getProps.isFull }"
            />
          </template>

          <!--NUploader-->
          <template v-else-if="schema.component === 'NUpload'">
            <n-upload
              directory-dnd
              :multiple="false"
              :custom-request="customRequest"
              :max="1"
              @finish="handleUploadFinish(schema.field)"
              @remove="handleUploadRemove(schema.field)"
            >
              <n-upload-dragger>
                <div style="margin-bottom: 12px">
                  <n-icon size="48" :depth="3">
                    <archive-icon />
                  </n-icon>
                </div>
                <n-text style="font-size: 16px"> 点击或者拖动文件到该区域来上传 </n-text>
              </n-upload-dragger>
            </n-upload>
          </template>

          <!--NDateTimePicker-->
          <template v-else-if="schema.component === 'NDateTimePicker'">
            <n-date-picker
              v-model:value="formModel[schema.field]"
              type="datetime"
              :class="{ isFull: schema.isFull != false && getProps.isFull }"
            />
          </template>

          <!--RichText-->
          <template v-else-if="schema.component === 'NRichText'">
            <Editor
              api-key="1ajuy5y0t0v2gw1x92nvkisgws4x5xqcbc9ql00zs1culc1t"
              v-model="formModel[schema.field]"
              :init="{
                plugins: 'lists link image table code help wordcount',
              }"
            />
          </template>

          <!--Markdown-->
          <template v-else-if="schema.component === 'NMarkdown'">
            <v-md-editor v-model="formModel[schema.field]" height="400px" />
          </template>

          <!--动态渲染表单组件-->
          <component
            v-else
            v-bind="getComponentProps(schema)"
            :is="schema.component"
            v-model:value="formModel[schema.field]"
            :class="{ isFull: schema.isFull != false && getProps.isFull }"
          />
          <!--组件后面的内容-->
          <template v-if="schema.suffix">
            <slot
              :name="schema.suffix"
              :model="formModel"
              :field="schema.field"
              :value="formModel[schema.field]"
            ></slot>
          </template>
        </n-form-item>
      </n-gi>
      <!--提交 重置 展开 收起 按钮-->
      <n-gi
        :span="isInline ? '' : 24"
        :suffix="isInline ? true : false"
        #="{ overflow }"
        v-if="getProps.showActionButtonGroup"
      >
        <n-space
          align="center"
          :justify="isInline ? 'end' : 'start'"
          :style="{ 'margin-left': `${isInline ? 12 : getProps.labelWidth}px` }"
        >
          <n-button
            v-if="getProps.showSubmitButton"
            v-bind="getSubmitBtnOptions"
            @click="handleSubmit"
            :loading="loadingSub"
            >{{ getProps.submitButtonText }}</n-button
          >
          <n-button
            v-if="getProps.showResetButton"
            v-bind="getResetBtnOptions"
            @click="resetFields"
            >{{ getProps.resetButtonText }}</n-button
          >
          <n-button
            type="primary"
            text
            icon-placement="right"
            v-if="isInline && getProps.showAdvancedButton"
            @click="unfoldToggle"
          >
            <template #icon>
              <n-icon size="14" class="unfold-icon" v-if="overflow">
                <DownOutlined />
              </n-icon>
              <n-icon size="14" class="unfold-icon" v-else>
                <UpOutlined />
              </n-icon>
            </template>
            {{ overflow ? '展开' : '收起' }}
          </n-button>
        </n-space>
      </n-gi>
    </n-grid>
  </n-form>
</template>

<script lang="ts">
  import { defineComponent, reactive, ref, computed, unref, onMounted, watch } from 'vue';
  import { createPlaceholderMessage } from './helper';
  import { useFormEvents } from './hooks/useFormEvents';
  import { useFormValues } from './hooks/useFormValues';

  import { basicProps } from './props';
  import { DownOutlined, UpOutlined, QuestionCircleOutlined } from '@vicons/antd';

  import type { Ref } from 'vue';
  import type { GridProps } from 'naive-ui/lib/grid';
  import type { FormSchema, FormProps, FormActionType } from './types/form';
  import Editor from '@tinymce/tinymce-vue';
  import { ArchiveOutline as ArchiveIcon } from '@vicons/ionicons5';

  import { isArray } from '@/utils/is/index';
  import { deepMerge } from '@/utils';
  import { uploadFile } from '@/api/cloud';
  import { UploadCustomRequestOptions } from 'naive-ui';
  import { Recordable } from 'vite-plugin-mock';

  export default defineComponent({
    name: 'BasicUpload',
    components: { DownOutlined, UpOutlined, QuestionCircleOutlined, Editor, ArchiveIcon },
    props: {
      ...basicProps,
    },
    emits: ['reset', 'handleSubmit', 'register'],
    setup(props, { emit, attrs }) {
      const defaultFormModel = ref<Recordable>({});
      const formModel = reactive<Recordable>({});
      const propsRef = ref<Partial<FormProps>>({});
      const schemaRef = ref<Nullable<FormSchema[]>>(null);
      const formElRef = ref<Nullable<FormActionType>>(null);
      const gridCollapsed = ref(true);
      const loadingSub = ref(false);
      const isUpdateDefaultRef = ref(false);

      const uploadFileUrl = ref('');
      async function customRequest(options: UploadCustomRequestOptions) {
        const { file, onFinish } = options;
        const { url } = await uploadFile(file?.file as File);
        uploadFileUrl.value = url;

        onFinish();
      }

      const handleUploadFinish = (res: any) => {
        formModel[res] = uploadFileUrl.value;
      };

      const handleUploadRemove = (res: any) => {
        formModel[res] = '';
      };

      const getSubmitBtnOptions = computed(() => {
        return Object.assign(
          {
            size: props.size,
            type: 'primary',
          },
          props.submitButtonOptions
        );
      });

      const getResetBtnOptions = computed(() => {
        return Object.assign(
          {
            size: props.size,
            type: 'default',
          },
          props.resetButtonOptions
        );
      });

      function getComponentProps(schema) {
        const compProps = schema.componentProps ?? {};
        const component = schema.component;
        return {
          clearable: true,
          placeholder: createPlaceholderMessage(unref(component)),
          ...compProps,
        };
      }

      const getProps = computed((): FormProps => {
        const formProps = { ...props, ...unref(propsRef) } as FormProps;
        const rulesObj: any = {
          rules: {},
        };
        const schemas: any = formProps.schemas || [];
        schemas.forEach((item) => {
          if (item.rules && isArray(item.rules)) {
            rulesObj.rules[item.field] = item.rules;
          }
        });
        return { ...formProps, ...unref(rulesObj) };
      });

      const isInline = computed(() => {
        const { layout } = unref(getProps);
        return layout === 'inline';
      });

      const getGrid = computed((): GridProps => {
        const { gridProps } = unref(getProps);
        return {
          ...gridProps,
          collapsed: isInline.value ? gridCollapsed.value : false,
          responsive: 'screen',
        };
      });

      const getBindValue = computed(
        () => ({ ...attrs, ...props, ...unref(getProps) } as Recordable)
      );

      const getSchema = computed((): FormSchema[] => {
        const schemas: FormSchema[] = unref(schemaRef) || (unref(getProps).schemas as any);
        for (const schema of schemas) {
          const { defaultValue } = schema;
          // handle date type
          // dateItemType.includes(component as string)
          if (defaultValue) {
            schema.defaultValue = defaultValue;
          }
        }
        return schemas as FormSchema[];
      });

      const { handleFormValues, initDefault } = useFormValues({
        defaultFormModel,
        getSchema,
        formModel,
      });

      const { handleSubmit, validate, resetFields, getFieldsValue, clearValidate, setFieldsValue } =
        useFormEvents({
          emit,
          getProps,
          formModel,
          getSchema,
          formElRef: formElRef as Ref<FormActionType>,
          defaultFormModel,
          loadingSub,
          handleFormValues,
        });

      function unfoldToggle() {
        gridCollapsed.value = !gridCollapsed.value;
      }

      async function setProps(formProps: Partial<FormProps>): Promise<void> {
        propsRef.value = deepMerge(unref(propsRef) || {}, formProps);
      }

      const formActionType: Partial<FormActionType> = {
        getFieldsValue,
        setFieldsValue,
        resetFields,
        validate,
        clearValidate,
        setProps,
        submit: handleSubmit,
      };

      watch(
        () => getSchema.value,
        (schema) => {
          if (unref(isUpdateDefaultRef)) {
            return;
          }
          if (schema?.length) {
            initDefault();
            isUpdateDefaultRef.value = true;
          }
        }
      );

      onMounted(() => {
        initDefault();
        emit('register', formActionType);
      });

      return {
        formElRef,
        formModel,
        getGrid,
        getProps,
        getBindValue,
        getSchema,
        getSubmitBtnOptions,
        getResetBtnOptions,
        handleSubmit,
        resetFields,
        loadingSub,
        isInline,
        getComponentProps,
        unfoldToggle,
        customRequest,
        handleUploadFinish,
        handleUploadRemove,
      };
    },
  });
</script>

<style lang="less" scoped>
  .isFull {
    width: 100%;
    justify-content: flex-start;
  }

  .unfold-icon {
    display: flex;
    align-items: center;
    height: 100%;
    margin-left: -3px;
  }
</style>
