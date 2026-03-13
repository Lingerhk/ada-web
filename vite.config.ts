import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import { URL } from 'url';
import { defineConfig, loadEnv, ConfigEnv } from 'vite';
import vueSetupExtend from 'vite-plugin-vue-setup-extend-plus';
import viteCompression from 'vite-plugin-compression';
import { buildConfig } from './src/utils/build';

const pathResolve = (dir: string) => {
	return resolve(new URL('.', import.meta.url).pathname, dir);
};

const alias: Record<string, string> = {
	'/@': pathResolve('./src/'),
	'vue-i18n': 'vue-i18n/dist/vue-i18n.cjs.js',
};

const chunkGroups: Record<string, string[]> = {
	'vendor-vue': ['vue', 'vue-router', 'pinia', 'vue-i18n', '@vue', '@intlify', 'mitt', 'nprogress'],
	'vendor-ui': [
		'element-plus',
		'@element-plus/icons-vue',
		'@element-plus',
		'@ctrl',
		'@floating-ui',
		'@popperjs',
		'async-validator',
		'dayjs',
		'lodash',
		'lodash-es',
		'lodash-unified',
	],
	'vendor-charts': ['echarts', 'echarts-wordcloud', 'zrender'],
	'vendor-editor': ['codemirror', 'codemirror-editor-vue3', 'diff-match-patch', 'js-yaml', 'marked', 'marked-highlight', 'highlight.js'],
	'vendor-terminal': ['xterm', 'xterm-addon-attach', 'xterm-addon-fit'],
	'vendor-grpc': ['@protobuf-ts', '@grpc'],
	'vendor-utils': ['axios', 'file-saver', 'js-cookie', 'qs', 'qrcode.vue', 'screenfull', 'sortablejs', 'vue-clipboard3', 'vue3-json-viewer'],
};

const parseEnvBoolean = (value: string | undefined, defaultValue = false) => {
	if (value === undefined) return defaultValue;
	return value === 'true';
};

const getPackageName = (id: string) => {
	const parts = id.split('node_modules/');
	if (parts.length < 2) return null;
	const packagePath = parts.at(-1);
	if (!packagePath) return null;
	const segments = packagePath.split('/');
	if (segments[0].startsWith('@') && segments.length > 1) {
		return `${segments[0]}/${segments[1]}`;
	}
	return segments[0];
};

const getManualChunk = (id: string) => {
	if (!id.includes('node_modules')) return undefined;
	const packageName = getPackageName(id);
	if (!packageName) return 'vendor-misc';

	for (const [chunkName, packages] of Object.entries(chunkGroups)) {
		if (packages.some((name) => packageName === name || packageName.startsWith(`${name}/`))) {
			return chunkName;
		}
	}

	return 'vendor-misc';
};

const viteConfig = defineConfig((mode: ConfigEnv) => {
	const env = loadEnv(mode.mode, process.cwd());
	const isOpenCdn = parseEnvBoolean(env.VITE_OPEN_CDN);
	const isOpenBrowser = parseEnvBoolean(env.VITE_OPEN);
	return {
		plugins: [vue(), vueSetupExtend(), viteCompression(), isOpenCdn ? buildConfig.cdn() : null],
		root: process.cwd(),
		resolve: { alias },
		base: mode.command === 'serve' ? './' : env.VITE_PUBLIC_PATH || './',
		server: {
			host: '0.0.0.0',
			port: Number(env.VITE_PORT || 8888),
			open: isOpenBrowser,
			hmr: true,
			proxy: {
				'/kibana': {
					target: env.VITE_ADA_API_URL || 'http://localhost:80',
					ws: true,
					changeOrigin: true,
					secure: false,
				},
			},
		},
		build: {
			outDir: 'dist',
			chunkSizeWarningLimit: 1500,
			rollupOptions: {
				output: {
					chunkFileNames: 'assets/js/[name]-[hash].js',
					entryFileNames: 'assets/js/[name]-[hash].js',
					assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
					manualChunks: getManualChunk,
				},
				...(isOpenCdn ? { external: buildConfig.external } : {}),
			},
		},
		css: {},
		define: {
			__VUE_I18N_LEGACY_API__: JSON.stringify(false),
			__VUE_I18N_FULL_INSTALL__: JSON.stringify(false),
			__INTLIFY_PROD_DEVTOOLS__: JSON.stringify(false),
			__NEXT_VERSION__: JSON.stringify(process.env.npm_package_version),
			__NEXT_NAME__: JSON.stringify(process.env.npm_package_name),
		},
	};
});

export default viteConfig;
