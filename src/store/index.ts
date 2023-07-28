import type { App } from 'vue';
import { createPinia } from 'pinia';
import { useSystemSettingStoreWidthOut } from '@/store/modules/setting';

const store = createPinia();

export function setupStore(app: App<Element>) {
  app.use(store);
}

export async function loadFirstStore() {
  const systemSettingStore = useSystemSettingStoreWidthOut();
  await systemSettingStore.getSystemEmail();
  await systemSettingStore.getSystemSettings();
}

export { store };
