<template>
	<div class="layout-navbars-breadcrumb-user-news">
		<div class="head-box">
			<div class="head-box-title">{{ $t('message.user.newTitle') }}</div>
			<div class="head-box-btn" v-if="news.length > 0" @click="onAllReadClick">{{ $t('message.user.newBtn') }}</div>
		</div>
		<div class="content-box">
			<template v-if="news.length > 0">
				<div class="content-box-item" v-for="(v, k) in news" :key="k">
					<div>{{ v.label }}</div>
					<div class="content-box-msg">
						{{ v.value }}
					</div>
					<div class="content-box-time">{{ v.time }}</div>
				</div>
			</template>
			<el-empty :description="$t('message.user.newDesc')" v-else></el-empty>
		</div>
		<div class="foot-box" @click="onGotoMessageCenter" v-if="news.length > 0">{{ $t('message.user.newGo') }}</div>
	</div>
</template>

<script setup lang="ts" name="layoutBreadcrumbUserNews">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { setNotificationRead } from '/@/api/grpc/method';
import { alertApiError, alertResult } from '/@/utils/error';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

export interface Props {
	id: string,
	label: string,
	value: string,
	time: string,
}

const props = defineProps({
	modelValue: Array<Props>,
});

const news = ref(props.modelValue ?? []);
const router = useRouter();

// Handle the mark-all-as-read action
const onAllReadClick = () => {
	const ids = news.value.map(n => n.id);
	setNotificationRead(ids)
		.then(data => {
			const ok = alertResult(data.result, t('message.system.message.markReadedSucc'), t('message.system.message.markReadedFail'))
			if (ok) {
				news.value = [];
			}
		})
		.catch(err => alertApiError(err))
};

// Handle navigation to the notification center
const onGotoMessageCenter = () => {
	router.push('/message');
};
</script>

<style scoped lang="scss">
.layout-navbars-breadcrumb-user-news {
	.head-box {
		display: flex;
		border-bottom: 1px solid var(--el-border-color-lighter);
		box-sizing: border-box;
		color: var(--el-text-color-primary);
		justify-content: space-between;
		height: 35px;
		align-items: center;
		.head-box-btn {
			color: var(--el-color-primary);
			font-size: 13px;
			cursor: pointer;
			opacity: 0.8;
			&:hover {
				opacity: 1;
			}
		}
	}
	.content-box {
		font-size: 13px;
		.content-box-item {
			padding-top: 12px;
			&:last-of-type {
				padding-bottom: 12px;
			}
			.content-box-msg {
				color: var(--el-text-color-secondary);
				margin-top: 5px;
				margin-bottom: 5px;
			}
			.content-box-time {
				color: var(--el-text-color-secondary);
			}
		}
	}
	.foot-box {
		height: 35px;
		color: var(--el-color-primary);
		font-size: 13px;
		cursor: pointer;
		opacity: 0.8;
		display: flex;
		align-items: center;
		justify-content: center;
		border-top: 1px solid var(--el-border-color-lighter);
		&:hover {
			opacity: 1;
		}
	}
	:deep(.el-empty__description p) {
		font-size: 13px;
	}
}
</style>
