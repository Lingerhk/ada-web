<template>
	<div class="error layout-padding">
		<div class="layout-padding-auto layout-padding-view">
			<div class="error-flex">
				<div class="left">
					<div class="left-item">
						<div class="left-item-animation left-item-num">404</div>
						<div class="left-item-animation left-item-title">{{ $t('message.notFound.foundTitle') }}</div>
						<div class="left-item-animation left-item-msg">{{ $t('message.notFound.foundMsg') }}</div>
						<div class="left-item-animation left-item-btn">
							<el-button type="primary" size="default" round @click="onGoHome">{{ $t('message.notFound.foundBtn') }}</el-button>
						</div>
					</div>
				</div>
				<div class="right">
					<div class="error-icon">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
							<circle cx="100" cy="100" r="80" stroke="currentColor" stroke-width="4" opacity="0.2"/>
							<path d="M70 85 L85 70 M115 70 L130 85 M70 130 Q100 110 130 130" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
						</svg>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts" name="notFound">
import { useRouter } from 'vue-router';

// 定义变量内容
const router = useRouter();

// 返回首页
const onGoHome = () => {
	router.push('/');
};
</script>

<style scoped lang="scss">
.error {
	height: 100%;
	.error-flex {
		margin: auto;
		display: flex;
		height: 350px;
		width: 900px;
		.left {
			flex: 1;
			height: 100%;
			align-items: center;
			display: flex;
			.left-item {
				.left-item-animation {
					opacity: 0;
					animation-name: error-num;
					animation-duration: 0.5s;
					animation-fill-mode: forwards;
				}
				.left-item-num {
					color: var(--el-color-info);
					font-size: 55px;
				}
				.left-item-title {
					font-size: 20px;
					color: var(--el-text-color-primary);
					margin: 15px 0 5px 0;
					animation-delay: 0.1s;
				}
				.left-item-msg {
					color: var(--el-text-color-secondary);
					font-size: 12px;
					margin-bottom: 30px;
					animation-delay: 0.2s;
				}
				.left-item-btn {
					animation-delay: 0.2s;
				}
			}
		}
		.right {
			flex: 1;
			opacity: 0;
			animation-name: error-img;
			animation-duration: 2s;
			animation-fill-mode: forwards;
			display: flex;
			align-items: center;
			justify-content: center;
			.error-icon {
				width: 80%;
				height: 80%;
				color: var(--el-color-info);
				svg {
					width: 100%;
					height: 100%;
				}
			}
		}
	}
}
</style>
