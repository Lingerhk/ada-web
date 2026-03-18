import request from '/@/utils/request';

/**
 * The following URLs are mock endpoints. Replace them with real endpoints if the Gitee sources are unavailable
 *
 * Avoid `request.post(xxx)` here because it makes it harder to send `params` and `data` together
 *
 * Mock JSON for backend-controlled menus lives at https://gitee.com/lyt-top/vue-next-admin-images/tree/master/menu
 * Backend-controlled routing is enabled when `isRequestRoutes` is `true`
 * @method getAdminMenu Get the backend dynamic menu for `admin`
 * @method getTestMenu Get the backend dynamic menu for `test`
 */
export function useMenuApi() {
	return {
		getAdminMenu: (params?: object) => {
			return request({
				url: '/gitee/lyt-top/vue-next-admin-images/raw/master/menu/adminMenu.json',
				method: 'get',
				params,
			});
		},
		getTestMenu: (params?: object) => {
			return request({
				url: '/gitee/lyt-top/vue-next-admin-images/raw/master/menu/testMenu.json',
				method: 'get',
				params,
			});
		},
	};
}
