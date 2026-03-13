/**
 * mitt event type definitions
 *
 * @method openSetingsDrawer Open the layout settings drawer
 * @method restoreDefault Columns layout hover state updates
 * @method setSendColumnsChildren Pass columns-layout hover menu data into the `navMenu` menu
 * @method setSendClassicChildren Pass classic-layout split-menu data into the `navMenu` menu
 * @method getBreadcrumbIndexSetFilterRoutes When split menus are enabled from layout settings, pass the menu data into `navMenu`
 * @method layoutMobileResize Used when the browser window changes size to adapt the mobile layout
 * @method openOrCloseSortable Enable tagsView dragging from the layout settings drawer
 * @method openShareTagsView Enable shared tagsView from the layout settings drawer
 * @method onTagsViewRefreshRouterView Refresh the tagsView page
 * @method onCurrentContextmenuClick Handle each tagsView context-menu click
 */
declare type MittType<T = any> = {
	openSetingsDrawer?: string;
	restoreDefault?: string;
	setSendColumnsChildren: T;
	setSendClassicChildren: T;
	getBreadcrumbIndexSetFilterRoutes?: string;
	layoutMobileResize: T;
	openOrCloseSortable?: string;
	openShareTagsView?: string;
	onTagsViewRefreshRouterView?: T;
	onCurrentContextmenuClick?: T;
};

// mitt payload type definitions
declare type LayoutMobileResize = {
	layout: string;
	clientWidth: number;
};

// mitt menu payload type
declare type MittMenu = {
	children: RouteRecordRaw[];
	item?: RouteItem;
};
