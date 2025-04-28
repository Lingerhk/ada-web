import { Client } from './client';

const apiUrl = import.meta.env.VITE_ADA_API_URL ?? '';

// if (apiUrl === undefined) {
//     throw new Error("Missing env `VITE_ADA_API_URL`");
// }

const client = new Client(apiUrl);

const api = client.ada;

export default api;

const getApiUrl = (): string => {
	if (apiUrl === '') {
		return `${window.location.protocol}//${window.location.hostname}`;
	}

    const url = new URL(apiUrl);

	return `${url.protocol}//${url.hostname}`;
};

const getApiPort = (): string => {
	if (apiUrl === '') {
		return '80';
	}

	const parts = apiUrl.split(':');
	if (parts.length < 2) {
		return '80';
	}

	return new URL(apiUrl).port;
};

export { getApiUrl, getApiPort };
