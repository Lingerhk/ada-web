<template>
	<div class="layout-navbars-breadcrumb-user-news">
		<div class="head-box">
			<div class="head-main">
				<span class="head-icon">
					<el-icon><Bell /></el-icon>
				</span>
				<div>
					<div class="head-box-title">{{ $t('message.user.newTitle') }}</div>
					<div class="head-box-subtitle">
						{{ news.length > 0 ? $t('message.user.newUnread', [news.length]) : $t('message.user.newDesc') }}
					</div>
				</div>
			</div>
			<el-button
				v-if="news.length > 0"
				link
				type="primary"
				size="small"
				:loading="markingRead"
				@click.stop="onAllReadClick"
			>
				<el-icon><Check /></el-icon>
				<span>{{ $t('message.user.newBtn') }}</span>
			</el-button>
		</div>
		<div class="content-box" :class="{ 'is-empty': news.length === 0 }">
			<template v-if="news.length > 0">
				<button
					class="content-box-item"
					v-for="v in news"
					:key="v.id"
					type="button"
					@click="onGotoMessageCenter"
				>
					<span class="notice-type-icon" :class="`notice-type-icon--${v.msgType || 'system'}`">
						<el-icon><component :is="getNoticeIcon(v.msgType)" /></el-icon>
					</span>
					<span class="content-box-main">
						<span class="content-box-topline">
							<span class="content-box-msg">{{ v.value }}</span>
							<el-tag class="content-box-tag" :type="getNoticeTagType(v.msgType)" effect="plain" size="small">
								{{ v.label }}
							</el-tag>
						</span>
						<span v-if="v.desc" class="content-box-desc">{{ v.desc }}</span>
						<span class="content-box-time">
							<el-icon><Clock /></el-icon>
							{{ v.time }}
						</span>
					</span>
				</button>
			</template>
			<div v-else class="empty-box">
				<span class="empty-icon">
					<el-icon><Bell /></el-icon>
				</span>
				<div class="empty-title">{{ $t('message.user.newDesc') }}</div>
				<div class="empty-subtitle">{{ $t('message.user.newEmptyHint') }}</div>
			</div>
		</div>
		<div class="foot-box" @click="onGotoMessageCenter">
			<span>{{ $t('message.user.newGo') }}</span>
			<el-icon><ArrowRight /></el-icon>
		</div>
	</div>
</template>

<script setup lang="ts" name="layoutBreadcrumbUserNews">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { setNotificationRead } from '/@/api/grpc/method';
import { alertApiError, alertResult } from '/@/utils/error';
import { useI18n } from 'vue-i18n';
import { ArrowRight, Bell, Check, Clock, WarningFilled, InfoFilled, CircleCheckFilled } from '@element-plus/icons-vue';
import type { Component } from 'vue';

type NoticeItem = {
	id: string;
	label: string;
	value: string;
	time: string;
	msgType: string;
	eventType?: string;
	desc?: string;
};

const props = defineProps<{
	modelValue?: NoticeItem[];
}>();

const emit = defineEmits<{
	(e: 'update:modelValue', value: NoticeItem[]): void;
}>();

const { t } = useI18n();
const router = useRouter();
const markingRead = ref(false);
const news = computed(() => props.modelValue ?? []);

const noticeIconMap: Record<string, Component> = {
	alert: WarningFilled,
	baseline: InfoFilled,
	leak: WarningFilled,
	system: CircleCheckFilled,
};

const getNoticeIcon = (msgType: string) => noticeIconMap[msgType] || InfoFilled;

const getNoticeTagType = (msgType: string) => {
	if (msgType === 'alert') return 'danger';
	if (msgType === 'baseline' || msgType === 'leak') return 'warning';
	return 'info';
};

// Handle the mark-all-as-read action
const onAllReadClick = () => {
	const ids = news.value.map(n => n.id);
	if (ids.length === 0 || markingRead.value) return;

	markingRead.value = true;
	setNotificationRead(ids)
		.then(data => {
			const ok = alertResult(data.result, t('message.system.message.markReadedSucc'), t('message.system.message.markReadedFail'));
			if (ok) {
				emit('update:modelValue', []);
			}
		})
		.catch(err => alertApiError(err))
		.finally(() => {
			markingRead.value = false;
		});
};

// Handle navigation to the notification center
const onGotoMessageCenter = () => {
	router.push('/settings/messages');
};
</script>

<style scoped lang="scss">
.layout-navbars-breadcrumb-user-news {
	overflow: hidden;
	border-radius: 8px;
	background: var(--el-bg-color);
	.head-box {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 16px 16px 14px;
		border-bottom: 1px solid var(--el-border-color-lighter);
		background: linear-gradient(180deg, var(--el-fill-color-light) 0%, var(--el-bg-color) 100%);
		color: var(--el-text-color-primary);
	}
	.head-main {
		display: flex;
		align-items: center;
		gap: 10px;
		min-width: 0;
	}
	.head-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 34px;
		height: 34px;
		flex: 0 0 auto;
		border-radius: 8px;
		color: var(--el-color-primary);
		background: var(--el-color-primary-light-9);
	}
	.head-box-title {
		font-size: 15px;
		font-weight: 700;
		line-height: 20px;
	}
	.head-box-subtitle {
		margin-top: 2px;
		color: var(--el-text-color-secondary);
		font-size: 12px;
		line-height: 16px;
	}
	.content-box {
		max-height: 360px;
		overflow-y: auto;
		padding: 8px;
		font-size: 13px;
		&.is-empty {
			padding: 24px 16px 28px;
		}
	}
	.content-box-item {
		width: 100%;
		display: flex;
		gap: 10px;
		padding: 12px;
		border: 0;
		border-radius: 8px;
		background: transparent;
		color: inherit;
		font: inherit;
		text-align: left;
		cursor: pointer;
		transition: background-color 0.16s ease, transform 0.16s ease;
		&:hover {
			background: var(--el-fill-color-light);
			transform: translateY(-1px);
		}
		&:focus-visible {
			outline: 2px solid var(--el-color-primary-light-5);
			outline-offset: 2px;
		}
	}
	.notice-type-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 30px;
		height: 30px;
		flex: 0 0 auto;
		border-radius: 8px;
		color: var(--el-color-info);
		background: var(--el-fill-color);
		&--alert {
			color: var(--el-color-danger);
			background: var(--el-color-danger-light-9);
		}
		&--baseline,
		&--leak {
			color: var(--el-color-warning);
			background: var(--el-color-warning-light-9);
		}
		&--system {
			color: var(--el-color-success);
			background: var(--el-color-success-light-9);
		}
	}
	.content-box-main {
		display: flex;
		flex-direction: column;
		gap: 6px;
		min-width: 0;
		flex: 1;
	}
	.content-box-topline {
		display: flex;
		align-items: flex-start;
		gap: 8px;
	}
	.content-box-msg {
		min-width: 0;
		flex: 1;
		color: var(--el-text-color-primary);
		font-weight: 600;
		line-height: 18px;
		word-break: break-word;
	}
	.content-box-tag {
		flex: 0 0 auto;
	}
	.content-box-desc {
		color: var(--el-text-color-secondary);
		line-height: 18px;
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}
	.content-box-time {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		color: var(--el-text-color-placeholder);
		font-size: 12px;
		line-height: 16px;
	}
	.empty-box {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}
	.empty-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		border-radius: 10px;
		color: var(--el-color-info);
		background: var(--el-fill-color-light);
	}
	.empty-title {
		margin-top: 12px;
		color: var(--el-text-color-primary);
		font-weight: 600;
	}
	.empty-subtitle {
		margin-top: 4px;
		color: var(--el-text-color-secondary);
		font-size: 12px;
	}
	.foot-box {
		height: 44px;
		color: var(--el-color-primary);
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 4px;
		border-top: 1px solid var(--el-border-color-lighter);
		background: var(--el-fill-color-blank);
		transition: background-color 0.16s ease;
		&:hover {
			background: var(--el-color-primary-light-9);
		}
	}
}
</style>
