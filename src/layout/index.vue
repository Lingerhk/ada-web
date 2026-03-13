<template>
	<component :is="layouts[themeConfig.layout]" />
</template>

<script setup lang="ts" name="layout">
import { onBeforeMount, onUnmounted, defineAsyncComponent } from 'vue';
import { storeToRefs } from 'pinia';
import { useThemeConfig } from '/@/stores/themeConfig';
import { Local } from '/@/utils/storage';
import mittBus from '/@/utils/mitt';

// Import components
const layouts: any = {
	defaults: defineAsyncComponent(() => import('/@/layout/main/defaults.vue')),
	classic: defineAsyncComponent(() => import('/@/layout/main/classic.vue')),
	transverse: defineAsyncComponent(() => import('/@/layout/main/transverse.vue')),
	columns: defineAsyncComponent(() => import('/@/layout/main/columns.vue')),
};

// Define reactive state and refs
const storesThemeConfig = useThemeConfig();
const { themeConfig } = storeToRefs(storesThemeConfig);

// Handle window-size changes for mobile adaptation
const onLayoutResize = () => {
	if (!Local.get('oldLayout')) Local.set('oldLayout', themeConfig.value.layout);
	const clientWidth = document.body.clientWidth;
	if (clientWidth < 1000) {
		themeConfig.value.isCollapse = false;
		mittBus.emit('layoutMobileResize', {
			layout: 'defaults',
			clientWidth,
		});
	} else {
		mittBus.emit('layoutMobileResize', {
			layout: Local.get('oldLayout') ? Local.get('oldLayout') : themeConfig.value.layout,
			clientWidth,
		});
	}
};
// Before mount
onBeforeMount(() => {
	onLayoutResize();
	window.addEventListener('resize', onLayoutResize);
});
// On unmount
onUnmounted(() => {
	window.removeEventListener('resize', onLayoutResize);
});
</script>
