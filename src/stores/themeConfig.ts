import { defineStore } from 'pinia';

/**
 * Layout settings
 * Fix: https://gitee.com/lyt-top/vue-next-admin/issues/I567R1, thanks to @lanbao123
 * 2020-05-28 by lyt: improved development-time config reloading.
 * When changing defaults:
 * 1. Clear the persistent `window.localStorage` cache.
 * 2. Or click the `Restore Defaults` action at the bottom of the layout settings drawer.
 */
export const useThemeConfig = defineStore('themeConfig', {
	state: (): ThemeConfigState => ({
		themeConfig: {
			// Whether to show the layout settings drawer.
			isDrawer: false,

			/**
			 * Global theme
			 */
			// Default primary theme color.
			primary: '#409eff',
			// Whether dark mode is enabled.
			isIsDark: false,

			/**
			 * Top bar
			 */
			// Default top bar background color.
			topBar: '#ffffff',
			// Default top bar text color.
			topBarColor: '#606266',
			// Whether to apply a gradient to the top bar background.
			isTopBarColorGradual: false,

			/**
			 * Menu
			 */
			// Default menu background color.
			menuBar: '#545c64',
			// Default menu text color.
			menuBarColor: '#eaeaea',
			// Default active menu background color.
			menuBarActiveColor: 'rgba(0, 0, 0, 0.2)',
			// Whether to apply a gradient to the menu background.
			isMenuBarColorGradual: false,

			/**
			 * Columns layout
			 */
			// Default columns-menu background color.
			columnsMenuBar: '#545c64',
			// Default columns-menu text color.
			columnsMenuBarColor: '#e6e6e6',
			// Whether to apply a gradient to the columns-menu background.
			isColumnsMenuBarColorGradual: false,
			// Whether hovering a columns-menu item preloads its previewed menu.
			isColumnsMenuHoverPreload: false,

			/**
			 * Layout behavior
			 */
			// Whether the menu can collapse horizontally.
			isCollapse: false,
			// Whether the menu uses accordion behavior.
			isUniqueOpened: true,
			// Whether the header is fixed.
			isFixedHeader: false,
			// Internal flag used to recalculate the menu `el-scrollbar` height. Do not remove.
			isFixedHeaderChange: false,
			// Whether classic layout splits the menu; only applies in classic mode.
			isClassicSplitMenu: false,
			// Whether auto lock-screen is enabled.
			isLockScreen: false,
			// Auto lock-screen timeout in seconds.
			lockScreenTime: 30,

			/**
			 * Visible UI features
			 */
			// Whether the sidebar logo is shown.
			isShowLogo: true,
			// Internal flag used to recalculate `el-scrollbar` height. Do not remove.
			isShowLogoChange: false,
			// Whether breadcrumbs are shown. Classic and transverse layouts force this off.
			isBreadcrumb: true,
			// Whether tagsView is enabled.
			isTagsview: true,
			// Whether breadcrumb icons are shown.
			isBreadcrumbIcon: false,
			// Whether tagsView icons are shown.
			isTagsviewIcon: false,
			// Whether tagsView pages are cached.
			isCacheTagsView: false,
			// Whether tagsView tabs can be reordered by dragging.
			isSortableTagsView: true,
			// Whether tagsView is shared across layout modes.
			isShareTagsView: false,
			// Whether the footer copyright block is shown.
			isFooter: true,
			// Whether grayscale mode is enabled.
			isGrayscale: false,
			// Whether high-contrast inverted mode is enabled.
			isInvert: false,
			// Whether the watermark overlay is enabled.
			isWartermark: false,
			// Watermark text.
			wartermarkText: '',

			/**
			 * Other settings
			 */
			// tagsView style. Supported values: "<tags-style-one|tags-style-four|tags-style-five>". Default: `tags-style-five`.
			// The value must match a class defined in `/src/layout/navBars/tagsView/tagsView.vue`.
			tagsStyle: 'tags-style-five',
			// Main page transition animation. Supported values: "<slide-right|slide-left|opacitys>". Default: `slide-right`.
			animation: 'slide-right',
			// Columns-menu highlight style. Supported values: "<columns-round|columns-card>". Default: `columns-round`.
			columnsAsideStyle: 'columns-round',
			// Columns-menu layout style. Supported values: "<columns-horizontal|columns-vertical>". Default: `columns-horizontal`.
			columnsAsideLayout: 'columns-vertical',

			/**
			 * Layout mode
			 * For demo purposes, switching layouts resets theme colors to their defaults.
			 * See `initSetLayoutChange()` in `/@/layout/navBars/topBar/setings.vue`.
			 */
			// Layout mode. Supported values: "<defaults|classic|transverse|columns>". Default: `defaults`.
			layout: 'defaults',

			/**
			 * Backend-controlled routing
			 */
			// Whether backend-controlled routing is enabled.
			isRequestRoutes: false,

			/**
			 * Global site title and subtitle
			 */
			// Main site title used in navigation and the browser tab.
			globalTitle: 'ADAegis',
			// Subtitle shown at the top of the login page.
			globalViceTitle: 'AD Aegis Protection',
			// Supporting login-page subtitle text.
			globalViceTitleMsg: 'AD Aegis Protection',
			// Default locale. Supported values: "<zh-cn|en>". Default: `zh-cn`.
			globalI18n: 'zh-cn',
			// Default global component size. Supported values: "<large|'default'|small>". Default: `default`.
			globalComponentSize: 'default',
		},
	}),
	actions: {
		setThemeConfig(data: ThemeConfigState) {
			this.themeConfig = data.themeConfig;
		},
	},
});
