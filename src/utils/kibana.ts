import request from '/@/utils/request';

/**
 * Kibana data view cache to avoid repeated API calls
 */
let dataViewIdCache: string | null = null;

/**
 * Get Kibana data-view-id for ada-activity index pattern using Kibana API
 * @returns Promise with the data-view-id
 */
export async function getKibanaDataViewId(): Promise<string> {
	// Return cached value if available
	if (dataViewIdCache) {
		return dataViewIdCache;
	}

	try {
		// Use Kibana Data Views API to get all data views
		// Kibana API endpoint: /api/data_views
		const response = await request({
			url: '/kibana/api/data_views',
			method: 'get',
			headers: {
				'kbn-xsrf': 'true'
			}
		});

		// Response format: { data_view: [...] }
		if (response?.data_view && Array.isArray(response.data_view)) {
			// Find the data view with title 'ada-activity'
			const adaActivityView = response.data_view.find((view: any) =>
				view.title === 'ada-activity'
			);

			if (adaActivityView && adaActivityView.id) {
				// Cache the result
				dataViewIdCache = adaActivityView.id;
				return adaActivityView.id;
			}
		}

		throw new Error('ada-activity data view not found in Kibana');
	} catch (error) {
		throw error;
	}
}

/**
 * Build Kibana single document URL
 * @param docId - The document ID (eid from fieldData)
 * @param dataViewId - The Kibana data-view-id
 * @returns Full Kibana URL
 */
export function buildKibanaSingleDocUrl(docId: string, dataViewId: string): string {
	const baseUrl = window.location.origin;
	return `${baseUrl}/kibana/app/discover#/doc/${dataViewId}/ada-activity?id=${docId}`;
}

/**
 * Open Kibana document in new tab
 * @param docId - The document ID (eid from fieldData)
 */
export async function openKibanaDocInNewTab(docId: string): Promise<void> {
	try {
		const dataViewId = await getKibanaDataViewId();
		const kibanaUrl = buildKibanaSingleDocUrl(docId, dataViewId);

		// Open in new tab
		window.open(kibanaUrl, '_blank', 'noopener,noreferrer');
	} catch (error) {
		throw error;
	}
}

/**
 * Clear the cached data-view-id (useful for testing or when data view changes)
 */
export function clearKibanaCache(): void {
	dataViewIdCache = null;
}
