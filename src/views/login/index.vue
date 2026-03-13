<template>
	<div class="login-container flex" :style="{'background-image': `url(${BackgroundImage})`,}">
		<div class="login-center">
			<div class="login-center-title">{{ $t('message.login.title') }}</div>
			<div class="login-center-subtitle">{{ $t('message.login.subtitle') }}</div>
			<div class="login-center-form"><Account /></div>
		</div>
	</div>
</template>

<script setup lang="ts" name="loginIndex">
import { defineAsyncComponent, onMounted, reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useThemeConfig } from '/@/stores/themeConfig';
import { NextLoading } from '/@/utils/loading';
import BackgroundImage from '/@/assets/logo-bg.png'

// Import components
const Account = defineAsyncComponent(() => import('/@/views/login/component/account.vue'));

// Define reactive state and refs
const { t } = useI18n(); // Initialize t function
const storesThemeConfig = useThemeConfig();
const { themeConfig } = storeToRefs(storesThemeConfig);
const state = reactive({
	tabsActiveName: 'account',
	isScan: false,
});

// Read layout settings
const getThemeConfig = computed(() => {
	return themeConfig.value;
});
// On mount
onMounted(() => {
	NextLoading.done();
});
</script>

<style scoped lang="scss">
.login-container {
	height: 100%;
	justify-content: center; // Center horizontally
	align-items: center; // Center vertically
	background: var(--el-color-white);
	background-size: cover;
	background-repeat: no-repeat;
	background-position: center center;
	.login-center {
		display: flex;
		flex-direction: column;
		border: 1px solid rgba(255, 204, 0, 0.3);
		border-radius: 8px;
		width: 600px;
		height: 450px;
		position: relative;
		overflow: hidden;
		background: rgba(39,41,45,.75);
		padding-top: 40px;
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
		.login-center-title {
			height: 50px;
			line-height: 50px;
			font-size: 30px;
			text-align: center;
			letter-spacing: 3px;
			animation: logoAnimation 0.3s ease;
			animation-delay: 0.3s;
			color: white;
		}
		.login-center-subtitle {
			height: 50px;
			line-height: 50px;
			font-size: 18px;
			text-align: center;
			animation: logoAnimation 0.3s ease;
			animation-delay: 0.3s;
			color: #CCCCCC;
			margin-bottom: 10px;
		}
		.login-center-form {
			flex: 1;
			padding: 0 50px 50px;
		}
	}
}
</style>
