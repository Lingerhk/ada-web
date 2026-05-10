import { createI18n } from 'vue-i18n';
import pinia from '/@/stores/index';
import { storeToRefs } from 'pinia';
import { useThemeConfig } from '/@/stores/themeConfig';
import { Local } from '/@/utils/storage';

// Define the internationalization content

/**
 * Notes:
 * Create a folder under `pages` for each i18n-enabled page; matching the page directory and i18n directory names keeps lookup simple
 * Keep custom i18n keys distinct from the framework-level keys
 * 1. Files under `/src/i18n/lang` contain framework-level i18n messages
 * 2. Files under `/src/i18n/pages` contain page-specific i18n messages
 */

// Element Plus built-in i18n messages
import enLocale from 'element-plus/es/locale/lang/en';
import zhcnLocale from 'element-plus/es/locale/lang/zh-cn';

// Define reactive state and refs
const messages = {};
const element = { en: enLocale, 'zh-cn': zhcnLocale };
const itemize = { en: [], 'zh-cn': [] };
const modules: Record<string, any> = import.meta.glob('./**/*.ts', { eager: true });

// Group auto-imported modules by `en` and `zh-cn`
// https://vitejs.cn/vite3-cn/guide/features.html#glob-import
for (const path in modules) {
	const key = path.match(/(\S+)\/(\S+).ts/);
	if (itemize[key![2]]) itemize[key![2]].push(modules[path].default);
	else itemize[key![2]] = modules[path];
}

// Merge arrays of objects whose keys differ across items
function mergeArrObj<T>(list: T, key: string) {
	let obj = {};
	list[key].forEach((i: EmptyObjectType) => {
		obj = Object.assign({}, obj, i);
	});
	return obj;
}

// Build the final message structure
for (const key in itemize) {
	messages[key] = {
		name: key,
		el: element[key].el,
		message: mergeArrObj(itemize, key),
	};
}

// Read the default locale from Pinia
const stores = useThemeConfig(pinia);
const { themeConfig } = storeToRefs(stores);

type SupportedLocale = 'zh-cn' | 'en';

const normalizeLocale = (lang?: string | null): SupportedLocale | '' => {
	const normalizedLang = `${lang || ''}`.toLowerCase();
	if (normalizedLang.startsWith('zh')) return 'zh-cn';
	if (normalizedLang.startsWith('en')) return 'en';
	return '';
};

const getCachedLocale = (): SupportedLocale | '' => {
	try {
		return normalizeLocale(Local.get('themeConfig')?.globalI18n);
	} catch {
		return '';
	}
};

const getBrowserLocale = (): SupportedLocale | '' => {
	if (typeof navigator === 'undefined') return '';
	const browserLanguages = navigator.languages?.length ? navigator.languages : [navigator.language];
	for (const lang of browserLanguages) {
		const locale = normalizeLocale(lang);
		if (locale) return locale;
	}
	return 'en';
};

const initialLocale = getCachedLocale() || getBrowserLocale() || normalizeLocale(themeConfig.value.globalI18n) || 'zh-cn';
themeConfig.value.globalI18n = initialLocale;

// Export the i18n instance
// https://vue-i18n.intlify.dev/guide/essentials/fallback.html#explicit-fallback-with-one-locale
export const i18n = createI18n({
	legacy: false,
	silentTranslationWarn: true,
	missingWarn: false,
	silentFallbackWarn: true,
	fallbackWarn: false,
	locale: initialLocale,
	fallbackLocale: zhcnLocale.name,
	messages,
});
