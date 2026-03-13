import { defineStore } from 'pinia';

/**
 * Raw backend routes before normalization
 * @methods setCacheKeepAlive Store the raw backend route payload
 */
export const useRequestOldRoutes = defineStore('requestOldRoutes', {
	state: (): RequestOldRoutesState => ({
		requestOldRoutes: [],
	}),
	actions: {
		async setRequestOldRoutes(routes: Array<string>) {
			this.requestOldRoutes = routes;
		},
	},
});
