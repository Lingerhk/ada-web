<template>
	<div
		class="login-container flex"
		:style="{ 'background-image': `linear-gradient(120deg, rgba(7, 44, 47, 0.80), rgba(15, 72, 68, 0.42)), url(${BackgroundImage})` }"
	>
		<section class="login-shell">
			<div class="login-panel">
				<div class="login-locale" role="group" aria-label="Language">
					<button
						v-for="item in localeOptions"
						:key="item.value"
						type="button"
						:class="{ active: locale === item.value }"
						:aria-pressed="locale === item.value"
						@click="onLocaleChange(item.value)"
					>
						{{ item.label }}
					</button>
				</div>
				<div class="login-brand">
					<img src="/logo.svg" alt="ADAegis" />
					<span>ADAegis</span>
				</div>
				<div class="login-center-title">{{ $t('message.login.title') }}</div>
				<div class="login-center-subtitle">{{ $t('message.login.subtitle') }}</div>
				<div class="login-center-form"><Account /></div>
			</div>
			<div class="login-copy">
				<div class="login-copy-kicker">{{ $t('message.login.copyKicker') }}</div>
				<h1>{{ $t('message.login.copyTitle') }}</h1>
				<p>{{ $t('message.login.copyText') }}</p>
			</div>
		</section>
	</div>
</template>

<script setup lang="ts" name="loginIndex">
import { defineAsyncComponent, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useThemeConfig } from '/@/stores/themeConfig';
import { NextLoading } from '/@/utils/loading';
import { Local } from '/@/utils/storage';
import BackgroundImage from '/@/assets/logo-bg.png';

// Import components
const Account = defineAsyncComponent(() => import('/@/views/login/component/account.vue'));

// Define reactive state and refs
const { locale } = useI18n();
const storesThemeConfig = useThemeConfig();
const { themeConfig } = storeToRefs(storesThemeConfig);

const localeOptions = [
	{ label: '中文', value: 'zh-cn' },
	{ label: 'EN', value: 'en' },
] as const;

const onLocaleChange = (lang: 'zh-cn' | 'en') => {
	if (locale.value === lang) return;
	themeConfig.value.globalI18n = lang;
	Local.set('themeConfig', themeConfig.value);
	locale.value = lang;
};

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

		.login-locale {
			position: absolute;
			top: 18px;
			right: 22px;
			display: inline-flex;
			align-items: center;
			padding: 2px;
			border-radius: 999px;
			background: rgba(19, 54, 56, 0.08);
			border: 1px solid rgba(19, 54, 56, 0.1);

			button {
				border: 0;
				border-radius: 999px;
				background: transparent;
				color: #4a5b60;
				cursor: pointer;
				font-size: 11px;
				font-weight: 800;
				line-height: 1;
				min-width: 34px;
				padding: 6px 8px;
				transition: all 0.18s ease;

				&.active {
					background: #168f7a;
					color: #ffffff;
					box-shadow: 0 6px 16px rgba(22, 143, 122, 0.24);
				}
			}
		}

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
