<template>
  <n-grid cols="1 s:1.5 m:2 l:2 xl:2 2xl:2" responsive="screen">
    <n-grid-item>
      <n-form :label-width="120" :model="formParams" :rules="rules" ref="formRef">
        <n-form-item label="发件人邮箱" path="emailAddr">
          <n-input v-model:value="formParams.emailAddr" placeholder="请输入发件人邮箱" />
        </n-form-item>

        <n-form-item label="SMTP服务器地址">
          <n-input v-model:value="formParams.smtpAddr" placeholder="请输入SMTP服务器地址" />
        </n-form-item>

        <n-form-item label="SMTP服务器端口">
          <n-input v-model:value="formParams.smtpPort" placeholder="请输入SMTP服务器端口" />
        </n-form-item>

        <n-form-item label="SMTP用户名">
          <n-input v-model:value="formParams.smtpName" placeholder="请输入SMTP用户名" />
        </n-form-item>

        <n-form-item label="SMTP密码">
          <n-input
            v-model:value="formParams.smtpPassword"
            type="password"
            placeholder="请输入SMTP密码"
          />
        </n-form-item>

        <n-form-item label="邮件测试">
          <n-button @click="handleTestEmail">邮件测试</n-button>
        </n-form-item>

        <div>
          <n-space>
            <n-button type="primary" @click="handleSubmit">更新邮件信息</n-button>
          </n-space>
        </div>
      </n-form>
    </n-grid-item>
  </n-grid>
</template>

<script lang="ts" setup>
  import { reactive, ref } from 'vue';
  import { useMessage } from 'naive-ui';
  import { storeToRefs } from 'pinia';
  import { useSystemSettingStoreWidthOut } from '@/store/modules/setting';
  const { emails } = storeToRefs(useSystemSettingStoreWidthOut());

  const message = useMessage();

  const formRef: any = ref(null);
  const formParams = reactive<SystemEmail>({
    emailAddr: emails.value.emailAddr,
    smtpAddr: emails.value.smtpAddr,
    smtpPort: emails.value.smtpPort,
    smtpName: emails.value.smtpName,
    smtpPassword: emails.value.smtpPassword,
  });

  const rules = {
    emailAddr: {
      required: true,
      trigger: ['blue', 'input'],
      validator: (rule, value) => {
        if (!value) {
          return new Error('请输入发件人邮箱');
        }
        return true;
      },
    },
  };

  function handleTestEmail() {
  }

  function handleSubmit() {
    formRef.value.validate((errors) => {
      if (!errors) {
        useSystemSettingStoreWidthOut().updateSystemEmail({
          emailAddr: formParams.emailAddr,
          smtpAddr: formParams.smtpAddr,
          smtpPort: formParams.smtpPort,
          smtpName: formParams.smtpName,
          smtpPassword: formParams.smtpPassword,
        });
        useSystemSettingStoreWidthOut()
          .save('email')
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
