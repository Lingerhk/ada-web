import { RouteRecordRaw } from 'vue-router';
import { storeToRefs } from 'pinia';
import pinia from '/@/stores/index';
import { useUserInfo } from '/@/stores/userInfo';
import { useRequestOldRoutes } from '/@/stores/requestOldRoutes';
import { Session } from '/@/utils/storage';
import { NextLoading } from '/@/utils/loading';
import { dynamicRoutes, notFoundAndNoPower } from '/@/router/route';
import { formatTwoStageRoutes, formatFlatteningRoutes, router } from '/@/router/index';
import { useRoutesList } from '/@/stores/routesList';
import { useTagsViewRoutes } from '/@/stores/tagsViewRoutes';
import { useMenuApi } from '/@/api/menu/index';

// Backend-controlled routing

// Import the API client
const menuApi = useMenuApi();

/**
 * Load all .vue and .tsx files under the target directories
 * @method import.meta.glob
 * @link Reference: https://cn.vitejs.dev/guide/features.html#json
 */
const layouModules: any = import.meta.glob('../layout/routerView/*.{vue,tsx}');
const viewsModules: any = import.meta.glob('../views/**/*.{vue,tsx}');
const dynamicViewsModules: Record<string, Function> = Object.assign({}, { ...layouModules }, { ...viewsModules });

/**
 * Initialize backend-controlled routing so server routes survive a page refresh
 * @method NextLoading.start Start the page loading animation
 * @method useUserInfo().setUserInfos Initialize the Pinia user store
 * @method useRequestOldRoutes().setRequestOldRoutes Persist the raw backend route payload before component normalization
 * @method setAddRoute Register dynamic routes
 * @method setFilterMenuAndCacheTagsViewRoutes Store routes in Pinia and cache the flattened result
 */
export async function initBackEndControlRoutes() {
	// start the page loading animation
	if (window.nextLoading === undefined) NextLoading.start();
	// stop here if no token is present
	if (!Session.get('token')) return false;
	// initialize the Pinia user store
	// https://gitee.com/lyt-top/vue-next-admin/issues/I5F1HP
	await useUserInfo().setUserInfos();
	// Fetch the route menu payload from the backend.
	const res = await getBackEndControlRoutes();
	// guard against users without login permissions
	// https://gitee.com/lyt-top/vue-next-admin/issues/I64HVO
	if (res.data.length <= 0) return Promise.resolve(true);
	// Preserve the raw backend response before mapping component imports.
	useRequestOldRoutes().setRequestOldRoutes(JSON.parse(JSON.stringify(res.data)));
	// Replace the first top-level `children` array with component-aware backend routes.
	dynamicRoutes[0].children = await backEndComponent(res.data);
	// Add dynamic routes
	await setAddRoute();
	// store routes in Pinia routesList and cache the flattened route array
	setFilterMenuAndCacheTagsViewRoutes();
}

/**
 * store routes in Pinia routesList and cache the flattened route array
 * @description Used by the sidebar and top navigation menus
 * @description Used by tagsView and menu search, including hidden routes
 */
export async function setFilterMenuAndCacheTagsViewRoutes() {
	const storesRoutesList = useRoutesList(pinia);
	storesRoutesList.setRoutesList(dynamicRoutes[0].children as any);
	setCacheTagsViewRoutes();
}

/**
 * Cache the flattened route array generated from a nested route tree
 * @description Used by tagsView and menu search, including hidden routes
 */
export function setCacheTagsViewRoutes() {
	const storesTagsView = useTagsViewRoutes(pinia);
	storesTagsView.setTagsViewRoutes(formatTwoStageRoutes(formatFlatteningRoutes(dynamicRoutes))[0].children);
}

/**
 * Normalize routes and append the 404 and 401 pages
 * @description Replaces the first top-level `children` array in `dynamicRoutes`
 * @returns The normalized route array with fallback pages appended
 */
export function setFilterRouteEnd() {
	let filterRouteEnd: any = formatTwoStageRoutes(formatFlatteningRoutes(dynamicRoutes));
	// notFoundAndNoPower Keep the 404 and 401 pages inside the layout; otherwise they render full screen
	// Related issue: "No match found for location with path xxx"
	filterRouteEnd[0].children = [...filterRouteEnd[0].children, ...notFoundAndNoPower];
	return filterRouteEnd;
}

/**
 * Add dynamic routes
 * @method router.addRoute
 * @description Iterates over the first top-level `children` array in `dynamicRoutes` from `/@/router/route`, which is kept flat here
 * @link Reference: https://next.router.vuejs.org/zh/api/#addroute
 */
export async function setAddRoute() {
	await setFilterRouteEnd().forEach((route: RouteRecordRaw) => {
		router.addRoute(route);
	});
}

/**
 * Request backend route menu data
 * @description Used only when `isRequestRoutes` is `true`
 * @returns The backend route menu response
 */
export function getBackEndControlRoutes() {
	// Mock admin and test roles
	const stores = useUserInfo(pinia);
	const { userInfos } = storeToRefs(stores);
	const auth = userInfos.value.roles[0];
	// Administrator role
	if (auth === 'admin') return menuApi.getAdminMenu();
	// Other test users
	else return menuApi.getTestMenu();
}

/**
 * Refresh backend route menu data
 * @description Intended for menu-management refresh flows and currently not exercised elsewhere
 * @description Path: `/src/views/system/menu/component/addMenu.vue`
 */
export async function setBackEndControlRefreshRoutes() {
	await getBackEndControlRoutes();
}

/**
 * Map backend route component paths to lazy imports
 * @param routes Route table returned by the backend
 * @returns Routes whose `component` fields have been converted to lazy imports
 */
export function backEndComponent(routes: any) {
	if (!routes) return;
	return routes.map((item: any) => {
		if (item.component) item.component = dynamicImport(dynamicViewsModules, item.component as string);
		item.children && backEndComponent(item.children);
		return item;
	});
}

/**
 * Resolve a backend component path into a lazy import
 * @param dynamicViewsModules Every `.vue` and `.tsx` file available under the target directories
 * @param component The backend component path to resolve
 * @returns The matched lazy-import factory
 */
export function dynamicImport(dynamicViewsModules: Record<string, Function>, component: string) {
	const keys = Object.keys(dynamicViewsModules);
	const matchKeys = keys.filter((key) => {
		const k = key.replace(/..\/views|../, '');
		return k.startsWith(`${component}`) || k.startsWith(`/${component}`);
	});
	if (matchKeys?.length === 1) {
		const matchKey = matchKeys[0];
		return dynamicViewsModules[matchKey];
	}
	if (matchKeys?.length > 1) {
		return false;
	}
}
