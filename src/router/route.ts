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
				name: 'dashboardIndex',
				component: () => import('/@/views/dashboard/index.vue'),
				meta: {
					title: 'message.router.dashboardIndex',
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
				name: 'threatIndex',
				component: () => import('/@/layout/routerView/parent.vue'),
				redirect: '/safetyOverview',
				meta: {
					title: 'message.router.threatIndex',
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
						path: '/safetyOverview',
						name: 'safetyOverviewIndex',
						component: () => import('/@/views/threat/safetyOverview/index.vue'),
						meta: {
							title: 'message.router.safetyOverviewIndex',
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
						path: '/saftyOverview',
						name: 'legacySafetyOverviewIndex',
						redirect: '/safetyOverview',
						meta: {
							isHide: true,
						},
					},
					{
						path: '/alarmList',
						name: 'alarmListIndex',
						component: () => import('/@/views/threat/alarmList/index.vue'),
						meta: {
							title: 'message.router.alarmListIndex',
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
						path: '/activityList',
						name: 'activityListIndex',
						component: () => import('/@/views/threat/activityList/index.vue'),
						meta: {
							title: 'message.router.activityListIndex',
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
						path: '/kibana',
						name: 'threatKibana',
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
						path: '/sensitiveEntryList',
						name: 'sensitiveEntryListListIndex',
						component: () => import('/@/views/threat/sensitiveEntryList/index.vue'),
						meta: {
							title: 'message.router.sensitiveEntryListIndex',
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
						path: '/threatBlock',
						name: 'threatBlockIndex',
						component: () => import('/@/views/threat/threatBlock/index.vue'),
						meta: {
							title: 'message.router.threatBlockIndex',
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
						path: '/whiteList',
						name: 'whiteListIndex',
						component: () => import('/@/views/threat/whiteList/index.vue'),
						meta: {
							title: 'message.router.whiteListIndex',
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
						path: '/ruleManage',
						name: 'ruleManageIndex',
						component: () => import('/@/views/threat/ruleManage/index.vue'),
						meta: {
							title: 'message.router.ruleManageIndex',
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
				name: 'riskIndex',
				component: () => import('/@/layout/routerView/parent.vue'),
				redirect: '/riskOverview',
				meta: {
					title: 'message.router.riskIndex',
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
						path: '/riskOverview',
						name: 'riskOverviewIndex',
						component: () => import('/@/views/risk/riskOverview/index.vue'),
						meta: {
							title: 'message.router.riskOverviewIndex',
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
						path: '/baseline',
						name: 'baselineIndex',
						component: () => import('/@/views/risk/baseline/index.vue'),
						meta: {
							title: 'message.router.baselineIndex',
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
						path: '/leak',
						name: 'leakIndex',
						component: () => import('/@/views/risk/leak/index.vue'),
						meta: {
							title: 'message.router.leakIndex',
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
						path: '/weakpwd',
						name: 'weakpwdIndex',
						component: () => import('/@/views/risk/weakpwd/index.vue'),
						meta: {
							title: 'message.router.weakpwdIndex',
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
						path: '/task',
						name: 'taskIndex',
						component: () => import('/@/views/risk/task/index.vue'),
						meta: {
							title: 'message.router.taskIndex',
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
						path: '/ruleConfig',
						name: 'ruleConfigIndex',
						component: () => import('/@/views/risk/ruleConfig/index.vue'),
						meta: {
							title: 'message.router.ruleConfigIndex',
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
				path: '/sysConfig',
				name: 'sycConfigIndex',
				component: () => import('/@/layout/routerView/parent.vue'),
				redirect: '/domainConfig',
				meta: {
					title: 'message.router.sycConfigIndex',
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
						path: '/domainConfig',
						name: 'domainConfigIndex',
						component: () => import('/@/views/sysConfig/domainConfig/index.vue'),
						meta: {
							title: 'message.router.domainConfigIndex',
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
						path: '/person',
						name: 'personIndex',
						component: () => import('/@/views/account/person/index.vue'),
						meta: {
							title: 'message.router.accountPersonIndex',
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
						path: '/account',
						name: 'accountManagementIndex',
						component: () => import('/@/views/account/management/index.vue'),
						meta: {
							title: 'message.router.accountManagementIndex',
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
						path: '/system/systemInfo',
						name: 'systemInfoIndex',
						component: () => import('/@/views/system/systemInfo/index.vue'),
						meta: {
							title: 'message.router.systemInfoIndex',
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
						path: '/system/monitor',
						name: 'monitorIndex',
						component: () => import('/@/views/system/monitor/index.vue'),
						meta: {
							title: 'message.router.monitorIndex',
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
						path: '/system/webssh',
						name: 'websshIndex',
						component: () => import('/@/views/system/webssh/index.vue'),
						meta: {
							title: 'message.router.websshIndex',
							isLink: '',
							isHide: true,
							isKeepAlive: true,
							isAffix: false,
							isIframe: false,
							roles: ['admin', 'common'],
						},
					},
					{
						path: '/notify',
						name: 'notifyIndex',
						component: () => import('/@/views/system/notify/index.vue'),
						meta: {
							title: 'message.router.notifyIndex',
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
						path: '/message',
						name: 'messageIndex',
						component: () => import('/@/views/system/message/index.vue'),
						meta: {
							title: 'message.router.messageIndex',
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
						path: '/audit',
						name: 'auditIndex',
						component: () => import('/@/views/system/audit/index.vue'),
						meta: {
							title: 'message.router.auditIndex',
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
						path: '/export',
						name: 'exportIndex',
						component: () => import('/@/views/system/export/index.vue'),
						meta: {
							title: 'message.router.exportIndex',
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
			title: '登录',
		},
	},
];
