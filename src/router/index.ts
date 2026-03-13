import { createRouter, createWebHashHistory } from 'vue-router';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import pinia from '/@/stores/index';
import { storeToRefs } from 'pinia';
import { useKeepALiveNames } from '/@/stores/keepAliveNames';
import { useRoutesList } from '/@/stores/routesList';
import { useThemeConfig } from '/@/stores/themeConfig';
import { Session } from '/@/utils/storage';
import { staticRoutes, notFoundAndNoPower } from '/@/router/route';
import { initFrontEndControlRoutes } from '/@/router/frontEnd';
import { initBackEndControlRoutes } from '/@/router/backEnd';

/**
 * Routing modes:
 * 1. Frontend-controlled routing: set `isRequestRoutes` to `false`, define `meta.roles`, and use `setFilterRoute`.
 * 2. Backend-controlled routing: set `isRequestRoutes` to `true`; route access then comes from the backend response.
 * The mode-specific logic lives in `frontEnd.ts` and `backEnd.ts` so each flow can evolve independently.
 *
 * Notes:
 * 1. Frontend-controlled routing keeps the menu tree in the frontend and expects role data in `userInfo`.
 * 2. Backend-controlled routing gets the menu tree from the server, typically alongside menu-management APIs.
 */

// Read the routing mode from `/src/stores/themeConfig.ts`.
const storesThemeConfig = useThemeConfig(pinia);
const { themeConfig } = storeToRefs(storesThemeConfig);
const { isRequestRoutes } = themeConfig.value;

/**
 * Create a router instance for the Vue application
 * @method createRouter(options: RouterOptions): Router
 * @link Reference: https://next.router.vuejs.org/zh/api/#createrouter
 */
export const router = createRouter({
	history: createWebHashHistory(),
	/**
	 * Notes:
	 * 1. `notFoundAndNoPower` is included here to avoid repeated router mismatch warnings.
	 * 2. The same fallback pages also need to be appended in `backEnd.ts` and `frontEnd.ts`.
	 * Keeping them in the layout prevents the 404 and 401 pages from rendering full-screen.
	 */
	routes: [...notFoundAndNoPower, ...staticRoutes],
});

/**
 * Flatten a nested route tree into a single-level array
 * @param arr Input route menu array
 * @returns Returns the flattened route array
 */
export function formatFlatteningRoutes(arr: any) {
	if (arr.length <= 0) return false;
	for (let i = 0; i < arr.length; i++) {
		if (arr[i].children) {
			arr = arr.slice(0, i + 1).concat(arr[i].children, arr.slice(i + 1));
		}
	}
	return arr;
}

/**
 * Convert a flat route list into a nested route tree while keeping only two levels so keep-alive works as expected
 * @description When `isKeepAlive` is enabled at the top level, route names are collected for the keep-alive include list
 * @link Reference: https://v3.cn.vuejs.org/api/built-in-components.html#keep-alive
 * @param arr The flattened route array
 * @returns Returns the array reshaped into the `dynamicRoutes` format
 */
export function formatTwoStageRoutes(arr: any) {
	if (arr.length <= 0) return false;
	const newArr: any = [];
	const cacheList: Array<string> = [];
	arr.forEach((v: any) => {
		if (v.path === '/') {
			newArr.push({ component: v.component, name: v.name, path: v.path, redirect: v.redirect, meta: v.meta, children: [] });
		} else {
			// Detect dynamic routes such as `xx/:id/:name` for tagsView and related features
			// Fix: https://gitee.com/lyt-top/vue-next-admin/issues/I3YX6G
			if (v.path.indexOf('/:') > -1) {
				v.meta['isDynamic'] = true;
				v.meta['isDynamicPath'] = v.path;
			}
			newArr[0].children.push({ ...v });
			// Store route names for use in keep-alive include lists
			// Path: /@/layout/routerView/parent.vue
			if (newArr[0].meta.isKeepAlive && v.meta.isKeepAlive) {
				cacheList.push(v.name);
				const stores = useKeepALiveNames(pinia);
				stores.setCacheKeepAlive(cacheList);
			}
		}
	});
	return newArr;
}

// Before each route navigation
router.beforeEach(async (to, from, next) => {
	NProgress.configure({ showSpinner: false });
	if (to.meta.title) NProgress.start();
	const token = Session.get('token');
	if (to.path === '/login' && !token) {
		next();
		NProgress.done();
	} else {
		if (!token) {
			next(`/login?redirect=${to.path}&params=${JSON.stringify(to.query ? to.query : to.params)}`);
			Session.clear();
			NProgress.done();
		} else if (token && to.path === '/login') {
			next('/dashboard');
			NProgress.done();
		} else {
			const storesRoutesList = useRoutesList(pinia);
			const { routesList } = storeToRefs(storesRoutesList);
			if (routesList.value.length === 0) {
				if (isRequestRoutes) {
					// Initialize backend-controlled routes on refresh so dynamic routes are restored.
					await initBackEndControlRoutes();
					// Re-enter the current route after dynamic registration to avoid landing on the 404 page after refresh.
					// Preserve `to.query` on refresh so normal-route parameters are not lost. Dynamic routes marked with `isDynamic` do not need special handling.
					next({ path: to.path, query: to.query });
				} else {
					// https://gitee.com/lyt-top/vue-next-admin/issues/I5F1HP
					await initFrontEndControlRoutes();
					next({ path: to.path, query: to.query });
				}
			} else {
				next();
			}
		}
	}
});

// After each route navigation
router.afterEach(() => {
	NProgress.done();
});

// Export the router
export default router;
