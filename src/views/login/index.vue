<template>
	<div
		class="login-container flex"
		:style="{ 'background-image': `linear-gradient(120deg, rgba(7, 44, 47, 0.80), rgba(15, 72, 68, 0.42)), url(${BackgroundImage})` }"
	>
		<section class="login-shell">
			<div class="login-panel">
				<div class="login-brand">
					<img src="/logo.svg" alt="ADAegis" />
					<span>ADAegis</span>
				</div>
				<div class="login-center-title">{{ $t('message.login.title') }}</div>
				<div class="login-center-subtitle">{{ $t('message.login.subtitle') }}</div>
				<div class="login-center-form"><Account /></div>
			</div>
			<div class="login-copy">
				<div class="login-copy-kicker">Identity Security Operations</div>
				<h1>持续感知域内风险，统一处置身份威胁</h1>
				<p>面向 AD 安全运营的实时监测、风险扫描与响应控制台。</p>
			</div>
		</section>
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
	justify-content: center;
	align-items: center;
	background: #0b2528;
	background-size: cover;
	background-repeat: no-repeat;
	background-position: center center;
	position: relative;
	padding: 32px;
	overflow: hidden;

	.login-shell {
		width: min(1080px, 100%);
		min-height: 540px;
		display: grid;
		grid-template-columns: minmax(380px, 480px) 1fr;
		gap: 44px;
		align-items: center;
	}

	.login-panel {
		display: flex;
		flex-direction: column;
		border: 1px solid rgba(255, 255, 255, 0.28);
		border-radius: 8px;
		width: 100%;
		min-height: 500px;
		position: relative;
		overflow: hidden;
		background: rgba(255, 255, 255, 0.9);
		padding: 34px 42px 40px;
		box-shadow: 0 24px 60px rgba(8, 28, 32, 0.28);
		backdrop-filter: blur(18px);

		.login-brand {
			display: flex;
			align-items: center;
			gap: 10px;
			margin-bottom: 26px;
			color: #123234;
			font-size: 18px;
			font-weight: 800;

			img {
				width: 34px;
				height: 34px;
			}
		}

		.login-center-title {
			font-size: 30px;
			line-height: 1.25;
			text-align: left;
			letter-spacing: 3px;
			animation: logoAnimation 0.3s ease;
			animation-delay: 0.3s;
			color: #15262a;
			font-weight: 800;
		}

		.login-center-subtitle {
			font-size: 15px;
			line-height: 1.6;
			text-align: left;
			animation: logoAnimation 0.3s ease;
			animation-delay: 0.3s;
			color: #64727d;
			margin: 10px 0 22px;
		}

		.login-center-form {
			flex: 1;
		}
	}

	.login-copy {
		color: #ffffff;
		padding-bottom: 34px;

		.login-copy-kicker {
			color: #f5c76f;
			font-size: 13px;
			font-weight: 800;
			letter-spacing: 0;
			margin-bottom: 16px;
			text-transform: uppercase;
		}

		h1 {
			max-width: 560px;
			font-size: 44px;
			line-height: 1.14;
			font-weight: 800;
			letter-spacing: 0;
			margin: 0;
		}

		p {
			max-width: 480px;
			margin-top: 20px;
			color: rgba(255, 255, 255, 0.78);
			font-size: 17px;
			line-height: 1.7;
		}
	}
}

@media (max-width: 900px) {
	.login-container {
		padding: 18px;

		.login-shell {
			grid-template-columns: 1fr;
			gap: 24px;
		}

		.login-copy {
			order: -1;
			padding-bottom: 0;

			h1 {
				font-size: 30px;
			}
		}

		.login-panel {
			padding: 28px 24px 30px;
			min-height: auto;
		}
	}
}
</style>
