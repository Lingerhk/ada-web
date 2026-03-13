import { defineStore } from 'pinia';

/**
 * Cached route names
 * @methods setCacheKeepAlive Set the route names to cache when tagsView is enabled
 * @methods addCachedView Add route names to cache when tagsView is disabled
 * @methods delCachedView Remove route names from the cache when tagsView is disabled
 * @methods delOthersCachedViews Remove cached route names for `Close others` when tagsView is disabled
 * @methods delAllCachedViews Remove all cached route names when tagsView is disabled
 */
export const useKeepALiveNames = defineStore('keepALiveNames', {
	state: (): KeepAliveNamesState => ({
		keepAliveNames: [],
		cachedViews: [],
	}),
	actions: {
		async setCacheKeepAlive(data: Array<string>) {
			this.keepAliveNames = data;
		},
		async addCachedView(view: any) {
			if (view.meta.isKeepAlive) this.cachedViews?.push(view.name);
		},
		async delCachedView(view: any) {
			const index = this.cachedViews.indexOf(view.name);
			index > -1 && this.cachedViews.splice(index, 1);
		},
		async delOthersCachedViews(view: any) {
			if (view.meta.isKeepAlive) this.cachedViews = [view.name];
			else this.cachedViews = [];
		},
		async delAllCachedViews() {
			this.cachedViews = [];
		},
	},
});
