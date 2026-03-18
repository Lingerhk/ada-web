import Cookies from 'js-cookie';

/**
 * `window.localStorage` persistent browser storage
 * @method set Set persistent storage
 * @method get Get persistent storage
 * @method remove Remove persistent storage
 * @method clear Clear all persistent storage
 */
export const Local = {
	// See the v2.4.3 changelog for background
	setKey(key: string) {
		// @ts-ignore
		return `${__NEXT_NAME__}:${key}`;
	},
	// Set persistent storage
	set<T>(key: string, val: T) {
		window.localStorage.setItem(Local.setKey(key), JSON.stringify(val));
	},
	// Get persistent storage
	get(key: string) {
		let json = <string>window.localStorage.getItem(Local.setKey(key));
		return JSON.parse(json);
	},
	// Remove persistent storage
	remove(key: string) {
		window.localStorage.removeItem(Local.setKey(key));
	},
	// Clear all persistent storage
	clear() {
		window.localStorage.clear();
	},
};

/**
 * `window.sessionStorage` temporary browser storage
 * @method set Set temporary storage
 * @method get Get temporary storage
 * @method remove Remove temporary storage
 * @method clear Clear all temporary storage
 */
export const Session = {
	// Set temporary storage
	set<T>(key: string, val: T) {
		if (key === 'token') return Cookies.set(key, val);
		window.sessionStorage.setItem(Local.setKey(key), JSON.stringify(val));
	},
	// Get temporary storage
	get(key: string) {
		if (key === 'token') return Cookies.get(key);
		let json = <string>window.sessionStorage.getItem(Local.setKey(key));
		return JSON.parse(json);
	},
	// Remove temporary storage
	remove(key: string) {
		if (key === 'token') return Cookies.remove(key);
		window.sessionStorage.removeItem(Local.setKey(key));
	},
	// Clear all temporary storage
	clear() {
		Cookies.remove('token');
		window.sessionStorage.clear();
	},
};
