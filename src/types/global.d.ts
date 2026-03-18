// Declare external npm plugin modules
declare module 'js-cookie';
declare module 'qs';
declare module 'sortablejs';

// Declare a module so importing the file does not raise type errors
declare module '*.json';
declare module '*.png';
declare module '*.jpg';
declare module '*.scss';
declare module '*.ts';
declare module '*.js';

// Declare `*.vue` files so Vue handles them
declare module '*.vue' {
	import type { DefineComponent } from 'vue';
	const component: DefineComponent<{}, {}, any>;
	export default component;
}

// Declare global variables
/* eslint-disable */
declare interface Window {
	nextLoading: boolean;
	BMAP_SATELLITE_MAP: any;
	BMap: any;
}

// Declare the current-route item type
declare type RouteItem<T = any> = {
	path: string;
	name?: string | symbol | undefined | null;
	redirect?: string;
	k?: T;
	meta?: {
		title?: string;
		isLink?: string;
		isHide?: boolean;
		isKeepAlive?: boolean;
		isAffix?: boolean;
		isIframe?: boolean;
		roles?: string[];
		icon?: string;
		isDynamic?: boolean;
		isDynamicPath?: string;
		isIframeOpen?: string;
		loading?: boolean;
	};
	children: T[];
	query?: { [key: string]: T };
	params?: { [key: string]: T };
	contextMenuClickId?: string | number;
	commonUrl?: string;
	isFnClick?: boolean;
	url?: string;
	transUrl?: string;
	title?: string;
	id?: string | number;
};

// Declare route `to` and `from` types
declare interface RouteToFrom<T = any> extends RouteItem {
	path?: string;
	children?: T[];
}

// Declare the route-item type collection
declare type RouteItems<T extends RouteItem = any> = T[];

// Declare `ref`
declare type RefType<T = any> = T | null;

// Declare `HTMLElement`
declare type HtmlType = HTMLElement | string | undefined | null;

// Declare optional `children`
declare type ChilType<T = any> = {
	children?: T[];
};

// Declare array types
declare type EmptyArrayType<T = any> = T[];

// Declare object types
declare type EmptyObjectType<T = any> = {
	[key: string]: T;
};

// Declare select options
declare type SelectOptionType = {
	value: string | number;
	label: string | number;
};

// Handle mouse-wheel scrollingType
declare interface WheelEventType extends WheelEvent {
	wheelDelta: number;
}

// Shared table data type
declare interface TableType<T = any> {
	total: number;
	loading: boolean;
	param: {
		pageNum: number;
		pageSize: number;
		[key: string]: T;
	};
}

declare interface AdvancedSearchType {
	name: string;
	type: string;
	value: string[];
}
