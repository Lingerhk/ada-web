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
		<div class="layout-navbars-breadcrumb-user-icon" ref="userNewsBadgeRef" v-click-outside="onUserNewsClick">
			<el-badge :is-dot="news.length > 0">
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
			:width="300"
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
import { defineAsyncComponent, ref, unref, computed, reactive, onMounted, onUnmounted } from 'vue';
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
const news = ref<Array<any>>([]);

// Get shown notification IDs from session storage
const getShownNotificationIds = (): string[] => {
	const shown = Session.get('shownNotificationIds');
	return shown ? shown : [];
};

// Save shown notification IDs to session storage
const saveShownNotificationIds = (ids: string[]) => {
	Session.set('shownNotificationIds', ids);
};

const refreshMessage = () => {
	getUnreadNotification().then(data => {

		let _news: any[] = [];
		const shownIds = getShownNotificationIds();
		const newShownIds = [...shownIds];

		data.list.forEach(d => {
			const _data = {
				id: d.iD,
				label: t(`message.system.message.msgType_${d.msgType}`),
				value: d.title,
				time: formatApiTime(d.createTm),
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
				ElNotification.warning({
					title: t('message.system.message.message'),
					message: `<span style="font-size:16px;font-weight:bold;">${_data.value}<br>${formatApiTime(_data.time)}</span>`,
					dangerouslyUseHTMLString: true,
					customClass: 'message-notification'
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

.message-notification {
	:deep(.el-notification__title) {
		color: red !important;
	}
}
</style>
