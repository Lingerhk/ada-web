<template>
	<div class="layout-navbars-breadcrumb-user pr15" :style="{ flex: layoutUserFlexNum }">
		<el-dropdown :show-timeout="70" :hide-timeout="50" trigger="click" @command="(lang: any) => onLanguageChange(lang, true)">
			<div class="layout-navbars-breadcrumb-user-icon">
				<i
					class="iconfont"
					:class="state.disabledLocale === 'en' ? 'icon-fuhao-yingwen' : 'icon-fuhao-zhongwen'"
					:title="$t('message.user.title1')"
				></i>
			</div>
			<template #dropdown>
				<el-dropdown-menu>
					<el-dropdown-item command="zh-cn" :disabled="state.disabledLocale === 'zh-cn'">{{ $t('message.user.languageZhCn') }}</el-dropdown-item>
					<el-dropdown-item command="en" :disabled="state.disabledLocale === 'en'">{{ $t('message.user.languageEn') }}</el-dropdown-item>
				</el-dropdown-menu>
			</template>
		</el-dropdown>
		<div
			class="layout-navbars-breadcrumb-user-icon notice-bell"
			:class="{ 'is-active': news.length > 0 }"
			ref="userNewsBadgeRef"
			v-click-outside="onUserNewsClick"
		>
			<el-badge :value="news.length" :max="99" :hidden="news.length === 0" type="danger">
				<el-icon :title="$t('message.user.title4')">
					<ele-Bell />
				</el-icon>
			</el-badge>
		</div>
		<div class="layout-navbars-breadcrumb-user-icon" @click="onOpenSettingsDrawer">
			<el-icon :title="$t('message.user.title3')">
				<ele-Setting />
			</el-icon>
		</div>
		<el-popover
			ref="userNewsRef"
			:virtual-ref="userNewsBadgeRef"
			placement="bottom"
			trigger="click"
			transition="el-zoom-in-top"
			virtual-triggering
			:width="420"
			popper-class="user-news-popper"
			:persistent="false"
		>
			<UserNews v-model="news" />
		</el-popover>
		<el-dropdown :show-timeout="70" :hide-timeout="50" @command="onHandleCommandClick">
			<span class="layout-navbars-breadcrumb-user-link">
				{{ state.userName }}
				<el-icon class="el-icon--right">
					<ele-ArrowDown />
				</el-icon>
			</span>
			<template #dropdown>
				<el-dropdown-menu>
					<el-dropdown-item command="changePassword">{{ $t('message.accountPerson.changePasswordTitle') }}</el-dropdown-item>
					<el-dropdown-item command="/me">{{ $t('message.router.me') }}</el-dropdown-item>
					<el-dropdown-item divided command="logOut">{{ $t('message.user.dropdown5') }}</el-dropdown-item>
				</el-dropdown-menu>
			</template>
		</el-dropdown>
		<ChangePasswordDialog v-model="needChangePassword" />
	</div>
</template>

<script setup lang="ts" name="layoutBreadcrumbUser">
import { defineAsyncComponent, ref, unref, computed, reactive, onMounted, onUnmounted, h } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessageBox, ClickOutside as vClickOutside, ElNotification } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useUserInfo } from '/@/stores/userInfo';
import { useThemeConfig } from '/@/stores/themeConfig';
import other from '/@/utils/other';
import { Session, Local } from '/@/utils/storage';
import { getSysLanguage, getUnreadNotification, updateSysLanguage } from '/@/api/grpc/method';
import { formatApiTime } from '/@/utils/formatTime';
import mittBus from '/@/utils/mitt';
import type { VNode } from 'vue';

// Import components
const UserNews = defineAsyncComponent(() => import('/@/layout/navBars/topBar/userNews.vue'));
const ChangePasswordDialog = defineAsyncComponent(() => import('/@/components/secret/ChangePasswordDialog.vue'));

// Define reactive state and refs
const userNewsRef = ref();
const userNewsBadgeRef = ref();
const { locale, t } = useI18n();
const router = useRouter();
const stores = useUserInfo();
const storesThemeConfig = useThemeConfig();
const { themeConfig } = storeToRefs(storesThemeConfig);
const state = reactive({
	disabledLocale: 'zh-cn',
	disabledSize: 'large',
	userName: '',
});

const needChangePassword = ref(false);

// Apply the divider styles
const layoutUserFlexNum = computed(() => {
	let num: string | number = '';
	const { layout, isClassicSplitMenu } = themeConfig.value;
	const layoutArr: string[] = ['defaults', 'columns'];
	if (layoutArr.includes(layout) || (layout === 'classic' && !isClassicSplitMenu)) num = '1';
	else num = '';
	return num;
});
// Handle notification clicks
const onUserNewsClick = () => {
	unref(userNewsRef).popperRef?.delayHide?.();
};
const onOpenSettingsDrawer = () => {
	mittBus.emit('openSettingsDrawer');
};
// Handle dropdown-menu clicks
const onHandleCommandClick = (path: string) => {
	if (path === 'logOut') {
		ElMessageBox({
			closeOnClickModal: false,
			closeOnPressEscape: false,
			title: t('message.user.logOutTitle'),
			message: t('message.user.logOutMessage'),
			showCancelButton: true,
			confirmButtonText: t('message.user.logOutConfirm'),
			cancelButtonText: t('message.user.logOutCancel'),
			buttonSize: 'default',
			beforeClose: (action, instance, done) => {
				if (action === 'confirm') {
					instance.confirmButtonLoading = true;
					instance.confirmButtonText = t('message.user.logOutExit');
					setTimeout(() => {
						done();
						setTimeout(() => {
							instance.confirmButtonLoading = false;
						}, 300);
					}, 700);
				} else {
					done();
				}
			},
		})
			.then(async () => {
				// Clear cached state, tokens, and related data
				Session.clear();
				// When using reload, you do not need to call resetRoute()
				window.location.reload();
			})
			.catch(() => {});
	} else if (path === 'changePassword') {
		needChangePassword.value = true;
	} else {
		router.push(path);
	}
};

// Handle language changes
const onLanguageChange = (lang: string, sync: boolean = false) => {
	Local.remove('themeConfig');
	themeConfig.value.globalI18n = lang;
	Local.set('themeConfig', themeConfig.value);
	locale.value = lang;
	other.useTitle();
	initI18nOrSize('globalI18n', 'disabledLocale');
	if (sync === true) {
		updateSysLanguage(lang).then(data => {
			window.location.reload();
		});
	}
};

// Initialize component size and i18n settings
const initI18nOrSize = (value: string, attr: string) => {
	(<any>state)[attr] = Local.get('themeConfig')[value];
};

let messageTimerId: NodeJS.Timeout | null = null;

type NoticeItem = {
	id: string;
	label: string;
	value: string;
	time: string;
	msgType: string;
	eventType: string;
	desc: string;
};

const news = ref<NoticeItem[]>([]);

// Get shown notification IDs from session storage
const getShownNotificationIds = (): string[] => {
	const shown = Session.get('shownNotificationIds');
	return shown ? shown : [];
};

// Save shown notification IDs to session storage
const saveShownNotificationIds = (ids: string[]) => {
	Session.set('shownNotificationIds', ids);
};

const getNotificationType = (msgType: string) => {
	if (msgType === 'alert') return 'error';
	if (msgType === 'baseline' || msgType === 'leak') return 'warning';
	return 'info';
};

const buildNotificationMessage = (data: NoticeItem): VNode => {
	const meta = [data.label, data.eventType, data.time].filter(Boolean).join(' · ');
	return h('div', { class: 'ada-message-toast' }, [
		h('div', { class: 'ada-message-toast__title' }, data.value),
		data.desc ? h('div', { class: 'ada-message-toast__desc' }, data.desc) : null,
		meta ? h('div', { class: 'ada-message-toast__meta' }, meta) : null,
	]);
};

const refreshMessage = () => {
	getUnreadNotification().then(data => {

		let _news: NoticeItem[] = [];
		const shownIds = getShownNotificationIds();
		const newShownIds = [...shownIds];

		data.list.forEach(d => {
			const _data: NoticeItem = {
				id: d.iD,
				label: t(`message.system.message.msgType_${d.msgType}`),
				value: d.title,
				time: formatApiTime(d.createTm),
				msgType: d.msgType,
				eventType: d.eventType,
				desc: d.desc,
			};

			_news = [..._news, _data];

			// Skip showing notification popup if already shown in this session
			if (shownIds.includes(d.iD)) {
				return;
			}

			// Mark this notification as shown
			newShownIds.push(d.iD);

			// Use a timeout to avoid style overlap
			setTimeout(() => {
				ElNotification({
					title: t('message.user.newTitle'),
					message: buildNotificationMessage(_data),
					type: getNotificationType(_data.msgType),
					duration: 7000,
					position: 'top-right',
					showClose: true,
					customClass: `ada-message-notification ada-message-notification--${_data.msgType || 'system'}`,
				});
			});
		});

		// Save updated shown IDs
		if (newShownIds.length !== shownIds.length) {
			saveShownNotificationIds(newShownIds);
		}

		news.value = _news;
	})
	.catch(() => {});
};

const initI18n = () => {
	getSysLanguage().then(sysLang => {
		const localLang = sysLang === 'EN' ? 'en' : 'zh-cn';
		onLanguageChange(localLang, false);
	});
};

// On mount
onMounted(() => {
	if (Local.get('themeConfig')) {
		initI18nOrSize('globalComponentSize', 'disabledSize');
		initI18nOrSize('globalI18n', 'disabledLocale');
	}
	const userName = Local.get('userName');
	if (userName) {
		state.userName = userName;
	}

	refreshMessage();

	messageTimerId = setInterval(() => {
		refreshMessage();
	}, 5000);

	initI18n();
});

onUnmounted(() => {

	if (messageTimerId !== null) {
		clearInterval(messageTimerId);
	}
});
</script>

<style scoped lang="scss">
.layout-navbars-breadcrumb-user {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	&-link {
		height: 100%;
		display: flex;
		align-items: center;
		white-space: nowrap;
		&-photo {
			width: 25px;
			height: 25px;
			border-radius: 100%;
		}
	}
	&-icon {
		padding: 0 10px;
		cursor: pointer;
		color: var(--next-bg-topBarColor);
		height: 50px;
		line-height: 50px;
		display: flex;
		align-items: center;
		&:hover {
			background: var(--next-color-user-hover);
			i {
				display: inline-block;
				animation: logoAnimation 0.3s ease-in-out;
			}
		}
	}
	.notice-bell {
		position: relative;
		:deep(.el-icon) {
			transition: color 0.16s ease, transform 0.16s ease;
		}
		&.is-active {
			:deep(.el-icon) {
				color: var(--el-color-warning);
			}
		}
		&:hover {
			:deep(.el-icon) {
				transform: translateY(-1px);
			}
		}
	}
	:deep(.el-dropdown) {
		color: var(--next-bg-topBarColor);
	}
	:deep(.el-badge) {
		height: 40px;
		line-height: 40px;
		display: flex;
		align-items: center;
	}
	:deep(.el-badge__content.is-fixed) {
		top: 12px;
	}
}

:global(.user-news-popper) {
	padding: 0 !important;
	border-radius: 8px !important;
	overflow: hidden;
	box-shadow: 0 18px 42px rgba(15, 23, 42, 0.16) !important;
}

:global(.ada-message-notification) {
	width: 360px !important;
	padding: 15px 16px !important;
	border-radius: 10px !important;
	border: 1px solid var(--el-border-color-lighter) !important;
	border-left: 4px solid var(--el-color-info) !important;
	box-shadow: 0 16px 40px rgba(15, 23, 42, 0.18) !important;
}

:global(.ada-message-notification--alert) {
	border-left-color: var(--el-color-danger) !important;
}

:global(.ada-message-notification--baseline),
:global(.ada-message-notification--leak) {
	border-left-color: var(--el-color-warning) !important;
}

:global(.ada-message-notification--system) {
	border-left-color: var(--el-color-success) !important;
}

:global(.ada-message-notification .el-notification__group) {
	min-width: 0;
	margin-left: 12px;
}

:global(.ada-message-notification .el-notification__title) {
	color: var(--el-text-color-primary);
	font-size: 14px;
	font-weight: 700;
	line-height: 20px;
}

:global(.ada-message-notification .el-notification__content) {
	margin-top: 6px;
	text-align: left;
}

:global(.ada-message-toast) {
	display: flex;
	flex-direction: column;
	gap: 6px;
	min-width: 0;
}

:global(.ada-message-toast__title) {
	color: var(--el-text-color-primary);
	font-size: 14px;
	font-weight: 600;
	line-height: 20px;
	word-break: break-word;
}

:global(.ada-message-toast__desc) {
	color: var(--el-text-color-secondary);
	font-size: 13px;
	line-height: 18px;
	overflow: hidden;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
}

:global(.ada-message-toast__meta) {
	color: var(--el-text-color-placeholder);
	font-size: 12px;
	line-height: 16px;
}
</style>
