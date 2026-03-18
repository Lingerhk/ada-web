import { createApp } from 'vue';
import pinia from '/@/stores/index';
import App from '/@/App.vue';
import router from '/@/router';
import { directive } from '/@/directive/index';
import { i18n } from '/@/i18n/index';
import other from '/@/utils/other';

import ElementPlus from 'element-plus';
import '/@/theme/index.scss';
import JsonViewer from 'vue3-json-viewer';
import 'vue3-json-viewer/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

const app = createApp(App);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
	app.component(key, component);
}

directive(app);
other.elSvg(app);

app.use(pinia).use(router).use(ElementPlus).use(i18n).use(JsonViewer).mount('#app');
