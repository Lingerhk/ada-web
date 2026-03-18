import type { App } from 'vue';
import { useUserInfo } from '/@/stores/userInfo';
import { judementSameArr } from '/@/utils/arrayOperation';

/**
 * User-permission directive
 * @directive Single-permission check (`v-auth="xxx"`)
 * @directive Multi-permission check that shows when any permission matches (`v-auths="[xxx,xxx]"`)
 * @directive Multi-permission check that shows only when all permissions match (`v-auth-all="[xxx,xxx]"`)
 */
export function authDirective(app: App) {
	// Single-permission check (`v-auth="xxx"`)
	app.directive('auth', {
		mounted(el, binding) {
			const stores = useUserInfo();
			if (!stores.userInfos.authBtnList.some((v: string) => v === binding.value)) el.parentNode.removeChild(el);
		},
	});
	// Show when any permission matches (`v-auths="[xxx,xxx]"`)
	app.directive('auths', {
		mounted(el, binding) {
			let flag = false;
			const stores = useUserInfo();
			stores.userInfos.authBtnList.map((val: string) => {
				binding.value.map((v: string) => {
					if (val === v) flag = true;
				});
			});
			if (!flag) el.parentNode.removeChild(el);
		},
	});
	// Show only when all permissions match (`v-auth-all="[xxx,xxx]"`)
	app.directive('auth-all', {
		mounted(el, binding) {
			const stores = useUserInfo();
			const flag = judementSameArr(binding.value, stores.userInfos.authBtnList);
			if (!flag) el.parentNode.removeChild(el);
		},
	});
}
