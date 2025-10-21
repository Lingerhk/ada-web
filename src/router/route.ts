import path from 'path';
import { RouteRecordRaw } from 'vue-router';

/**
 * 建议：路由 path 路径与文件夹名称相同，找文件可浏览器地址找，方便定位文件位置
 *
 * 路由meta对象参数说明
 * meta: {
 *      title:          菜单栏及 tagsView 栏、菜单搜索名称（国际化）
 *      isLink：        是否超链接菜单，开启外链条件，`1、isLink: 链接地址不为空 2、isIframe:false`
 *      isHide：        是否隐藏此路由
 *      isKeepAlive：   是否缓存组件状态
 *      isAffix：       是否固定在 tagsView 栏上
 *      isIframe：      是否内嵌窗口，开启条件，`1、isIframe:true 2、isLink：链接地址不为空`
 *      roles：         当前路由权限标识，取角色管理。控制路由显示、隐藏。超级管理员：admin 普通角色：common
 *      icon：          菜单、tagsView 图标，阿里：加 `iconfont xxx`，fontawesome：加 `fa xxx`
 * }
 */

// 扩展 RouteMeta 接口
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
 * 定义动态路由
 * 前端添加路由，请在顶级节点的 `children 数组` 里添加
 * @description 未开启 isRequestRoutes 为 true 时使用（前端控制路由），开启时第一个顶级 children 的路由将被替换成接口请求回来的路由数据
 * @description 各字段请查看 `/@/views/system/menu/component/addMenu.vue 下的 ruleForm`
 * @returns 返回路由菜单数据
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
				name: 'riskMarketIndex',
				component: () => import('/@/views/riskMarket/index.vue'),
				meta: {
					title: 'message.router.riskMarketIndex',
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
				redirect: '/saftyOverview',
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
						path: '/saftyOverview',
						name: 'saftyOverviewIndex',
						component: () => import('/@/views/threat/saftyOverview/index.vue'),
						meta: {
							title: 'message.router.saftyOverviewIndex',
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
				redirect: '/dectectionOverview',
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
						path: '/detectionOverview',
						name: 'detectionOverviewIndex',
						component: () => import('/@/views/risk/detectionOverview/index.vue'),
						meta: {
							title: 'message.router.detectionOverviewIndex',
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
						path: '/outgoing',
						name: 'outgoingIndex',
						component: () => import('/@/views/system/outgoing/index.vue'),
						meta: {
							title: 'message.router.outgoingIndex',
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
 * 定义404、401界面
 * @link 参考：https://next.router.vuejs.org/zh/guide/essentials/history-mode.html#netlify
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
 * 定义静态路由（默认路由）
 * 此路由不要动，前端添加路由的话，请在 `dynamicRoutes 数组` 中添加
 * @description 前端控制直接改 dynamicRoutes 中的路由，后端控制不需要修改，请求接口路由数据时，会覆盖 dynamicRoutes 第一个顶级 children 的内容（全屏，不包含 layout 中的路由出口）
 * @returns 返回路由菜单数据
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
