<template>
	<div v-if="isShowBreadcrumb" class="layout-navbars-breadcrumb">
		<SvgIcon
			class="layout-navbars-breadcrumb-icon"
			:name="themeConfig.isCollapse ? 'ele-Expand' : 'ele-Fold'"
			:size="16"
			@click="onThemeConfigChange"
		/>
		<el-breadcrumb class="layout-navbars-breadcrumb-hide">
			<transition-group name="breadcrumb">
				<el-breadcrumb-item v-for="(v, k) in state.breadcrumbList" :key="`${v.path || v.name || v.meta.title}-${k}`">
					<span v-if="k === state.breadcrumbList.length - 1" class="layout-navbars-breadcrumb-span">
						<SvgIcon :name="v.meta.icon" class="layout-navbars-breadcrumb-iconfont" v-if="themeConfig.isBreadcrumbIcon" />
						<div>{{ getBreadcrumbTitle(v) }}</div>
					</span>
					<a v-else @click.prevent="onBreadcrumbClick(v)">
						<SvgIcon :name="v.meta.icon" class="layout-navbars-breadcrumb-iconfont" v-if="themeConfig.isBreadcrumbIcon" />{{ $t(v.meta.title) }}
					</a>
				</el-breadcrumb-item>
			</transition-group>
		</el-breadcrumb>
	</div>
</template>

<script setup lang="ts" name="layoutBreadcrumb">
import { reactive, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Local } from '/@/utils/storage';
import { storeToRefs } from 'pinia';
import { useThemeConfig } from '/@/stores/themeConfig';
import { useRoutesList } from '/@/stores/routesList';
import { useI18n } from 'vue-i18n';

// Define reactive state and refs
const stores = useRoutesList();
const storesThemeConfig = useThemeConfig();
const { themeConfig } = storeToRefs(storesThemeConfig);
const { routesList } = storeToRefs(stores);
const route = useRoute();
const router = useRouter();
const { t, locale } = useI18n();
const state = reactive<BreadcrumbState>({
	breadcrumbList: [],
	routeSplit: [],
	routeSplitFirst: '',
	routeSplitIndex: 1,
});
const tagsViewNameI18nPattern = /^\{("(zh-cn|en)":"[^,]+",?){1,2}}$/;

// Hide breadcrumbs dynamically in classic and transverse layouts
const isShowBreadcrumb = computed(() => {
	const { layout, isBreadcrumb } = themeConfig.value;
	if (layout === 'classic' || layout === 'transverse') return false;
	else return isBreadcrumb ? true : false;
});
// Handle breadcrumb clicks
const onBreadcrumbClick = (v: RouteItem) => {
	const { redirect, path } = v;
	if (redirect) router.push(redirect);
	else router.push(path);
};
// Handle expand/collapse clicks for the left menu
const onThemeConfigChange = () => {
	themeConfig.value.isCollapse = !themeConfig.value.isCollapse;
	setLocalThemeConfig();
};
// Persist layout settings
const setLocalThemeConfig = () => {
	Local.remove('themeConfig');
	Local.set('themeConfig', themeConfig.value);
};
// Resolve dynamic route custom names without caching normal translated route titles.
const getCustomTagsViewName = (currentRoute: RouteToFrom) => {
	const tagsViewName = currentRoute.query?.tagsViewName || currentRoute.params?.tagsViewName;
	if (Array.isArray(tagsViewName)) return tagsViewName[0] || '';
	return tagsViewName ? String(tagsViewName) : '';
};
const getBreadcrumbTitle = (item: RouteItem) => {
	const tagsViewName = item.meta?.tagsViewName;
	if (tagsViewName) {
		const value = String(tagsViewName);
		if (tagsViewNameI18nPattern.test(value)) {
			const nameMap = JSON.parse(value);
			return nameMap[locale.value] || nameMap.en || nameMap['zh-cn'] || '';
		}
		return value;
	}
	return item.meta?.title ? t(item.meta.title) : '';
};
// Process breadcrumb data
const getBreadcrumbList = (arr: RouteItems) => {
	arr.forEach((item: RouteItem) => {
		state.routeSplit.forEach((v: string, k: number, arrs: string[]) => {
			if (state.routeSplitFirst === item.path) {
				state.routeSplitFirst += `/${arrs[state.routeSplitIndex]}`;
				state.breadcrumbList.push({ ...item, meta: { ...item.meta } });
				state.routeSplitIndex++;
				if (item.children) getBreadcrumbList(item.children);
			}
		});
	});
};
// Split the current route string into an array and remove the first empty segment
const initRouteSplit = (path: string, currentRoute: RouteToFrom = <RouteToFrom>route) => {
	if (!themeConfig.value.isBreadcrumb) {
		state.breadcrumbList = [];
		return false;
	}
	const homeRoute = routesList.value[0];
	state.breadcrumbList = homeRoute ? [{ ...homeRoute, meta: { ...homeRoute.meta } }] : [];
	state.routeSplit = path.split('/');
	state.routeSplit.shift();
	state.routeSplitFirst = `/${state.routeSplit[0]}`;
	state.routeSplitIndex = 1;
	getBreadcrumbList(routesList.value);
	if (currentRoute.name === 'home' || (currentRoute.name === 'notFound' && state.breadcrumbList.length > 1)) state.breadcrumbList.shift();
	if (state.breadcrumbList.length > 0) {
		const customTagsViewName = getCustomTagsViewName(currentRoute);
		if (customTagsViewName) state.breadcrumbList[state.breadcrumbList.length - 1].meta.tagsViewName = customTagsViewName;
		else if (currentRoute.meta?.title) state.breadcrumbList[state.breadcrumbList.length - 1].meta.title = currentRoute.meta.title as string;
	}
};

watch(
	() => [route.fullPath, routesList.value.length, themeConfig.value.isBreadcrumb, locale.value],
	() => initRouteSplit(route.path, <RouteToFrom>route),
	{ immediate: true }
);
</script>

<style scoped lang="scss">
.layout-navbars-breadcrumb {
	flex: 1;
	height: inherit;
	display: flex;
	align-items: center;
	.layout-navbars-breadcrumb-icon {
		cursor: pointer;
		font-size: 18px;
		color: var(--next-bg-topBarColor);
		height: 100%;
		width: 40px;
		opacity: 0.8;
		&:hover {
			opacity: 1;
		}
	}
	.layout-navbars-breadcrumb-span {
		display: flex;
		opacity: 0.7;
		color: var(--next-bg-topBarColor);
	}
	.layout-navbars-breadcrumb-iconfont {
		font-size: 14px;
		margin-right: 5px;
	}
	:deep(.el-breadcrumb__separator) {
		opacity: 0.7;
		color: var(--next-bg-topBarColor);
	}
	:deep(.el-breadcrumb__inner a, .el-breadcrumb__inner.is-link) {
		font-weight: unset !important;
		color: var(--next-bg-topBarColor);
		&:hover {
			color: var(--el-color-primary) !important;
		}
	}
}
</style>
