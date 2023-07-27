<script setup lang="ts">
  import { computed, toRefs } from 'vue';
  import { useMessage } from 'naive-ui';
  import { logger } from '@/utils/Logger';

  const API_URL = import.meta.env.VITE_GLOB_LAF_URL;
  const message = useMessage();

  const props = defineProps<{
    currentApi: SchemaApi | undefined;
  }>();
  const { currentApi } = toRefs(props);
  const emit = defineEmits(['enableApi', 'enableApiItem', 'tokenApiItem', 'collapseApiItem']);

  const enable = computed(() => {
    if (currentApi.value) {
      return currentApi.value?.enable;
    }
    return false;
  });
  const title = computed(() => {
    if (currentApi.value) {
      return `${currentApi.value?.displayName}（${currentApi.value?.collectionName}）`;
    }
    return '';
  });

  const hasKey = (obj: Object) => {
    if (obj) {
      let count = 0;
      for (const _ in obj) {
        count++;
      }
      return count > 0;
    }
    return false;
  };

  const handleApiEnable = (value: boolean) => {
    emit('enableApi', value);
  };
  const handleApiItemEnable = (key: string, value: boolean) => {
    emit('enableApiItem', key, value);
  };
  const handleApiItemToken = (key: string, value: boolean) => {
    emit('tokenApiItem', key, value);
  };
  const handleApiItemCollapse = (key: string, value: boolean) => {
    emit('collapseApiItem', key, value);
  };
  const handleCopyText = (txt: string) => {
    navigator.clipboard
      .writeText(txt)
      .then(function () {
        message.info('已经复制');
      })
      .catch(function (err) {
        logger.error(err);
        message.info('复制失败');
      });
  };
</script>

<template>
  <n-card class="schema-api-box" :title="title">
    <template #header-extra>
      <n-tooltip v-if="currentApi" placement="top">
        <template #trigger>
          <n-switch size="large" :value="enable" @update:value="handleApiEnable">
            <template #checked>已开启</template>
            <template #unchecked>已关闭</template>
          </n-switch>
        </template>
        <span>启用</span>
      </n-tooltip>
    </template>

    <div v-if="currentApi" class="api-content">
      <n-card
        v-for="(api, key) in currentApi?.apis"
        :key="key"
        class="api-item"
        size="small"
        hoverable
      >
        <div>
          <div class="item-top">
            <span>{{ api.displayName }}</span>
            <div>
              <n-switch
                :value="api.enable"
                :disabled="!enable"
                size="small"
                :round="false"
                @update:value="handleApiItemEnable(key, !api.enable)"
              />
            </div>
          </div>
          <div class="item-tag">
            <p
              ><space class="item-tag-point">Url：</space
              ><n-tag @click="handleCopyText(API_URL + api.url)" type="info"
                >{{ API_URL }}{{ api.url }}</n-tag
              ></p
            >
          </div>

          <div class="item-tag">
            <p><space class="item-tag-point">验证Token：</space></p>
            <n-tooltip v-if="currentApi" placement="top">
              <template #trigger>
                <n-checkbox
                  :disabled="!enable || !api.tokenEdit"
                  :checked="api.token"
                  @update:checked="handleApiItemToken(key, !api.token)"
                />
              </template>
              <span>验证Token</span>
            </n-tooltip>
          </div>
          <div v-show="api.collapse">
            <div class="item-tag">
              <p
                ><space class="item-tag-point">Method：</space><space>{{ api.method }}</space></p
              >
            </div>

            <div v-if="hasKey(api.headers)" class="item-tag" style="justify-content: start"
              ><space class="item-tag-point">Headers：</space
              ><div class="item-tag-params"
                ><space v-for="(value, key) in api.headers" :key="key"
                  >{{ key }} ： {{ value }}</space
                ></div
              >
            </div>
            <div v-if="hasKey(api.params)" class="item-tag" style="justify-content: start"
              ><space class="item-tag-point">Params：</space
              ><div class="item-tag-params"
                ><space v-for="(value, key) in api.params" :key="key"
                  >{{ key }} ： {{ value }}</space
                ></div
              >
            </div>

            <div v-show="hasKey(api.body)" class="item-tag" style="justify-content: start"
              ><space class="item-tag-point">Body：</space
              ><div class="item-tag-params"
                ><space v-for="(value, key) in api.body" :key="key"
                  >{{ key }} ： {{ value }}</space
                ></div
              >
            </div>
          </div>
          <div class="item-bottom">
            <n-button
              type="primary"
              class="mr-2"
              text
              @click="handleApiItemCollapse(key, !api.collapse)"
              >{{ api.collapse ? '收起' : '展开' }}
            </n-button>
          </div>
        </div>
      </n-card>
    </div>
    <div v-else class="flex justify-center items-center h-40">
      <n-empty description="请选择" />
    </div>
  </n-card>
</template>

<style lang="less" scoped>
  .n-card__content {
    padding: 0;
  }
  .schema-api-box {
    width: 800px;
    border: none;
    overflow: hidden;
    overflow-y: scroll;

    .api-item {
      // cursor: pointer;
      margin-bottom: 10px;
      position: relative;

      .item-top {
        font-size: 16px;
        font-weight: bold;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
      }
      .item-bottom {
        font-size: 12px;
        display: flex;
        justify-content: right;
        margin-top: 8px;
      }

      .item-tag {
        padding: 0 8px 4px 8px;
        margin-top: 6px;
        font-size: 14px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        border-style: dashed;
        border-bottom-width: 1px;
      }

      .item-tag-point {
        display: inline-block;
        width: 80px;
      }
      .item-tag-params {
        display: flex;
        flex-direction: column;
      }
    }
  }
</style>
