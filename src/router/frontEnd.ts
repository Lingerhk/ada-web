import { RouteRecordRaw } from 'vue-router';
import { storeToRefs } from 'pinia';
import { formatTwoStageRoutes, formatFlatteningRoutes, router } from '/@/router/index';
import { dynamicRoutes, notFoundAndNoPower } from '/@/router/route';
import pinia from '/@/stores/index';
import { Session } from '/@/utils/storage';
import { useUserInfo } from '/@/stores/userInfo';
import { useTagsViewRoutes } from '/@/stores/tagsViewRoutes';
import { useRoutesList } from '/@/stores/routesList';
import { NextLoading } from '/@/utils/loading';

// Frontend-controlled routing

/**
 * Initialize frontend-controlled routing so dynamic routes survive a page refresh
 * @method NextLoading.start Start the page loading animation
 * @method useUserInfo(pinia).setUserInfos Initialize the Pinia user store
 * @method setAddRoute Register dynamic routes
 * @method setFilterMenuAndCacheTagsViewRoutes Filter routes by permission and cache the flattened result
 */
export async function initFrontEndControlRoutes() {
	// start the page loading animation
	if (window.nextLoading === undefined) NextLoading.start();
	// stop here if no token is present
	if (!Session.get('token')) return false;
	// initialize the Pinia user store
	// https://gitee.com/lyt-top/vue-next-admin/issues/I5F1HP
	await useUserInfo(pinia).setUserInfos();
	// guard against users without login permissions
	// https://gitee.com/lyt-top/vue-next-admin/issues/I64HVO
	if (useUserInfo().userInfos.roles.length <= 0) return Promise.resolve(true);
	// Add dynamic routes
	await setAddRoute();
	// recursively filter routes by permission, store them in Pinia routesList, and cache the flattened route array
	setFilterMenuAndCacheTagsViewRoutes();
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
 * Remove or reset dynamic routes
 * @method router.removeRoute
 * @description Iterates over the first top-level `children` array in `dynamicRoutes` from `/@/router/route`, which is kept flat here
 * @link Reference: https://next.router.vuejs.org/zh/api/#push
 */
export async function frontEndsResetRoute() {
	await setFilterRouteEnd().forEach((route: RouteRecordRaw) => {
		const routeName: any = route.name;
		router.hasRoute(routeName) && router.removeRoute(routeName);
	});
}

/**
 * Build the final dynamic route tree for the current user
 * @description Replaces the first top-level `children` array in `dynamicRoutes` from `/@/router/route`
 * @returns The normalized route array with 404 and 401 pages appended
 */
export function setFilterRouteEnd() {
	let filterRouteEnd: any = formatTwoStageRoutes(formatFlatteningRoutes(dynamicRoutes));
	// notFoundAndNoPower Keep the 404 and 401 pages inside the layout; otherwise they render full screen
	// Related issue: "No match found for location with path xxx"
	filterRouteEnd[0].children = [...setFilterRoute(filterRouteEnd[0].children), ...notFoundAndNoPower];
	return filterRouteEnd;
}

/**
 * Filter flat routes against the current user's role set
 * @description Used before calling `router.addRoute`
 * @link Reference: https://next.router.vuejs.org/zh/api/#addroute
 * @param chil Child routes under the first top-level `children` array in `dynamicRoutes`
 * @returns Routes that the current user is allowed to access
 */
export function setFilterRoute(chil: any) {
	const stores = useUserInfo(pinia);
	const { userInfos } = storeToRefs(stores);
	let filterRoute: any = [];
	chil.forEach((route: any) => {
		if (route.meta.roles) {
			route.meta.roles.forEach((metaRoles: any) => {
				userInfos.value.roles.forEach((roles: any) => {
					if (metaRoles === roles) filterRoute.push({ ...route });
				});
			});
		}
	});
	return filterRoute;
}

/**
 * Cache the flattened route array generated from a nested route tree
 * @description Used by tagsView and menu search, including hidden routes
 */
export function setCacheTagsViewRoutes() {
	// Filter routes first so tagsView and menu search do not expose unauthorized entries.
	const stores = useUserInfo(pinia);
	const storesTagsView = useTagsViewRoutes(pinia);
	const { userInfos } = storeToRefs(stores);
	let rolesRoutes = setFilterHasRolesMenu(dynamicRoutes, userInfos.value.roles);
	// Cache the result in the tagsView store.
	storesTagsView.setTagsViewRoutes(formatTwoStageRoutes(formatFlatteningRoutes(rolesRoutes))[0].children);
}

/**
 * recursively filter routes by permission, store them in Pinia routesList, and cache the flattened route array
 * @description Used by the sidebar and top navigation menus
 * @description Used by tagsView and menu search, including hidden routes
 */
export function setFilterMenuAndCacheTagsViewRoutes() {
	const stores = useUserInfo(pinia);
	const storesRoutesList = useRoutesList(pinia);
	const { userInfos } = storeToRefs(stores);
	storesRoutesList.setRoutesList(setFilterHasRolesMenu(dynamicRoutes[0].children, userInfos.value.roles));
	setCacheTagsViewRoutes();
}

/**
 * Check whether `route.meta.roles` includes any role assigned to the current user
 * @param roles Role identifiers from `userInfos.roles`
 * @param route The route being checked
 * @returns Whether the route should be visible to the current user
 */
export function hasRoles(roles: any, route: any) {
	if (route.meta && route.meta.roles) return roles.some((role: any) => route.meta.roles.includes(role));
	else return true;
}

/**
 * Recursively filter nested routes by the current user's roles
 * @param routes The current route children
 * @param roles Role identifiers from `userInfos.roles`
 * @returns The subset of routes allowed by `meta.roles`
 */
export function setFilterHasRolesMenu(routes: any, roles: any) {
	const menu: any = [];
	routes.forEach((route: any) => {
		const item = { ...route };
		if (hasRoles(roles, item)) {
			if (item.children) item.children = setFilterHasRolesMenu(item.children, roles);
			menu.push(item);
		}
	});
	return menu;
}
