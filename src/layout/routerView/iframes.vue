<template>
	<div
		ref="iframeWrapRef"
		class="layout-padding layout-padding-unset layout-iframe"
		:class="{ 'is-kibana-route': isKibanaRoute, 'is-kibana-fullscreen': isKibanaFullscreen }"
	>
		<el-tooltip v-if="isKibanaRoute" effect="dark" :content="fullscreenTooltip" placement="left" :teleported="false">
			<button class="layout-iframe-fullscreen-btn" type="button" :aria-label="fullscreenTooltip" @click="toggleKibanaFullscreen">
				<el-icon>
					<ele-CloseBold v-if="isKibanaFullscreen" />
					<ele-FullScreen v-else />
				</el-icon>
			</button>
		</el-tooltip>
		<div class="layout-padding-auto layout-padding-view">
			<div class="w100" v-for="v in setIframeList" :key="v.path" v-loading="v.meta.loading" element-loading-background="white">
				<transition-group :name="name">
					<iframe
						:src="v.meta.isLink"
						:key="v.path"
						frameborder="0"
						height="100%"
						width="100%"
						style="position: absolute"
						:data-url="v.path"
						v-show="getRoutePath === v.path"
						ref="iframeRef"
						allow="fullscreen"
					/>
				</transition-group>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts" name="layoutIframeView">
import { computed, watch, ref, nextTick, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import screenfull from 'screenfull';
import { initKibanaSession } from '/@/utils/kibana';

// Define props
const props = defineProps({
	// Refresh the iframe
	refreshKey: {
		type: String,
		default: () => '',
	},
	// Transition animation name
	name: {
		type: String,
		default: () => 'slide-right',
	},
	// Iframe list
	list: {
		type: Array,
		default: () => [],
	},
});

// Define reactive state and refs
const iframeRef = ref();
const iframeWrapRef = ref<HTMLElement>();
const isKibanaFullscreen = ref(false);
const route = useRoute();
const { t } = useI18n();

// Only load iframe entries after they are opened
const setIframeList = computed(() => {
	return (<RouteItems>props.list).filter((v: RouteItem) => v.meta?.isIframeOpen);
});
// Get the current iframe route path
const getRoutePath = computed(() => {
	return route.path;
});
// Kibana/log-search uses the iframe route and needs a direct browser full-screen affordance
const isKibanaRoute = computed(() => {
	return route.path === '/threat/kibana' || route.name === 'threatKibana';
});
const fullscreenTooltip = computed(() => {
	return isKibanaFullscreen.value ? t('message.tagsView.closeFullscreen') : t('message.tagsView.fullscreen');
});
// Keep component state in sync when the user exits full-screen with Esc or browser controls
const setFullscreenState = () => {
	isKibanaFullscreen.value = screenfull.isEnabled && screenfull.isFullscreen && screenfull.element === iframeWrapRef.value;
};
// Toggle full-screen around the iframe wrapper instead of the iframe document, which is more stable with Kibana proxy/cross-origin pages
const toggleKibanaFullscreen = async () => {
	if (!iframeWrapRef.value) return false;
	if (!screenfull.isEnabled) {
		ElMessage.warning(t('message.user.fullscreenUnavailable'));
		return false;
	}
	try {
		if (isKibanaFullscreen.value) await screenfull.exit();
		else await screenfull.request(iframeWrapRef.value, { navigationUI: 'hide' });
		setFullscreenState();
	} catch {
		ElMessage.warning(t('message.user.fullscreenUnavailable'));
	}
};
// Stop the iframe loading state
const closeIframeLoading = (val: string, item: RouteItem) => {
	nextTick(() => {
		if (!iframeRef.value) return false;
		iframeRef.value.forEach((v: HTMLElement) => {
			if (v.dataset.url === val) {
				v.onload = () => {
					if (item.meta?.isIframeOpen && item.meta.loading) item.meta.loading = false;
				};
			}
		});
	});
};
// Watch route changes and initialize iframe data so switching between multiple iframes stays consistent
watch(
	() => route.fullPath,
	async (val) => {
		const item: any = props.list.find((v: any) => v.path === val || v.path === route.path || v.name === route.name);
		if (!item) return false;

		// Initialize Kibana session if this is a Kibana route
		if (item.path === '/threat/kibana' || item.name === 'threatKibana') {
			try {
				await initKibanaSession();
			} catch {
				// Continue loading iframe even if session init fails
			}
		}

		if (!item.meta.isIframeOpen) item.meta.isIframeOpen = true;
		closeIframeLoading(val, item);
	},
	{
		immediate: true,
	}
);
// Watch `iframeRefreshKey` for tagsView context-menu refreshes
watch(
	() => props.refreshKey,
	() => {
		const item: any = props.list.find((v: any) => v.path === route.path);
		if (!item) return false;
		if (item.meta.isIframeOpen) item.meta.isIframeOpen = false;
		setTimeout(() => {
			item.meta.isIframeOpen = true;
			item.meta.loading = true;
			closeIframeLoading(route.fullPath, item);
		});
	},
	{
		deep: true,
	}
);
// Exit browser full-screen when navigating away from log search
watch(isKibanaRoute, async (val) => {
	if (!val && isKibanaFullscreen.value && screenfull.isEnabled) await screenfull.exit();
});
onMounted(() => {
	if (!screenfull.isEnabled) return false;
	screenfull.on('change', setFullscreenState);
	screenfull.on('error', setFullscreenState);
});
onUnmounted(() => {
	if (!screenfull.isEnabled) return false;
	screenfull.off('change', setFullscreenState);
	screenfull.off('error', setFullscreenState);
});
</script>

<style scoped lang="scss">
.layout-iframe {
	background: var(--el-color-white);

	.layout-iframe-fullscreen-btn {
		position: absolute;
		top: 14px;
		right: 18px;
		z-index: 20;
		width: 34px;
		height: 34px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--el-border-color-light, #dcdfe6);
		border-radius: 6px;
		color: var(--el-text-color-primary, #303133);
		background: rgba(255, 255, 255, 0.92);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
		cursor: pointer;
		transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease;

		&:hover {
			color: var(--el-color-primary);
			border-color: var(--el-color-primary-light-5, var(--el-color-primary));
			background: var(--el-color-white);
		}

		.el-icon {
			font-size: 17px;
		}
	}

	&.is-kibana-fullscreen,
	&:fullscreen,
	&:-webkit-full-screen {
		width: 100vw !important;
		height: 100vh !important;
		padding: 0 !important;
		background: var(--el-color-white);

		.layout-padding-auto,
		.layout-padding-view,
		.w100 {
			height: 100% !important;
		}

		.layout-padding-view {
			border: none !important;
			border-radius: 0 !important;
		}
	}
}
</style>
