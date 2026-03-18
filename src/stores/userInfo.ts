import { defineStore } from 'pinia';
import Cookies from 'js-cookie';
import { Session } from '/@/utils/storage';

/**
 * User info
 * @methods setUserInfos Set the user info
 */
export const useUserInfo = defineStore('userInfo', {
	state: (): UserInfosState => ({
		userInfos: {
			userName: '',
			photo: '',
			time: 0,
			roles: [],
			authBtnList: [],
		},
	}),
	actions: {
		async setUserInfos() {
			// Persist user info to browser storage
			if (Session.get('userInfo')) {
				this.userInfos = Session.get('userInfo');
			} else {
				const userInfos = <UserInfos>await this.getApiUserInfo();
				this.userInfos = userInfos;
			}
		},
		// Mock API data
		// https://gitee.com/lyt-top/vue-next-admin/issues/I5F1HP
		async getApiUserInfo() {
			return new Promise((resolve) => {
				setTimeout(() => {
					// Mock data. Remove this block and any related imports when wiring in the real API
					const userName = Cookies.get('userName');
					// Temporary mock values used to build the demo permission payload.
					let defaultRoles: Array<string> = [];
					let defaultAuthBtnList: Array<string> = [];
					// `admin` page permission keys mapped to `route.meta.roles`
					let adminRoles: Array<string> = ['admin'];
					// `admin` button permission keys
					let adminAuthBtnList: Array<string> = ['btn.add', 'btn.del', 'btn.edit', 'btn.link'];
					// `test` page permission keys mapped to `route.meta.roles`
					let testRoles: Array<string> = ['common'];
					// `test` button permission keys
					let testAuthBtnList: Array<string> = ['btn.add', 'btn.link'];
					// Simulate different permissions for different users
					if (userName === 'admin') {
						defaultRoles = adminRoles;
						defaultAuthBtnList = adminAuthBtnList;
					} else {
						defaultRoles = testRoles;
						defaultAuthBtnList = testAuthBtnList;
					}
					// Mock user-info payload
					const userInfos = {
						userName: userName,
						photo:
							userName === 'admin'
								? 'https://img2.baidu.com/it/u=1978192862,2048448374&fm=253&fmt=auto&app=138&f=JPEG?w=504&h=500'
								: 'https://img2.baidu.com/it/u=2370931438,70387529&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
						time: new Date().getTime(),
						roles: defaultRoles,
						authBtnList: defaultAuthBtnList,
					};
					Session.set('userInfo', userInfos);
					resolve(userInfos);
				}, 0);
			});
		},
	},
});
