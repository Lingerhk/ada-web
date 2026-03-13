import axios, { AxiosInstance } from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
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
				ElMessageBox.alert('你已被登出，请重新登录', '提示', {})
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
			ElMessage.error('网络超时');
		} else if (error.message == 'Network Error') {
			ElMessage.error('网络连接错误');
		} else {
			if (error.response.data) ElMessage.error(error.response.statusText);
			else ElMessage.error('接口路径找不到');
		}
		return Promise.reject(error);
	}
);

// Export the Axios instance
export default service;
