<template>
	<div class="layout-footer pb15">
		<div class="layout-footer-warp">
			<div class="mt5">© 2025 ADAegis. All rights reserved.</div>
		</div>
	</div>
</template>

<script setup lang="ts" name="layoutFooter">
import { onMounted } from 'vue';

// 调试信息
onMounted(() => {
	console.log('Footer component mounted!');
});
</script>

<style scoped lang="scss">
.layout-footer {
	width: 100%;
	display: flex;
	padding: 20px 0;
	margin-top: 30px;
	border-top: 1px solid var(--el-border-color-lighter);
	background-color: var(--el-bg-color);
	&-warp {
		margin: auto;
		color: var(--el-text-color-regular);
		text-align: center;
		animation: error-num 0.3s ease;
		font-size: 13px;
		line-height: 1.8;
	}
}
</style>
