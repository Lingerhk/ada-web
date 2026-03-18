import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';
import plaintext from 'highlight.js/lib/languages/plaintext';
import powershell from 'highlight.js/lib/languages/powershell';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';

hljs.registerLanguage('bash', bash);
hljs.registerLanguage('json', json);
hljs.registerLanguage('plaintext', plaintext);
hljs.registerLanguage('powershell', powershell);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('yaml', yaml);

const normalizeLanguage = (lang: string) => {
	switch (lang.toLowerCase()) {
		case 'html':
		case 'svg':
		case 'xml':
			return 'xml';
		case 'yml':
		case 'yaml':
			return 'yaml';
		case 'ps1':
		case 'powershell':
			return 'powershell';
		case 'sh':
		case 'shell':
		case 'bash':
			return 'bash';
		case 'text':
		case 'txt':
		case '':
			return 'plaintext';
		default:
			return lang.toLowerCase();
	}
};

const marked = new Marked(
	markedHighlight({
		highlight(code, lang) {
			const language = normalizeLanguage(lang);
			return hljs.highlight(code, {
				language: hljs.getLanguage(language) ? language : 'plaintext',
			}).value;
		},
	})
);

export const md2html = (md: string) => {
	return marked.parse(md);
};
