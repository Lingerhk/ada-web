import importToCDN from 'vite-plugin-cdn-import';

/**
 * Build-related helpers
 * Note: `prodUrl` differs between jsDelivr and unpkg because their paths may not match
 * Reference article: https://blog.csdn.net/qq_34450741/article/details/129766676 (uses jsDelivr)
 * @description importToCDN https://github.com/mmf-fe/vite-plugin-cdn-import
 * @description CDN URL configuration for online assets. Paths come from https://www.jsdelivr.com/ or https://unpkg.com/
 * @description `external` filters package imports during bundling. Reference: https://rollupjs.org/configuration-options/#external
 */
export const buildConfig = {
	cdn() {
		return importToCDN({
			prodUrl: 'https://unpkg.com/{name}@{version}/{path}',
			modules: [
				// autoComplete('vue'),
				// autoComplete('axios'),
				{
					name: 'vue',
					var: 'Vue',
					path: 'dist/vue.global.js',
				},
				{
					name: 'vue-router',
					var: 'VueRouter',
					path: 'dist/vue-router.global.js',
				},
				{
					name: 'element-plus',
					var: 'ElementPlus',
					path: 'dist/index.full.js',
				},
				// {
				// 	name: '@element-plus/icons-vue',
				// 	var: 'ElementPlusIconsVue',
				// 	path: 'dist/index.iife.min.js',
				// },
				// {
				// 	name: 'echarts',
				// 	var: 'echarts',
				// 	path: 'dist/echarts.min.js',
				// },
				// {
				// 	name: 'echarts-wordcloud',
				// 	var: 'echarts-wordcloud',
				// 	path: 'dist/echarts-wordcloud.min.js',
				// },
				// {
				// 	name: 'vue-i18n',
				// 	var: 'VueI18n',
				// 	path: 'dist/vue-i18n.global.min.js',
				// },
				// {
				// 	name: 'jsplumb',
				// 	var: 'jsPlumb',
				// 	path: 'dist/js/jsplumb.min.js',
				// },
				// {
				// 	name: 'cropperjs',
				// 	var: 'Cropper',
				// 	path: 'dist/cropper.min.js',
				// },
				// {
				// 	name: 'sortablejs',
				// 	var: 'Sortable',
				// 	path: 'Sortable.min.js',
				// },
				// {
				// 	name: 'qrcodejs2-fixes',
				// 	var: 'QRCode',
				// 	path: 'qrcode.min.js',
				// },
				// {
				// 	name: 'print-js',
				// 	var: 'printJS',
				// 	path: 'dist/print.min.js',
				// },
				// {
				// 	name: '@wangeditor/editor',
				// 	var: 'wangEditor',
				// 	path: 'dist/index.min.js',
				// },
				// {
				// 	name: '@wangeditor/editor-for-vue',
				// 	var: 'WangEditorForVue',
				// 	path: 'dist/index.min.js',
				// },
			],
		});
	},
	external: [
		'vue',
		// 'axios',
		'vue-router',
		'element-plus',
		// '@element-plus/icons-vue',
		// 'echarts',
		// 'echarts-wordcloud',
		// 'vue-i18n',
		// 'jsplumb',
		// 'cropperjs',
		// 'sortablejs',
		// 'qrcodejs2-fixes',
		// 'print-js',
		// '@wangeditor/editor',
		// '@wangeditor/editor-for-vue',
	],
};
