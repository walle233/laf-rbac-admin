<template>
  <n-card :bordered="false" class="proCard">
    <BasicForm
      @register="register"
      :showAdvancedButton="false"
      submitButtonText="搜索"
      @submit="handleSubmit"
      @reset="handleReset"
    >
      <template #statusSlot="{ model, field }">
        <n-input v-model:value="model[field]" />
      </template>
    </BasicForm>

    <BasicTable
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row) => row._id"
      ref="actionRef"
      :actionColumn="actionColumn"
      :scroll-x="1090"
    >
      <template #tableTitle>
        <n-button type="primary" @click="addTable">
          <template #icon>
            <n-icon>
              <PlusOutlined />
            </n-icon>
          </template>
          新增花型
        </n-button>
      </template>
    </BasicTable>

    <n-modal
      v-model:show="showPreviewModal"
      :show-icon="false"
      preset="card"
      style="width: 800px"
      :mask-closable="true"
      :on-after-leave="() => (previewImage = '')"
      title="预览"
    >
      <img :src="previewImage" style="width: 100%" alt="图片" />
    </n-modal>

    <n-modal
      v-model:show="showModal"
      :show-icon="false"
      preset="dialog"
      :mask-closable="false"
      :on-after-leave="resetFormParams"
      :title="modalType === 'create' ? '新建' : '编辑'"
    >
      <n-form
        :model="formParams"
        :rules="rules"
        ref="formRef"
        label-placement="left"
        :label-width="80"
        class="py-4"
      >
        <n-form-item label="花型号" path="productNumber">
          <n-input placeholder="请输入花型号" v-model:value="formParams.productNumber" />
        </n-form-item>
        <n-form-item label="花型图片" path="image">
          <BasicUpload
            :width="100"
            :height="100"
            :custom-request="customRequest"
            @uploadChange="uploadChange"
            v-model:value="formParams.image"
            helpText="单个文件不超过2M，支持jpg、png格式"
          />
        </n-form-item>
        <n-form-item label="宽度" path="width">
          <n-input-number
            :show-button="false"
            placeholder="请输入宽度"
            v-model:value="formParams.width"
          />
        </n-form-item>
        <n-form-item label="备注" path="remark">
          <n-input type="textarea" placeholder="备注信息" v-model:value="formParams.remark" />
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
  import { useMessage, UploadCustomRequestOptions, NAvatar } from 'naive-ui';
  import { BasicTable, TableAction } from '@/components/Table';
  import { BasicForm, FormSchema, useForm } from '@/components/Form/index';
  import { BasicUpload } from '@/components/Upload';
  import { getProducts, createProduct, deleteProduct, updateProduct } from '@/api/product';
  import { getAllSuppliers } from '@/api/supplier';
  import { uploadFile } from '@/api/cloud';
  // import { columns } from './columns';
  import { PlusOutlined } from '@vicons/antd';
  import { useRouter } from 'vue-router';
  const columns = [
    {
      title: '花型编号',
      key: 'productNumber',
      width: 120,
    },
    {
      title: '图片',
      key: 'image',
      width: 100,
      render(row) {
        return h(NAvatar, {
          size: 60,
          src: row.image,
          onClick: handleImageClick.bind(this, row),
        });
      },
    },
    {
      title: '宽度',
      key: 'width',
      width: 100,
    },
    {
      title: '备注',
      key: 'remark',
      width: 120,
    },
  ];

  const previewImage = ref('');
  const showPreviewModal = ref(false);
  const handleImageClick = (row) => {
    showPreviewModal.value = true;
    previewImage.value = row.image;
  };
  const suppliers = reactive<
    {
      _id: string;
      name: string;
    }[]
  >([]);
  const getSuppliers = async () => {
    const res = await getAllSuppliers();
    suppliers.splice(0, suppliers.length, ...res);
  };

  onMounted(async () => {
    await getSuppliers();
  });

  function uploadChange(list: string[]) {
    console.log('uploadChange', list);
  }

  async function customRequest(options: UploadCustomRequestOptions) {
    console.log('customRequest', options);
    const { file } = options;
    const { url } = await uploadFile(file?.file as File);
    formParams.image = [url];
    console.log(formParams.image);
  }

  const rules = {
    productNumber: {
      required: true,
      trigger: ['blur', 'input'],
      message: '请输入花型号',
    },
    image: {
      required: true,
      type: 'array',
      trigger: 'change',
      message: '请上传花型图片',
    },
    width: {
      required: true,
      type: 'number',
      trigger: ['blur', 'input'],
      message: '请输入宽度',
    },
    remark: {
      required: false,
      trigger: ['blur', 'input'],
      message: '请输入备注',
    },
  };

  const router = useRouter();
  const formRef: any = ref(null);
  const message = useMessage();
  const actionRef = ref();

  const showModal = ref(false);
  const modalType = ref('create');
  const formBtnLoading = ref(false);
  const formParams = reactive<{
    productNumber: string;
    image: string[];
    width: number;
    remark: string;
    _id?: string | null;
  }>({
    productNumber: '',
    image: [],
    width: 0,
    remark: '',
    _id: null,
  });

  const resetFormParams = () => {
    console.log('resetFormParams');
    formParams.productNumber = '';
    formParams.image = [];
    formParams.width = 0;
    formParams.remark = '';
    formParams._id = null;
  };

  const actionColumn = reactive({
    width: 160,
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
            // icon: 'ic:outline-delete-outline',
            popConfirm: {
              title: '确定删除吗？',
              confirm: handleDelete.bind(null, record),
            },
            // 根据业务控制是否显示 isShow 和 auth 是并且关系
            ifShow: () => {
              return true;
            },
            // 根据权限控制是否显示: 有权限，会显示，支持多个
            // auth: ['basic_list'],
          },
          {
            label: '编辑',
            onClick: handleEdit.bind(null, record),
            ifShow: () => {
              return true;
            },
            // auth: ['basic_list'],
          },
          {
            label: '版型明细',
            onClick: handleGoDetail.bind(null, record),
            ifShow: () => {
              return true;
            },
            // auth: ['basic_list'],
          },
        ],
        dropDownActions: [
          // {
          //   label: '启用',
          //   key: 'enabled',
          //   // 根据业务控制是否显示: 非enable状态的不显示启用按钮
          //   ifShow: () => {
          //     return true;
          //   },
          // },
          // {
          //   label: '禁用',
          //   key: 'disabled',
          //   ifShow: () => {
          //     return true;
          //   },
          // },
        ],
        select: (key) => {
          message.info(`您点击了，${key} 按钮`);
        },
      });
    },
  });

  const schemas: FormSchema[] = [
    {
      field: 'productNumber',
      // labelMessage: '这是一个提示',
      component: 'NInput',
      label: '花型编号',
      componentProps: {
        placeholder: '请输入花型编号',
        onInput: (e: any) => {
          console.log(e);
        },
      },
    },
    {
      field: 'width',
      component: 'NInputNumber',
      label: '宽度',
      componentProps: {
        placeholder: '请输入宽度',
        showButton: false,
        onInput: (e: any) => {
          console.log(e);
        },
      },
    },
    {
      field: 'supplierId',
      component: 'NSelect',
      label: '供应商',
      componentProps: {
        placeholder: '请选择供应商',
        options: suppliers,
      },
    },
  ];

  const [register, {}] = useForm({
    gridProps: { cols: '1 s:1 m:2 l:3 xl:4 2xl:4' },
    labelWidth: 60,
    schemas,
  });

  function addTable() {
    showModal.value = true;
    modalType.value = 'create';
  }

  const loadDataTable = async (params) => {
    return await getProducts({ ...params, ...searchParams });
    // const list = await getTableList({ ...formParams, ...params.value, ...res });
  };

  function reloadTable() {
    actionRef.value.reload();
  }

  function confirmForm(e) {
    e.preventDefault();
    formBtnLoading.value = true;
    formRef.value.validate(async (errors) => {
      if (!errors) {
        if (modalType.value === 'create') {
          await createProduct({
            ...formParams,
            image: formParams.image[0],
          });
        } else {
          await updateProduct({
            ...formParams,
            image: formParams.image[0],
          });
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

  function handleEdit(record: Recordable) {
    console.log('点击了编辑', record);
    modalType.value = 'edit';
    formParams.productNumber = record.productNumber;
    formParams.image = [record.image];
    formParams.width = record.width;
    formParams.remark = record.remark;
    formParams._id = record._id;
    showModal.value = true;
    // router.push({ name: 'basic-info', params: { id: record.id } });
  }

  function handleGoDetail(record: Recordable) {
    console.log('点击了详情', record);
    router.push({ path: `/product/model/${record._id}` });
  }

  async function handleDelete(record: Recordable) {
    await deleteProduct(record._id);

    message.success('删除成功');
    reloadTable();
  }

  const searchParams = reactive<{
    productNumber?: string;
    width?: number;
    supplierId?: string;
  }>({});
  function handleSubmit(values: Recordable) {
    console.log(values);
    searchParams.productNumber = values.productNumber;
    searchParams.width = values.width;
    searchParams.supplierId = values.supplierId;
    reloadTable();
  }

  function handleReset(values: Recordable) {
    console.log(values);
    Reflect.deleteProperty(searchParams, 'productNumber');
    Reflect.deleteProperty(searchParams, 'width');
  }
</script>

<style lang="less" scoped></style>
