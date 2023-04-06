<template>
  <div>
    <div class="n-layout-page-header">
      <n-card :bordered="false">
        <div class="flex">
          <img
            :src="productInfo.image"
            @click="handlePreview(productInfo)"
            style="width: 200px; margin-right: 50px"
            alt=""
          />
          <div style="font-size: 18px">
            <div style="margin-bottom: 20px">花型：{{ productInfo.productNumber }}</div>
            <div>备注：{{ productInfo.remark }}</div>
          </div>
        </div>
      </n-card>
    </div>
    <n-card
      :bordered="false"
      class="mt-5 mb-10 proCard"
      size="small"
      :segmented="{ content: true }"
    >
      <BasicTable
        :columns="columns"
        :request="loadDataTable"
        :row-key="(row) => row._id"
        ref="actionRef"
        :actionColumn="actionColumn"
        :scroll-x="1090"
        :max-height="1000"
        :pagination="false"
      >
        <template #tableTitle>
          <n-button type="primary" @click="addTable">
            <template #icon>
              <n-icon>
                <PlusOutlined />
              </n-icon>
            </template>
            增加版型
          </n-button>
        </template>
      </BasicTable>
    </n-card>

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
        <n-form-item label="型号" path="modelNumber">
          <n-input placeholder="请输入名称" v-model:value="formParams.modelNumber" />
        </n-form-item>
        <n-form-item label="供应商" path="supplierId">
          <n-select
            placeholder="请选择供应商"
            v-model:value="formParams.supplierId"
            :options="suppliers"
          />
        </n-form-item>
        <n-form-item label="货号" path="goodsNumber">
          <n-input placeholder="请输入货号" v-model:value="formParams.goodsNumber" />
        </n-form-item>
        <n-form-item label="花宽" path="width">
          <n-input-number placeholder="请输入花宽" v-model:value="formParams.width" />
        </n-form-item>
        <n-form-item label="花高" path="height">
          <n-input-number placeholder="请输入花高" v-model:value="formParams.height" />
        </n-form-item>
        <n-form-item label="出码率" path="rate">
          <n-input-number placeholder="请输入出码率" v-model:value="formParams.rate" />
        </n-form-item>
        <n-form-item label="码重" path="weight">
          <n-input-number placeholder="请输入码重" v-model:value="formParams.weight" />
        </n-form-item>
        <n-form-item label="价格" path="price">
          <n-input-number placeholder="请输入价格" v-model:value="formParams.price" />
        </n-form-item>
        <n-form-item label="备注" path="remark">
          <n-input type="textarea" placeholder="请输入备注" v-model:value="formParams.remark" />
        </n-form-item>
      </n-form>

      <template #action>
        <n-space>
          <n-button @click="() => (showModal = false)">取消</n-button>
          <n-button type="info" :loading="formBtnLoading" @click="confirmForm">确定</n-button>
        </n-space>
      </template>
    </n-modal>

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
  </div>
</template>

<script setup lang="ts">
  import { h, onMounted, reactive, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { useMessage } from 'naive-ui';
  import { PlusOutlined } from '@vicons/antd';

  import { BasicTable, TableAction } from '@/components/Table';
  import { getModelsByProduct, createModel, updateModel, deleteModel } from '@/api/model';
  import { getProduct } from '@/api/product';
  import { getAllSuppliers } from '@/api/supplier';
  import { columns } from './modelColumns';

  const message = useMessage();
  const route = useRoute();
  const productId = route.params.id as string;
  const productInfo = reactive({
    _id: '',
    productNumber: '',
    remark: '',
    image: '',
  });
  const actionRef = ref();
  const formRef: any = ref(null);
  const showModal = ref(false);
  const modalType = ref('create');
  const formBtnLoading = ref(false);
  const formParams = reactive<{
    _id?: string | null;
    supplierId: string;
    supplierName: string;
    modelNumber: string;
    width: number | null;
    height: number | null;
    rate: number | null;
    weight: number | null;
    price: number | null;
    goodsNumber: string;
    remark: string;
  }>({
    _id: null,
    supplierId: '',
    supplierName: '',
    modelNumber: '',
    width: null,
    height: null,
    rate: null,
    weight: null,
    price: null,
    goodsNumber: '',
    remark: '',
  });
  const rules = {
    supplierId: [{ required: true, message: '请选择供应商' }],
    modelNumber: [{ required: true, message: '请输入型号' }],
    width: [{ required: true, message: '请输入花宽' }],
    height: [{ required: true, message: '请输入花高' }],
    rate: [{ required: true, message: '请输入出码率' }],
    weight: [{ required: true, message: '请输入码重' }],
    price: [{ required: true, message: '请输入价格' }],
    goodsNumber: [{ required: true, message: '请输入货号' }],
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

  const getProductInfo = async () => {
    const res = await getProduct(productId);

    productInfo._id = res._id;
    productInfo.productNumber = res.productNumber;
    productInfo.remark = res.remark;
    productInfo.image = res.image;
  };

  const showPreviewModal = ref(false);
  const previewImage = ref('');
  const handlePreview = (row) => {
    showPreviewModal.value = true;
    previewImage.value = row.image;
  };

  const suppliers = reactive<
    {
      value: string;
      label: string;
    }[]
  >([]);

  const getSuppliers = async () => {
    const res = await getAllSuppliers();

    suppliers.splice(0, suppliers.length, ...res);
  };

  onMounted(() => {
    getProductInfo();
    getSuppliers();
  });

  const loadDataTable = async () => {
    const ret = await getModelsByProduct({ productId });
    return { list: ret };
  };

  function addTable() {
    showModal.value = true;
    modalType.value = 'create';
  }

  function handleEdit(record: Recordable) {
    console.log('点击了编辑', record);
    showModal.value = true;
    modalType.value = 'edit';
    formParams._id = record._id;
    formParams.supplierId = record.supplierId;
    formParams.modelNumber = record.modelNumber;
    formParams.width = record.width;
    formParams.height = record.height;
    formParams.rate = record.rate;
    formParams.price = record.price;
    formParams.weight = record.weight;
    formParams.goodsNumber = record.goodsNumber;
    formParams.remark = record.remark;
  }

  async function handleDelete(record: Recordable) {
    await deleteModel(record._id);

    message.success('删除成功');
    reloadTable();
  }

  function reloadTable() {
    actionRef.value.reload();
  }

  const resetFormParams = () => {
    console.log('resetFormParams');
    formParams._id = null;
    formParams.modelNumber = '';
    formParams.supplierId = '';
    formParams.width = null;
    formParams.height = null;
    formParams.rate = null;
    formParams.weight = null;
    formParams.price = null;
    formParams.goodsNumber = '';
    formParams.remark = '';
  };

  function confirmForm(e) {
    e.preventDefault();
    formBtnLoading.value = true;
    formRef.value.validate(async (errors) => {
      if (!errors) {
        const supplierName = suppliers.find((item) => item.value === formParams.supplierId)?.label;
        if (modalType.value === 'create') {
          await createModel({
            ...formParams,
            supplierName,
            productId,
          });
        } else {
          await updateModel({
            ...formParams,
            supplierName,
            productId,
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
</script>

<style lang="less" scoped></style>
