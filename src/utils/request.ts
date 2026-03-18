import axios, { AxiosInstance } from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import { i18n } from '/@/i18n';
import { Session } from '/@/utils/storage';
import qs from 'qs';

// Create a dedicated Axios instance
const service: AxiosInstance = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	timeout: 50000,
	headers: { 'Content-Type': 'application/json' },
	paramsSerializer: {
		serialize(params) {
			return qs.stringify(params, { allowDots: true });
		},
	},
});

// Add a request interceptor
service.interceptors.request.use(
	(config) => {
		// Inject the token before sending the request
		if (Session.get('token')) {
			config.headers!['Authorization'] = `${Session.get('token')}`;
		}
		return config;
	},
	(error) => {
		// Handle request errors
		return Promise.reject(error);
	}
);

// Add a response interceptor
service.interceptors.response.use(
	(response) => {
		// Handle successful responses
		const res = response.data;
		if (res.code && res.code !== 0) {
			// The token expired or the account signed in elsewhere
			if (res.code === 401 || res.code === 4001) {
				Session.clear(); // Clear all temporary browser storage
				window.location.href = '/'; // Redirect to the login page
				ElMessageBox.alert(i18n.global.t('message.api.loggedOutMessage'), i18n.global.t('message.api.loggedOutTitle'), {})
					.then(() => {})
					.catch(() => {});
			}
			return Promise.reject(service.interceptors.response);
		} else {
			return res;
		}
	},
	(error) => {
		// Handle response errors
		if (error.message.indexOf('timeout') != -1) {
			ElMessage.error(i18n.global.t('message.api.networkTimeout'));
		} else if (error.message == 'Network Error') {
			ElMessage.error(i18n.global.t('message.api.networkError'));
		} else {
			if (error.response.data) ElMessage.error(error.response.statusText);
			else ElMessage.error(i18n.global.t('message.api.missingEndpoint'));
		}
		return Promise.reject(error);
	}
);

// Export the Axios instance
export default service;
