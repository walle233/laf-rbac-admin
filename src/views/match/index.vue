<template>
  <n-card :bordered="false" class="proCard">
    <BasicForm
      @register="register"
      :showAdvancedButton="true"
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
      :scroll-x="1090"
    >
      <template #tableTitle>
        <n-button type="primary" @click="addTable">
          <template #icon>
            <n-icon>
              <PlusOutlined />
            </n-icon>
          </template>
          新增找版记录
        </n-button>
      </template>
    </BasicTable>

    <n-modal
      v-model:show="showModal"
      :show-icon="false"
      :show="false"
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
        <n-form-item label="客户" path="customerId">
          <n-select
            placeholder="请选择客户"
            v-model:value="formParams.customerId"
            :options="customerList"
            label-field="companyName"
            value-field="_id"
            :on-update:value="handleCustomerChange"
          />
        </n-form-item>
        <n-form-item v-show="formParams.customerId" label="客户联系人" path="customerContact">
          <n-select
            placeholder="请选择客户联系人"
            v-model:value="formParams.customerContact"
            :options="contactList"
          />
        </n-form-item>

        <n-form-item label="版型" path="modelId">
          <n-select
            placeholder="请选择版型"
            filterable
            v-model:value="formParams.modelId"
            :loading="searchLoading"
            :options="modelList"
            label-field="modelNumber"
            value-field="_id"
            remote
            @search="handleSearchModel"
            :on-update:value="handleChangeModel"
          />
        </n-form-item>

        <template v-if="formParams.modelId">
          <n-form-item label="供应商" path="supplierName">
            <n-input v-model:value="formParams.supplierName" disabled />
          </n-form-item>
          <n-form-item label="货号" path="goodsNumber">
            <n-input placeholder="请输入货号" v-model:value="formParams.goodsNumber" disabled />
          </n-form-item>
          <n-form-item label="花宽" path="width">
            <n-input-number placeholder="请输入花宽" v-model:value="formParams.width" disabled />
          </n-form-item>
          <n-form-item label="花高" path="height">
            <n-input-number placeholder="请输入花高" v-model:value="formParams.height" disabled />
          </n-form-item>
          <n-form-item label="出码率" path="rate">
            <n-input-number placeholder="请输入出码率" v-model:value="formParams.rate" disabled />
          </n-form-item>
          <n-form-item label="码重" path="weight">
            <n-input-number placeholder="请输入码重" v-model:value="formParams.weight" disabled />
          </n-form-item>
          <n-form-item label="价格" path="price">
            <n-input-number placeholder="请输入价格" v-model:value="formParams.price" disabled />
          </n-form-item>
        </template>
        <n-form-item label="备注" path="remark">
          <n-input placeholder="请输入备注" v-model:value="formParams.remark" />
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
  import { useMessage } from 'naive-ui';
  import { useDebounceFn } from '@vueuse/core';

  import { BasicTable, TableAction } from '@/components/Table';
  import { BasicForm, FormSchema, useForm } from '@/components/Form/index';
  import { getMatchers, createMatcher } from '@/api/match';
  import { searchModel } from '@/api/model';
  import { getAllCustomers } from '@/api/customer';
  import { getAllSuppliers } from '@/api/supplier';
  import { columns } from './columns';
  import { PlusOutlined } from '@vicons/antd';

  const rules = {
    customerId: [{ required: true, message: '请选择客户' }],
    modelId: [{ required: true, message: '请选择版型' }],
  };

  const formRef: any = ref(null);
  const message = useMessage();
  const actionRef = ref();

  const showModal = ref(false);
  const modalType = ref('create');
  const formBtnLoading = ref(false);
  const formParams = reactive({
    customerId: '',
    customerContact: '',
    customerName: '',
    modelId: '',
    modelNumber: '',
    supplierId: '',
    supplierName: '',
    goodsNumber: '',
    width: '',
    height: '',
    rate: '',
    weight: '',
    price: '',
    remark: '',
  });

  const resetFormParams = () => {
    console.log('resetFormParams');
    formParams.customerId = '';
    formParams.modelId = '';
  };

  const customerList = reactive<
    {
      _id: string;
      companyName: string;
      contacts?: any[];
    }[]
  >([]);
  const getCustomers = async () => {
    const res = await getAllCustomers();
    customerList.splice(0, customerList.length, ...res);
  };

  onMounted(() => {
    getCustomers();
    getSuppliers();
  });

  const supplierList = reactive<
    {
      _id: string;
      companyName: string;
    }[]
  >([]);
  const getSuppliers = async () => {
    const res = await getAllSuppliers();

    supplierList.splice(0, supplierList.length, ...res);
  };

  const modelList = reactive<any[]>([]);
  const searchLoading = ref(false);
  const handleSearchModel = useDebounceFn(async (value: string) => {
    searchLoading.value = true;
    const res = await searchModel({
      modelNumber: value,
    });

    searchLoading.value = false;
    modelList.splice(0, modelList.length, ...res);
    console.log('modelList', res, modelList);
  }, 1000);

  const handleChangeModel = (value: string) => {
    formParams.modelId = value;
    const currentModel = modelList.find((item) => item._id === value);
    if (currentModel) {
      formParams.modelNumber = currentModel.modelNumber;
      formParams.supplierId = currentModel.supplierId;
      formParams.supplierName = currentModel.supplierName;
      formParams.goodsNumber = currentModel.goodsNumber;
      formParams.width = currentModel.width;
      formParams.height = currentModel.height;
      formParams.rate = currentModel.rate;
      formParams.weight = currentModel.weight;
      formParams.price = currentModel.price;
    }
  };

  const contactList = reactive<any[]>([]);
  const handleCustomerChange = (value: string) => {
    console.log('handleCustomerChange', value);
    formParams.customerId = value;
    const currentCustomer = customerList.find((item) => item._id === value);
    formParams.customerName = currentCustomer?.companyName || '';
    const contacts =
      currentCustomer?.contacts?.map((item) => {
        return {
          ...item,
          label: `${item.name}(${item.tel})`,
          value: `${item.name}(${item.tel})`,
        };
      }) || [];
    formParams.customerContact = '';
    contactList.splice(0, contactList.length, ...contacts);
  };

  const schemas: FormSchema[] = [
    {
      field: 'modelNumber',
      component: 'NInput',
      label: '型号',
      componentProps: {
        placeholder: '请输入型号',
      },
    },
    {
      field: 'customerId',
      component: 'NSelect',
      label: '客户',
      componentProps: {
        placeholder: '请选择客户',
        options: customerList,
        valueField: '_id',
        labelField: 'companyName',
      },
    },
    {
      field: 'supplierId',
      component: 'NSelect',
      label: '供应商',
      componentProps: {
        placeholder: '请选择供应商',
        options: supplierList,
      },
    },
    {
      field: 'goodsNumber',
      component: 'NInput',
      label: '货号',
      componentProps: {
        placeholder: '请输入货号',
      },
    },
    {
      field: 'width',
      component: 'NInputNumber',
      label: '花宽',
      componentProps: {
        placeholder: '请输入花宽',
      },
    },
    {
      field: 'height',
      component: 'NInputNumber',
      label: '花高',
      componentProps: {
        placeholder: '请输入花高',
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
    const ret = await getMatchers({ ...params, ...searchParams });
    return ret;
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
          await createMatcher(formParams);
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

  const searchParams = reactive<{
    modelNumber?: string;
    customerId?: string;
    supplierId?: string;
    goodsNumber?: string;
    width?: string;
    height?: string;
  }>({});
  function handleSubmit(values: Recordable) {
    console.log(values);
    searchParams.modelNumber = values.modelNumber;
    searchParams.customerId = values.customerId;
    searchParams.supplierId = values.supplierId;
    searchParams.goodsNumber = values.goodsNumber;
    searchParams.width = values.width;
    searchParams.height = values.height;
    reloadTable();
  }

  function handleReset(values: Recordable) {
    console.log(values);
  }
</script>

<style lang="less" scoped></style>
