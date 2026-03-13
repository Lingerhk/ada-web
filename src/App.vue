<template>
	<el-config-provider :size="getGlobalComponentSize" :locale="getGlobalI18n">
		<router-view v-show="setLockScreen" />
		<LockScreen v-if="themeConfig.isLockScreen" />
		<Setings ref="setingsRef" v-show="setLockScreen" />
		<CloseFull v-if="!themeConfig.isLockScreen" />
		<ChangePasswordDialog v-model="needChangePassword" />
	</el-config-provider>
</template>

<script setup lang="ts" name="app">
import { defineAsyncComponent, computed, ref, onBeforeMount, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useTagsViewRoutes } from '/@/stores/tagsViewRoutes';
import { useThemeConfig } from '/@/stores/themeConfig';
import other from '/@/utils/other';
import { Local, Session } from '/@/utils/storage';
import mittBus from '/@/utils/mitt';
import setIntroduction from '/@/utils/setIconfont';

// Import components
const LockScreen = defineAsyncComponent(() => import('/@/layout/lockScreen/index.vue'));
const Setings = defineAsyncComponent(() => import('/@/layout/navBars/topBar/setings.vue'));
const CloseFull = defineAsyncComponent(() => import('/@/layout/navBars/topBar/closeFull.vue'));
const ChangePasswordDialog = defineAsyncComponent(() => import('/@/components/secret/ChangePasswordDialog.vue'));

// Define reactive state and refs
const { messages, locale } = useI18n();
const setingsRef = ref();
const route = useRoute();
const stores = useTagsViewRoutes();
const storesThemeConfig = useThemeConfig();
const { themeConfig } = storeToRefs(storesThemeConfig);

// Control component visibility while the screen is locked
const setLockScreen = computed(() => {
	// Prevent unrelated pages from showing after refresh while locked
	// https://gitee.com/lyt-top/vue-next-admin/issues/I6AF8P
	return themeConfig.value.isLockScreen ? themeConfig.value.lockScreenTime > 1 : themeConfig.value.lockScreenTime >= 0;
});

// Get the version number
const getVersion = computed(() => {
	let isVersion = false;
	if (route.path !== '/login') {
		// @ts-ignore
		if ((Local.get('version') && Local.get('version') !== __NEXT_VERSION__) || !Local.get('version')) isVersion = true;
	}
	return isVersion;
});

const needChangePassword = ref(false);

// Get the global component size
const getGlobalComponentSize = computed(() => {
	return other.globalComponentSize();
});
// Get the global i18n instance
const getGlobalI18n = computed(() => {
	return messages.value[locale.value];
});
// Apply cached settings on startup so refreshes do not restore defaults
onBeforeMount(() => {
	// Register third-party icon assets
	setIntroduction.cssCdn();
	// Register third-party scripts
	setIntroduction.jsCdn();
});
// On mount
onMounted(() => {
	nextTick(() => {
		// Watch the layout settings drawer opening
		mittBus.on('openSetingsDrawer', () => {
			setingsRef.value.openDrawer();
		});
		// Get the cached layout settings
		if (Local.get('themeConfig')) {
			storesThemeConfig.setThemeConfig({ themeConfig: Local.get('themeConfig') });
			document.documentElement.style.cssText = Local.get('themeConfigStyle');
		}
		// Get the cached full-screen configuration
		if (Session.get('isTagsViewCurrenFull')) {
			stores.setCurrenFullscreen(Session.get('isTagsViewCurrenFull'));
		}
	});
});
// Remove the layout-settings and i18n watchers when the page is destroyed
onUnmounted(() => {
	mittBus.off('openSetingsDrawer', () => {});
});
// Watch route changes and update the document title
watch(
	() => route.path,
	() => {
		other.useTitle();
		needChangePassword.value = Local.get('needChangePassword') && route.path !== '/login';
	},
	{
		deep: true,
	}
);
</script>

<style>
.el-table th {
  background-color: #f5f7fa !important;
}
</style>