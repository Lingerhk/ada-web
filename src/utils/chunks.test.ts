import { describe, expect, it } from 'vitest';

import { getManualChunk, getPackageName } from './chunks';

describe('chunk helpers', () => {
	it('extracts scoped package names', () => {
		expect(getPackageName('/tmp/node_modules/@protobuf-ts/runtime-rpc/build/index.js')).toBe('@protobuf-ts/runtime-rpc');
	});

	it('maps common vendors to configured manual chunks', () => {
		expect(getManualChunk('/tmp/node_modules/echarts/index.js')).toBe('vendor-charts');
		expect(getManualChunk('/tmp/node_modules/xterm/lib/xterm.js')).toBe('vendor-terminal');
		expect(getManualChunk('/tmp/node_modules/@protobuf-ts/runtime-rpc/build/index.js')).toBe('vendor-grpc');
	});

	it('keeps framework-heavy packages in vendor-misc to avoid startup cycles', () => {
		expect(getManualChunk('/tmp/node_modules/vue/dist/vue.runtime.esm-bundler.js')).toBe('vendor-misc');
		expect(getManualChunk('/tmp/node_modules/element-plus/es/index.mjs')).toBe('vendor-misc');
		expect(getManualChunk('/tmp/node_modules/codemirror-editor-vue3/dist/index.es.js')).toBe('vendor-misc');
		expect(getManualChunk('/tmp/node_modules/axios/index.js')).toBe('vendor-utils');
		expect(getManualChunk('/tmp/node_modules/codemirror/lib/codemirror.js')).toBe('vendor-editor');
		expect(getManualChunk('/tmp/node_modules/marked/lib/marked.esm.js')).toBe('vendor-markdown');
	});

	it('returns vendor-misc for unmatched third-party packages', () => {
		expect(getManualChunk('/tmp/node_modules/some-rare-package/index.js')).toBe('vendor-misc');
	});

	it('ignores first-party source files', () => {
		expect(getManualChunk('/home/project/src/main.ts')).toBeUndefined();
	});
});
