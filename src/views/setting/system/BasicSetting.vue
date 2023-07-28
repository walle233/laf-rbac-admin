<template>
  <n-grid cols="1 s:1.5 m:2 l:2 xl:2 2xl:2" responsive="screen">
    <n-grid-item>
      <n-form :label-width="80" :model="formParams" :rules="rules" ref="formRef">
        <n-form-item label="网站名称" path="name">
          <n-input v-model:value="formParams.name" placeholder="请输入网站名称" />
        </n-form-item>

        <n-form-item label="网站Logo" path="logo">
          <BasicUpload
            :width="120"
            :height="120"
            :maxNumber="1"
            :custom-request="uploadLogo"
            v-model:value="formParams.logo"
            helpText="单个文件不超过2M，支持jpg、png格式"
          />
        </n-form-item>

        <n-form-item label="备案编号" path="icpCode">
          <n-input placeholder="请输入备案编号" v-model:value="formParams.icpCode" />
        </n-form-item>

        <n-form-item label="联系电话" path="mobile">
          <n-input placeholder="请输入联系电话" v-model:value="formParams.mobile" />
        </n-form-item>

        <n-form-item label="联系地址" path="address">
          <n-input
            v-model:value="formParams.address"
            type="textarea"
            placeholder="请输入联系地址"
          />
        </n-form-item>

        <n-form-item label="登录验证码" path="loginCode">
          <n-radio-group v-model:value="formParams.loginCode" name="loginCode">
            <n-space>
              <n-radio :value="1">开启</n-radio>
              <n-radio :value="0">关闭</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>

        <n-form-item label="网站开启访问" path="systemOpen">
          <n-switch
            size="large"
            v-model:value="formParams.systemOpen"
            @update:value="systemOpenChange"
          />
        </n-form-item>

        <n-form-item label="网站关闭提示" path="closeText">
          <n-input
            v-model:value="formParams.closeText"
            type="textarea"
            placeholder="请输入网站关闭提示"
          />
        </n-form-item>

        <div>
          <n-space>
            <n-button type="primary" @click="handleSubmit">更新基本信息</n-button>
          </n-space>
        </div>
      </n-form>
    </n-grid-item>
  </n-grid>
</template>

<script lang="ts" setup>
  import { defineComponent, reactive, ref, toRefs } from 'vue';
  import { UploadCustomRequestOptions, useDialog, useMessage } from 'naive-ui';
  import { uploadFile } from '@/api/cloud';
  import { logger } from '@/utils/Logger';
  import { storeToRefs } from 'pinia';
  import { useSystemSettingStoreWidthOut } from '@/store/modules/setting';

  const { settings } = storeToRefs(useSystemSettingStoreWidthOut());

  const message = useMessage();
  const dialog = useDialog();

  const formRef: any = ref(null);
  const formParams = reactive<SystemSetting>({
    name: settings.value.name,
    logo: [settings.value.logo],
    icpCode: settings.value.icpCode,
    mobile: settings.value.mobile,
    address: settings.value.address,
    loginCode: settings.value.loginCode,
    systemOpen: settings.value.systemOpen,
    closeText: settings.value.closeText,
  });

  const rules = {
    name: {
      required: true,
      message: '请输入网站名称',
      trigger: 'blur',
    },
    logo: {
      required: true,
      message: '请上传网站Logo',
      trigger: 'Array<string>',
      validator: (rule, value) => {
        if (value.length <= 0) {
          return false;
        }
        return true;
      },
    },
  };

  async function uploadLogo(options: UploadCustomRequestOptions) {
    const { file } = options;
    const { url } = await uploadFile(file?.file as File);
    formParams.logo = [url];
  }

  async function systemOpenChange(value) {
    if (!value) {
      dialog.warning({
        title: '提示',
        content: '您确定要关闭系统访问吗？该操作立马生效，请慎重操作！',
        positiveText: '确定',
        negativeText: '取消',
        onPositiveClick: () => {
          message.success('操作成功');
        },
        onNegativeClick: () => {
          formParams.systemOpen = true;
        },
      });
    }
  }

  function handleSubmit() {
    formRef.value.validate((errors) => {
      if (!errors) {
        useSystemSettingStoreWidthOut().updateSystemSetting({
          name: formParams.name,
          logo: formParams.logo[0],
          icpCode: formParams.icpCode,
          mobile: formParams.mobile,
          address: formParams.address,
          loginCode: formParams.loginCode,
          systemOpen: formParams.systemOpen,
          closeText: formParams.closeText,
        });
        useSystemSettingStoreWidthOut()
          .save('basic')
          .then((success) => {
            if (success) {
              message.success('保存成功');
            } else {
              message.success('保存失败');
            }
          });
      } else {
        message.error('验证失败，请填写完整信息');
      }
    });
  }
</script>
