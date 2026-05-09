import { RouteRecordRaw } from 'vue-router';

/**
 * Recommended: keep each route path aligned with its folder name so files are easy to locate from the browser URL
 *
 * Route meta field reference
 * meta: {
 * title:          Menu label, tagsView label, and menu-search label (i18n key)
 * isLink：        Whether this route is an external link. Enabled when `isLink` is not empty and `isIframe` is false.
 * isHide：        Whether to hide this route
 * isKeepAlive：   Whether to cache component state
 * isAffix：       Whether to pin this route in tagsView
 * isIframe：      Whether to render the route inside an iframe. Enabled when `isIframe` is true and `isLink` is not empty.
 * roles：         Role identifiers allowed to access this route. Used to show or hide routes. Example roles: `admin`, `common`.
 * icon：          Menu and tagsView icon class. Use `iconfont xxx` for Iconfont icons or `fa xxx` for Font Awesome icons.
 * }
 */

// Extend the RouteMeta interface
declare module 'vue-router' {
	interface RouteMeta {
		title?: string;
		isLink?: string;
		isHide?: boolean;
		isKeepAlive?: boolean;
		isAffix?: boolean;
		isIframe?: boolean;
		roles?: string[];
		icon?: string;
	}
}

/**
 * Define dynamic routes
 * When adding frontend routes, place them in the top-level `children` array
 * @description Used when `isRequestRoutes` is `false`; otherwise the first top-level `children` array is replaced by backend data
 * @description See `ruleForm` in `/@/views/system/menu/component/addMenu.vue` for field definitions
 * @returns The route menu definition
 */
export const dynamicRoutes: Array<RouteRecordRaw> = [
	{
		path: '/',
		name: '/',
		component: () => import('/@/layout/index.vue'),
		redirect: '/dashboard',
		meta: {
			isKeepAlive: true,
		},
		children: [
			{
				path: '/dashboard',
				name: 'dashboard',
				component: () => import('/@/views/dashboard/index.vue'),
				meta: {
					title: 'message.router.dashboard',
					isLink: '',
					isHide: false,
					isKeepAlive: true,
					isAffix: false,
					isIframe: false,
					roles: ['admin', 'common'],
					icon: 'iconfont icon-ico_shuju',
				},
			},
			{
				path: '/threat',
				name: 'threat',
				component: () => import('/@/layout/routerView/parent.vue'),
				redirect: '/threat/overview',
				meta: {
					title: 'message.router.threat',
					isLink: '',
					isHide: false,
					isKeepAlive: true,
					isAffix: false,
					isIframe: false,
					roles: ['admin', 'common'],
					icon: 'iconfont icon-shuju1',
				},
				children: [
					{
						path: '/threat/overview',
						name: 'threatOverview',
						alias: ['/threat/safety-overview', '/safetyOverview', '/saftyOverview'],
						component: () => import('/@/views/threat/safetyOverview/index.vue'),
						meta: {
							title: 'message.router.threatOverview',
							isLink: '',
							isHide: false,
							isKeepAlive: true,
							isAffix: false,
							isIframe: false,
							roles: ['admin', 'common'],
							icon: 'iconfont icon-shuju',
						},
					},
					{
						path: '/threat/events',
						name: 'threatEvents',
						alias: ['/threat/alarm-list', '/alarmList'],
						component: () => import('/@/views/threat/alarmList/index.vue'),
						meta: {
							title: 'message.router.threatEvents',
							isLink: '',
							isHide: false,
							isKeepAlive: true,
							isAffix: false,
							isIframe: false,
							roles: ['admin', 'common'],
							icon: 'ele-WarnTriangleFilled',
						},
					},
					{
						path: '/threat/activity',
						name: 'threatActivity',
						alias: ['/threat/activity-list', '/activityList'],
						component: () => import('/@/views/threat/activityList/index.vue'),
						meta: {
							title: 'message.router.threatActivity',
							isLink: '',
							isHide: false,
							isKeepAlive: true,
							isAffix: false,
							isIframe: false,
							roles: ['admin', 'common'],
							icon: 'iconfont icon-bolangnengshiyanchang',
						},
					},
					{
						path: '/threat/kibana',
						name: 'threatKibana',
						alias: '/kibana',
						component: () => import('/@/layout/routerView/iframes.vue'),
						meta: {
							title: 'message.router.threatKibana',
							isLink: '/kibana/',
							isHide: false,
							isKeepAlive: true,
							isAffix: false,
							isIframe: true,
							roles: ['admin', 'common'],
							icon: 'iconfont icon-neiqianshujuchucun',
						},
					},
					{
						path: '/threat/entries',
						name: 'threatEntries',
						alias: ['/threat/sensitive-entry-list', '/sensitiveEntryList'],
						component: () => import('/@/views/threat/sensitiveEntryList/index.vue'),
						meta: {
							title: 'message.router.threatEntries',
							isLink: '',
							isHide: false,
							isKeepAlive: true,
							isAffix: false,
							isIframe: false,
							roles: ['admin', 'common'],
							icon: 'iconfont icon-caidan',
						},
					},
					{
						path: '/threat/blocks',
						name: 'threatBlocks',
						alias: ['/threat/block', '/threatBlock'],
						component: () => import('/@/views/threat/threatBlock/index.vue'),
						meta: {
							title: 'message.router.threatBlocks',
							isLink: '',
							isHide: false,
							isKeepAlive: true,
							isAffix: false,
							isIframe: false,
							roles: ['admin', 'common'],
							icon: 'ele-Box',
						},
					},

					{
						path: '/threat/whitelist',
						name: 'threatWhitelist',
						alias: ['/threat/white-list', '/whiteList'],
						component: () => import('/@/views/threat/whiteList/index.vue'),
						meta: {
							title: 'message.router.threatWhitelist',
							isLink: '',
							isHide: false,
							isKeepAlive: true,
							isAffix: false,
							isIframe: false,
							roles: ['admin', 'common'],
							icon: 'ele-DocumentChecked',
						},
					},
					{
						path: '/threat/rules',
						name: 'threatRules',
						alias: ['/threat/rule-manage', '/ruleManage'],
						component: () => import('/@/views/threat/ruleManage/index.vue'),
						meta: {
							title: 'message.router.threatRules',
							isLink: '',
							isHide: false,
							isKeepAlive: true,
							isAffix: false,
							isIframe: false,
							roles: ['admin', 'common'],
							icon: 'ele-Edit',
						},
					},
				],
			},
			{
				path: '/risk',
				name: 'risk',
				component: () => import('/@/layout/routerView/parent.vue'),
				redirect: '/risk/overview',
				meta: {
					title: 'message.router.risk',
					isLink: '',
					isHide: false,
					isKeepAlive: true,
					isAffix: false,
					isIframe: false,
					roles: ['admin', 'common'],
					icon: 'ele-Warning',
				},
				children: [
					{
						path: '/risk/overview',
						name: 'riskOverview',
						alias: '/riskOverview',
						component: () => import('/@/views/risk/riskOverview/index.vue'),
						meta: {
							title: 'message.router.riskOverview',
							isLink: '',
							isHide: false,
							isKeepAlive: true,
							isAffix: false,
							isIframe: false,
							roles: ['admin', 'common'],
							icon: 'iconfont icon-shuju',
						},
					},
					{
						path: '/risk/baseline',
						name: 'riskBaseline',
						alias: '/baseline',
						component: () => import('/@/views/risk/baseline/index.vue'),
						meta: {
							title: 'message.router.riskBaseline',
							isLink: '',
							isHide: false,
							isKeepAlive: true,
							isAffix: false,
							isIframe: false,
							roles: ['admin', 'common'],
							icon: 'ele-Lock',
						},
					},
					{
						path: '/risk/leaks',
						name: 'riskLeaks',
						alias: ['/risk/leak', '/leak'],
						component: () => import('/@/views/risk/leak/index.vue'),
						meta: {
							title: 'message.router.riskLeaks',
							isLink: '',
							isHide: false,
							isKeepAlive: true,
							isAffix: false,
							isIframe: false,
							roles: ['admin', 'common'],
							icon: 'ele-MagicStick',
						},
					},
					{
						path: '/risk/weakpwd',
						name: 'riskWeakpwd',
						alias: ['/risk/weak-pwd', '/weakpwd'],
						component: () => import('/@/views/risk/weakpwd/index.vue'),
						meta: {
							title: 'message.router.riskWeakpwd',
							isLink: '',
							isHide: false,
							isKeepAlive: true,
							isAffix: false,
							isIframe: false,
							roles: ['admin', 'common'],
							icon: 'iconfont icon-quanxian',
						},
					},
					{
						path: '/risk/tasks',
						name: 'riskTasks',
						alias: ['/risk/task', '/task'],
						component: () => import('/@/views/risk/task/index.vue'),
						meta: {
							title: 'message.router.riskTasks',
							isLink: '',
							isHide: false,
							isKeepAlive: true,
							isAffix: false,
							isIframe: false,
							roles: ['admin', 'common'],
							icon: 'iconfont icon-jinridaiban',
						},
					},
					{
						path: '/risk/rules',
						name: 'riskRules',
						alias: ['/risk/rule-config', '/ruleConfig'],
						component: () => import('/@/views/risk/ruleConfig/index.vue'),
						meta: {
							title: 'message.router.riskRules',
							isLink: '',
							isHide: false,
							isKeepAlive: true,
							isAffix: false,
							isIframe: false,
							roles: ['admin', 'common'],
							icon: 'ele-DocumentCopy',
						},
					},
				],
			},
			{
				path: '/settings',
				name: 'settings',
				alias: ['/sys-config', '/sysConfig'],
				component: () => import('/@/layout/routerView/parent.vue'),
				redirect: '/settings/domain',
				meta: {
					title: 'message.router.settings',
					isLink: '',
					isHide: false,
					isKeepAlive: true,
					isAffix: false,
					isIframe: false,
					roles: ['admin', 'common'],
					icon: 'iconfont icon-xitongshezhi',
				},
				children: [
					{
						path: '/settings/domain',
						name: 'settingsDomain',
						alias: ['/sys-config/domain-config', '/domainConfig'],
						component: () => import('/@/views/sysConfig/domainConfig/index.vue'),
						meta: {
							title: 'message.router.settingsDomain',
							isLink: '',
							isHide: false,
							isKeepAlive: true,
							isAffix: false,
							isIframe: false,
							roles: ['admin', 'common'],
							icon: 'ele-Connection',
						},
					},
					{
						path: '/me',
						name: 'me',
						alias: ['/sys-config/person', '/person'],
						component: () => import('/@/views/account/person/index.vue'),
						meta: {
							title: 'message.router.me',
							isLink: '',
							isHide: true,
							isKeepAlive: true,
							isAffix: false,
							isIframe: false,
							roles: ['admin', 'common'],
							icon: 'ele-User',
						},
					},
					{
						path: '/settings/users',
						name: 'settingsUsers',
						alias: ['/sys-config/account', '/account'],
						component: () => import('/@/views/account/management/index.vue'),
						meta: {
							title: 'message.router.settingsUsers',
							isLink: '',
							isHide: false,
							isKeepAlive: true,
							isAffix: false,
							isIframe: false,
							roles: ['admin', 'common'],
							icon: 'ele-UserFilled',
						},
					},
					{
						path: '/settings/system',
						name: 'settingsSystem',
						alias: ['/sys-config/system-info', '/system/systemInfo'],
						component: () => import('/@/views/system/systemInfo/index.vue'),
						meta: {
							title: 'message.router.settingsSystem',
							isLink: '',
							isHide: false,
							isKeepAlive: true,
							isAffix: false,
							isIframe: false,
							roles: ['admin', 'common'],
							icon: 'iconfont icon-diannao1',
						},
					},
					{
						path: '/settings/monitor',
						name: 'settingsMonitor',
						alias: ['/sys-config/monitor', '/system/monitor'],
						component: () => import('/@/views/system/monitor/index.vue'),
						meta: {
							title: 'message.router.settingsMonitor',
							isLink: '',
							isHide: false,
							isKeepAlive: true,
							isAffix: false,
							isIframe: false,
							roles: ['admin', 'common'],
							icon: 'ele-Monitor',
						},
					},
					{
						path: '/settings/ssh',
						name: 'settingsSsh',
						alias: ['/sys-config/webssh', '/system/webssh'],
						component: () => import('/@/views/system/webssh/index.vue'),
						meta: {
							title: 'message.router.settingsSsh',
							isLink: '',
							isHide: true,
							isKeepAlive: true,
							isAffix: false,
							isIframe: false,
							roles: ['admin', 'common'],
						},
					},
					{
						path: '/settings/notifications',
						name: 'settingsNotifications',
						alias: ['/sys-config/notify', '/notify'],
						component: () => import('/@/views/system/notify/index.vue'),
						meta: {
							title: 'message.router.settingsNotifications',
							isLink: '',
							isHide: false,
							isKeepAlive: true,
							isAffix: false,
							isIframe: false,
							roles: ['admin', 'common'],
							icon: 'iconfont icon-shouye_dongtaihui',
						},
					},
					{
						path: '/settings/messages',
						name: 'settingsMessages',
						alias: ['/sys-config/message', '/message'],
						component: () => import('/@/views/system/message/index.vue'),
						meta: {
							title: 'message.router.settingsMessages',
							isLink: '',
							isHide: false,
							isKeepAlive: true,
							isAffix: false,
							isIframe: false,
							roles: ['admin', 'common'],
							icon: 'ele-ChatDotRound',
						},
					},
					{
						path: '/settings/audit',
						name: 'settingsAudit',
						alias: ['/sys-config/audit', '/audit'],
						component: () => import('/@/views/system/audit/index.vue'),
						meta: {
							title: 'message.router.settingsAudit',
							isLink: '',
							isHide: false,
							isKeepAlive: true,
							isAffix: false,
							isIframe: false,
							roles: ['admin', 'common'],
							icon: 'ele-Notebook',
						},
					},
					{
						path: '/settings/reports',
						name: 'settingsReports',
						alias: ['/sys-config/export', '/export'],
						component: () => import('/@/views/system/export/index.vue'),
						meta: {
							title: 'message.router.settingsReports',
							isLink: '',
							isHide: false,
							isKeepAlive: true,
							isAffix: false,
							isIframe: false,
							roles: ['admin', 'common'],
							icon: 'iconfont icon-yunxiazai_o',
						},
					},
				],
			},
		],
	},
];

/**
 * Define the 404 and 401 pages
 * @link Reference: https://next.router.vuejs.org/zh/guide/essentials/history-mode.html#netlify
 */
export const notFoundAndNoPower = [
	{
		path: '/:path(.*)*',
		name: 'notFound',
		component: () => import('/@/views/error/404.vue'),
		meta: {
			title: 'message.staticRoutes.notFound',
			isHide: true,
		},
	},
	{
		path: '/401',
		name: 'noPower',
		component: () => import('/@/views/error/401.vue'),
		meta: {
			title: 'message.staticRoutes.noPower',
			isHide: true,
		},
	},
];

/**
 * Define static routes (default routes)
 * Leave these routes as-is. Add new frontend routes under `dynamicRoutes` instead.
 * @description Backend-controlled routing overwrites the first top-level `children` array in `dynamicRoutes`; these pages stay full-screen outside the layout outlet.
 * @returns The route menu definition
 */
export const staticRoutes: Array<RouteRecordRaw> = [
	{
		path: '/login',
		name: 'login',
		component: () => import('/@/views/login/index.vue'),
		meta: {
			title: 'message.staticRoutes.signIn',
		},
	},
];
