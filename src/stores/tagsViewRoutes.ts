import { defineStore } from 'pinia';
import { Session } from '/@/utils/storage';

/**
 * TagsView route list
 * @methods setTagsViewRoutes Set the tagsView route list
 * @methods setCurrenFullscreen Track the full-screen boolean state
 */
export const useTagsViewRoutes = defineStore('tagsViewRoutes', {
	state: (): TagsViewRoutesState => ({
		tagsViewRoutes: [],
		isTagsViewCurrenFull: false,
	}),
	actions: {
		async setTagsViewRoutes(data: Array<string>) {
			this.tagsViewRoutes = data;
		},
		setCurrenFullscreen(bool: Boolean) {
			Session.set('isTagsViewCurrenFull', bool);
			this.isTagsViewCurrenFull = bool;
		},
	},
});
