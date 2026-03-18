<template>
	<el-container class="layout-container flex-center">
		<LayoutHeader />
		<el-container class="layout-mian-height-50">
			<LayoutAside />
			<div class="flex-center layout-backtop">
				<LayoutTagsView v-if="isTagsview" />
				<LayoutMain ref="layoutMainRef" />
			</div>
		</el-container>
	</el-container>
</template>

<script setup lang="ts" name="layoutClassic">
import { defineAsyncComponent, computed, ref, watch, nextTick, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useThemeConfig } from '/@/stores/themeConfig';

// Import components
const LayoutAside = defineAsyncComponent(() => import('/@/layout/component/aside.vue'));
const LayoutHeader = defineAsyncComponent(() => import('/@/layout/component/header.vue'));
const LayoutMain = defineAsyncComponent(() => import('/@/layout/component/main.vue'));
const LayoutTagsView = defineAsyncComponent(() => import('/@/layout/navBars/tagsView/tagsView.vue'));

// Define reactive state and refs
const layoutMainRef = ref<InstanceType<typeof LayoutMain>>();
const route = useRoute();
const storesThemeConfig = useThemeConfig();
const { themeConfig } = storeToRefs(storesThemeConfig);

// Check whether tagsView should be shown
const isTagsview = computed(() => {
	return themeConfig.value.isTagsview;
});
// Reset the scrollbar height and update the child scrollbar
const updateScrollbar = () => {
	layoutMainRef.value?.layoutMainScrollbarRef.update();
};
// Reset the scrollbar height because the component is loaded asynchronously
const initScrollBarHeight = () => {
	nextTick(() => {
		setTimeout(() => {
			updateScrollbar();
			// The `!` non-null assertion does not add runtime checks
			if (layoutMainRef.value) layoutMainRef.value!.layoutMainScrollbarRef.wrapRef.scrollTop = 0;
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
// Watch `themeConfig.isTagsview` and update the menu `el-scrollbar` height
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
