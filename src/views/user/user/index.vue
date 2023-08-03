<template>
  <n-card :bordered="false" class="proCard">
    <BasicTable
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row) => row._id"
      ref="actionRef"
      :actionColumn="actionColumn"
      :scroll-x="1090"
    >
      <template #tableTitle>
        <n-button v-if="permissions.includes('user.create')" type="primary" @click="handleCreate">
          <template #icon>
            <n-icon>
              <PlusOutlined />
            </n-icon>
          </template>
          新增用户
        </n-button>
      </template>
    </BasicTable>

    <n-modal
      :closable="false"
      :show="resetModal"
      :show-icon="false"
      style="width: 480px"
      preset="dialog"
      :mask-closable="false"
      :on-after-leave="resetPasswordParams"
      title="重置密码"
    >
      <n-form
        :model="passwordParams"
        :rules="resetRules"
        ref="resetRef"
        label-placement="left"
        :label-width="80"
        class="py-4"
      >
        <n-form-item label="用户名" path="username">
          <n-input
            placeholder="请输入用户名"
            v-model:value="passwordParams.username"
            disabled="true"
          />
        </n-form-item>
        <n-form-item label="新密码" path="password">
          <n-input
            placeholder="请输入密码"
            v-model:value="passwordParams.password"
            type="password"
            show-password-on="mousedown"
          />
        </n-form-item>
      </n-form>
      <template #action>
        <n-space>
          <n-button @click="() => (resetModal = false)">取消</n-button>
          <n-button type="info" :loading="formBtnLoading" @click="resetPassword">重置</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal
      v-model:show="showModal"
      :show-icon="false"
      style="width: 600px"
      preset="dialog"
      :mask-closable="false"
      :on-after-leave="resetFormParams"
      :title="modalType === 'create' ? '新建' : '编辑'"
    >
      <n-form
        :model="formParams"
        :rules="modalType === 'create' ? createRules : editRules"
        ref="formRef"
        label-placement="left"
        :label-width="80"
        class="py-4"
      >
        <n-form-item label="用户名" path="username">
          <n-input placeholder="请输入用户名" v-model:value="formParams.username" />
        </n-form-item>
        <n-form-item label="昵称" path="nickname">
          <n-input placeholder="请输入昵称" v-model:value="formParams.nickname" />
        </n-form-item>
        <n-form-item v-if="modalType === 'create'" label="密码" path="password">
          <n-input
            placeholder="请输入密码"
            v-model:value="formParams.password"
            type="password"
            show-password-on="mousedown"
          />
        </n-form-item>
        <n-form-item label="头像" path="avatar">
          <BasicUpload
            :width="100"
            :height="100"
            :maxNumber="1"
            :custom-request="customRequest"
            v-model:value="formParams.avatar"
            helpText="单个文件不超过2M，支持jpg、png格式"
          />
        </n-form-item>

        <n-form-item label="手机号" path="phone">
          <n-input placeholder="请输入手机号码" v-model:value="formParams.phone" />
        </n-form-item>
        <n-form-item label="邮箱" path="email">
          <n-input placeholder="请输入邮箱地址" v-model:value="formParams.email" />
        </n-form-item>
      </n-form>
      <template #action>
        <n-space>
          <n-button @click="() => (showModal = false)">取消</n-button>
          <n-button type="info" :loading="formBtnLoading" @click="confirmForm">确定</n-button>
        </n-space>
      </template>
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { h, reactive, ref, onMounted } from 'vue';
  import { useMessage, UploadCustomRequestOptions, FormItemRule } from 'naive-ui';
  import { BasicTable, TableAction } from '@/components/Table';
  import {
    getUserList,
    createUser,
    deleteUser,
    updateUser,
    resetPasswordUser,
  } from '@/api/user/user';
  import { getAllRoles } from '@/api/system/role';
  import { uploadFile } from '@/api/cloud';
  import { columns } from './columns';
  import { PlusOutlined } from '@vicons/antd';

  import { useUserStoreWidthOut } from '@/store/modules/user';
  import { logger } from '@/utils/Logger';

  type TUser = {
    _id: string | null;
    username: string;
    nickname: string;
    password: string;
    avatar: string[];
    phone: string;
    email: string;
  };

  type TReset = {
    _id: string | null;
    username: string;
    password: string;
  };

  const userStore = useUserStoreWidthOut();
  const { permissions } = userStore;

  const allRoles = reactive<
    {
      value: string;
      label: string;
    }[]
  >([]);

  const getAllPermissionList = async () => {
    const res = await getAllRoles();

    allRoles.splice(0, allRoles.length, ...res.map((_) => ({ value: _.name, label: _.label })));
  };

  onMounted(() => {
    getAllPermissionList();
  });

  const actionRef = ref();
  const actionColumn = reactive({
    width: 220,
    title: '操作',
    key: 'action',
    fixed: 'right',
    render(record) {
      return h(TableAction as any, {
        style: 'button',
        actions: [
          {
            label: '删除',
            type: 'error',
            popConfirm: {
              title: '确定删除吗？',
              confirm: handleDelete.bind(null, record),
            },
            // 根据业务控制是否显示 isShow 和 auth 是并且关系
            ifShow: () => {
              return permissions.includes('admin.delete');
            },
          },
          {
            label: '编辑',
            onClick: handleEdit.bind(null, record),
            ifShow: () => {
              return permissions.includes('admin.edit');
            },
          },
        ],
        dropDownActions: [
          {
            label: '启用',
            key: 'enabled',
            // 根据业务控制是否显示: 非enable状态的不显示启用按钮
            ifShow: () => {
              return true;
            },
          },
          {
            label: '禁用',
            key: 'disabled',
            ifShow: () => {
              return true;
            },
          },
          {
            label: '重置密码',
            key: 'reset',
            ifShow: () => {
              return true;
            },
          },
        ],
        select: (key) => {
          if (key == 'reset') {
            resetModal.value = true;
            passwordParams._id = record._id;
            passwordParams.username = record.username;
          } else {
            message.info(`您点击了，${key} 按钮`);
          }
        },
      });
    },
  });

  const message = useMessage();
  const formRef: any = ref(null);
  const resetRef: any = ref(null);

  const resetRules = {
    username: {
      required: true,
      trigger: ['blur', 'input'],
      message: '请输入用户名',
    },
    password: {
      required: true,
      trigger: ['blur', 'input'],
      message: '请输入密码',
    },
  };

  const createRules = {
    username: {
      required: true,
      trigger: ['blur', 'input'],
      message: '请输入用户名',
    },
    nickname: {
      required: true,
      trigger: ['blur', 'input'],
      message: '请输入昵称',
    },
    password: {
      required: true,
      trigger: ['blur', 'input'],
      message: '请输入密码',
    },
    phone: {
      required: false,
      validator(rule: FormItemRule, value: string) {
        if (value != undefined && value != null && value != '') {
          if (!/^1[3456789]\d{9}$/.test(value)) {
            return new Error('请输入正确的手机号');
          }
        }
        return true;
      },
      trigger: ['blur', 'input'],
    },
    email: {
      validator(rule: FormItemRule, value: string) {
        if (value != undefined && value != null && value != '') {
          if (!/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(value)) {
            return new Error('请输入正确的邮箱地址');
          }
        }
        return true;
      },
      required: false,
      trigger: ['blur', 'input'],
    },
  };

  const editRules = {
    username: {
      required: true,
      trigger: ['blur', 'input'],
      message: '请输入用户名',
    },
    nickname: {
      required: true,
      trigger: ['blur', 'input'],
      message: '请输入昵称',
    },
    password: {
      required: true,
      trigger: ['blur', 'input'],
      message: '请输入密码',
    },
    phone: {
      required: false,
      validator(rule: FormItemRule, value: string) {
        if (value != undefined && value != null && value != '') {
          if (!/^1[3456789]\d{9}$/.test(value)) {
            return new Error('请输入正确的手机号');
          }
        }
        return true;
      },
      trigger: ['blur', 'input'],
    },
    email: {
      validator(rule: FormItemRule, value: string) {
        if (value != undefined && value != null && value != '') {
          if (!/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(value)) {
            return new Error('请输入正确的邮箱地址');
          }
        }
        return true;
      },
      required: false,
      trigger: ['blur', 'input'],
    },
  };

  const passwordParams = reactive<TReset>({
    _id: null,
    username: '',
    password: '',
  });
  const resetPasswordParams = () => {
    passwordParams._id = null;
    passwordParams.username = '';
    passwordParams.password = '';
  };

  function resetPassword() {
    formBtnLoading.value = true;
    console.log(resetRef.value);
    resetRef.value.validate(async (errors) => {
      if (!errors) {
        resetModal.value = false;
        message.success('重置成功');
        await resetPasswordUser(passwordParams);
        resetPasswordParams();
      } else {
        message.error('请填写完整信息');
      }
      formBtnLoading.value = false;
    });
  }

  const resetModal = ref(false);
  const showModal = ref(false);
  const modalType = ref('create');
  const formBtnLoading = ref(false);
  const formParams = reactive<TUser>({
    username: '',
    nickname: '',
    password: '',
    avatar: [],
    phone: '',
    email: '',
    _id: null,
  });
  const resetFormParams = () => {
    formParams._id = null;
    formParams.username = '';
    formParams.nickname = '';
    formParams.password = '';
    formParams.avatar = [];
    formParams.phone = '';
    formParams.email = '';
  };

  function confirmForm(e) {
    e.preventDefault();
    formBtnLoading.value = true;
    formRef.value.validate(async (errors) => {
      if (!errors) {
        if (modalType.value === 'create') {
          const { _id, ...createParams } = formParams;
          await createUser(createParams);
        } else {
          // eslint-disable-next-line no-unused-vars
          const { password, ...updateParams } = formParams;
          await updateUser(updateParams);
        }

        message.success(modalType.value === 'create' ? '创建成功' : '修改成功');
        showModal.value = false;
        reloadTable();
        resetFormParams();
      } else {
        message.error('请填写完整信息');
      }
      formBtnLoading.value = false;
    });
  }

  const loadDataTable = async (params) => {
    const ret = await getUserList(params);
    logger.log(ret);
    return ret;
  };

  async function customRequest(options: UploadCustomRequestOptions) {
    const { file } = options;
    const { url } = await uploadFile(file?.file as File);
    formParams.avatar = [url];
    logger.log(formParams.avatar);
  }

  function reloadTable() {
    actionRef.value.reload();
  }

  function handleCreate() {
    showModal.value = true;
    modalType.value = 'create';
  }

  function handleEdit(record: TUser) {
    showModal.value = true;
    modalType.value = 'edit';
    formParams.username = record.username;
    formParams.nickname = record.nickname;
    formParams.avatar = record.avatar;
    formParams.phone = record.phone;
    formParams.email = record.email;
    formParams._id = record._id;
  }

  async function handleDelete(record: TUser) {
    await deleteUser(record._id);

    message.success('删除成功');
    reloadTable();
  }
</script>

<style lang="less" scoped></style>
