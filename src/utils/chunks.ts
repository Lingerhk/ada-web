const chunkGroups: Record<string, string[]> = {
	'vendor-charts': ['echarts', 'echarts-wordcloud', 'zrender'],
	'vendor-editor': ['codemirror'],
	'vendor-markdown': ['marked', 'marked-highlight', 'highlight.js'],
	'vendor-terminal': ['xterm', 'xterm-addon-attach', 'xterm-addon-fit'],
	'vendor-grpc': ['@protobuf-ts', '@grpc'],
	'vendor-utils': [
		'axios',
		'qs',
		'js-cookie',
		'js-yaml',
		'mitt',
		'nprogress',
		'screenfull',
		'sortablejs',
		'file-saver',
		'qrcode.vue',
		'vue-clipboard3',
		'vue3-json-viewer',
	],
};

export const getPackageName = (id: string) => {
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

export const getManualChunk = (id: string) => {
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

export { chunkGroups };
