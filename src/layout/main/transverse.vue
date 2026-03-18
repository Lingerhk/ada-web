<template>
	<el-container class="layout-container flex-center layout-backtop">
		<LayoutHeader />
		<LayoutMain ref="layoutMainRef" />
	</el-container>
</template>

<script setup lang="ts" name="layoutTransverse">
import { defineAsyncComponent, ref, watch, nextTick, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useThemeConfig } from '/@/stores/themeConfig';

// Import components
const LayoutHeader = defineAsyncComponent(() => import('/@/layout/component/header.vue'));
const LayoutMain = defineAsyncComponent(() => import('/@/layout/component/main.vue'));

// Define reactive state and refs
const layoutMainRef = ref<InstanceType<typeof LayoutMain>>();
const storesThemeConfig = useThemeConfig();
const { themeConfig } = storeToRefs(storesThemeConfig);
const route = useRoute();

// Reset the scrollbar height and update the child scrollbar
const updateScrollbar = () => {
	layoutMainRef.value!.layoutMainScrollbarRef.update();
};
// Reset the scrollbar height because the component is loaded asynchronously
const initScrollBarHeight = () => {
	nextTick(() => {
		setTimeout(() => {
			updateScrollbar();
			layoutMainRef.value!.layoutMainScrollbarRef.wrapRef.scrollTop = 0;
		}, 500);
	});
};
// On mount
onMounted(() => {
	initScrollBarHeight();
});
// Reset the scrollbar to the top when the route changes
watch(
	() => route.path,
	() => {
		initScrollBarHeight();
	}
);
// Watch themeConfig changes and update the menu scrollbar height
watch(
	() => themeConfig.value.isTagsview,
	() => {
		nextTick(() => {
			updateScrollbar();
		});
	},
	{
		deep: true,
	}
);
</script>
