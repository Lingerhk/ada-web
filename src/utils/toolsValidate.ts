/**
 * Utility validation helpers collected on 2020-11-29 by lyt.
 * These helpers are used throughout the UI and keep their intent documented in tooltips.
 */

/**
 * Validate a percentage input without decimals
 * @param val current value string
 * @returns returns the processed string
 */
export function verifyNumberPercentage(val: string): string {
	// Match spaces
	let v = val.replace(/(^\s*)|(\s*$)/g, '');
	// Keep digits only.
	v = v.replace(/[^\d]/g, '');
	// Prevent numbers from starting with `0`.
	v = v.replace(/^0/g, '');
	// Clamp values above 100.
	v = v.replace(/^[1-9]\d\d{1,3}$/, '100');
	// Response payload
	return v;
}

/**
 * Validate a percentage input that allows decimals
 * @param val current value string
 * @returns returns the processed string
 */
export function verifyNumberPercentageFloat(val: string): string {
	let v = verifyNumberIntegerAndFloat(val);
	// Clamp values above 100.
	v = v.replace(/^[1-9]\d\d{1,3}$/, '100');
	// Prevent `100.` from being entered as an intermediate state.
	v = v.replace(/^100\.$/, '100');
	// Response payload
	return v;
}

/**
 * Validate a non-negative integer or decimal
 * @param val current value string
 * @returns returns the processed string
 */
export function verifyNumberIntegerAndFloat(val: string) {
	// Match spaces
	let v = val.replace(/(^\s*)|(\s*$)/g, '');
	// Keep digits and a decimal point only.
	v = v.replace(/[^\d.]/g, '');
	// Allow only a single leading zero.
	v = v.replace(/^0{2}$/g, '0');
	// The first character must be a digit, not a dot.
	v = v.replace(/^\./g, '');
	// Allow only one decimal point.
	v = v.replace('.', '$#$').replace(/\./g, '').replace('$#$', '.');
	// Keep at most two decimal places.
	v = v.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3');
	// Response payload
	return v;
}

/**
 * Validate a positive integer
 * @param val current value string
 * @returns returns the processed string
 */
export function verifiyNumberInteger(val: string) {
	// Match spaces
	let v = val.replace(/(^\s*)|(\s*$)/g, '');
	// Remove pasted dots such as in `0.1.12.12`.
	v = v.replace(/[\.]*/g, '');
	// Collapse pasted values with leading zeros such as `00121323`.
	v = v.replace(/(^0[\d]*)$/g, '0');
	// Allow a leading zero only once.
	v = v.replace(/^0\d$/g, '0');
	// Keep digits only.
	v = v.replace(/[^\d]/g, '');
	// Response payload
	return v;
}

/**
 * Remove Chinese characters and spaces
 * @param val current value string
 * @returns returns the processed string
 */
export function verifyCnAndSpace(val: string) {
	// Match Chinese characters and spaces.
	let v = val.replace(/[\u4e00-\u9fa5\s]+/g, '');
	// Match spaces
	v = v.replace(/(^\s*)|(\s*$)/g, '');
	// Response payload
	return v;
}

/**
 * Remove English letters and spaces
 * @param val current value string
 * @returns returns the processed string
 */
export function verifyEnAndSpace(val: string) {
	// Match English letters and spaces.
	let v = val.replace(/[a-zA-Z]+/g, '');
	// Match spaces
	v = v.replace(/(^\s*)|(\s*$)/g, '');
	// Response payload
	return v;
}

/**
 * Remove surrounding spaces
 * @param val current value string
 * @returns returns the processed string
 */
export function verifyAndSpace(val: string) {
	// Match spaces
	let v = val.replace(/(^\s*)|(\s*$)/g, '');
	// Response payload
	return v;
}

/**
 * Format a numeric string with thousands separators
 * @param val current value string
 * @returns returns the processed string
 */
export function verifyNumberComma(val: string) {
	// Reuse the non-negative number normalizer first.
	let v: any = verifyNumberIntegerAndFloat(val);
	// Split the integer and decimal parts.
	v = v.toString().split('.');
	// `\B` matches a non-word boundary.
	v[0] = v[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	// Join the integer and decimal parts again.
	v = v.join('.');
	// Response payload
	return v;
}

/**
 * Highlight matched text for search results
 * @param val current value string
 * @param text The source string to process
 * @param color Highlight color applied to matched text
 * @returns returns the processed string
 */
export function verifyTextColor(val: string, text = '', color = 'red') {
	// Wrap matched text in a colored span.
	let v = text.replace(new RegExp(val, 'gi'), `<span style='color: ${color}'>${val}</span>`);
	// Response payload
	return v;
}

/**
 * Convert a number into uppercase Chinese currency text
 * @param val current value string
 * @param unit Default units for uppercase RMB conversion
 * @returns returns the processed string
 */
export function verifyNumberCnUppercase(val: any, unit = '仟佰拾亿仟佰拾万仟佰拾元角分', v = '') {
	// Append two decimal placeholders so integer inputs can still produce jiao/fen units.
	val += '00';
	// `indexOf` returns the first match position or `-1` if absent.
	let lookup = val.indexOf('.');
	// `substring()` excludes the end index, while `substr()` uses a start index plus length.
	if (lookup >= 0) val = val.substring(0, lookup) + val.substr(lookup + 1, 2);
	// Trim the unit string to the same length as the numeric input.
	unit = unit.substr(unit.length - val.length);
	// Build the uppercase currency string digit by digit.
	for (let i = 0; i < val.length; i++) {
		v += '零壹贰叁肆伍陆柒捌玖'.substr(val.substr(i, 1), 1) + unit.substr(i, 1);
	}
	// Clean up repeated zeros and trailing empty units.
	v = v
		.replace(/零角零分$/, '整')
		.replace(/零[仟佰拾]/g, '零')
		.replace(/零{2,}/g, '零')
		.replace(/零([亿|万])/g, '$1')
		.replace(/零+元/, '元')
		.replace(/亿零{0,3}万/, '亿')
		.replace(/^元/, '零元');
	// Response payload
	return v;
}

/**
 * Validate a mobile phone number
 * @param val current value string
 * @returns `true` when the mobile number is valid
 */
export function verifyPhone(val: string) {
	// Invalid mobile number.
	if (!/^((12[0-9])|(13[0-9])|(14[5|7])|(15([0-3]|[5-9]))|(18[0|1,5-9]))\d{8}$/.test(val)) return false;
	// Valid mobile number.
	else return true;
}

/**
 * Validate a domestic landline number
 * @param val current value string
 * @returns `true` when the landline number is valid
 */
export function verifyTelPhone(val: string) {
	// Invalid landline number.
	if (!/\d{3}-\d{8}|\d{4}-\d{7}/.test(val)) return false;
	// Valid landline number.
	else return true;
}

/**
 * Validate a login account
 * @param val current value string
 * @returns `true` when the account format is valid
 */
export function verifyAccount(val: string) {
	// Invalid account format.
	if (!/^[a-zA-Z][a-zA-Z0-9_]{4,15}$/.test(val)) return false;
	// Valid account format.
	else return true;
}

/**
 * Validate a basic password
 * @param val current value string
 * @returns `true` when the password format is valid
 */
export function verifyPassword(val: string) {
	// Invalid password format.
	if (!/^[a-zA-Z]\w{5,15}$/.test(val)) return false;
	// Valid password format.
	else return true;
}

/**
 * Validate a strong password
 * @param val current value string
 * @returns `true` when the password meets the strong-password rule
 */
export function verifyPasswordPowerful(val: string) {
	// Password does not satisfy the strong-password rule.
	if (!/^(?![a-zA-z]+$)(?!\d+$)(?![!@#$%^&\.*]+$)(?![a-zA-z\d]+$)(?![a-zA-z!@#$%^&\.*]+$)(?![\d!@#$%^&\.*]+$)[a-zA-Z\d!@#$%^&\.*]{6,16}$/.test(val))
		return false;
	// Password satisfies the strong-password rule.
	else return true;
}

/**
 * Classify password strength
 * @param val current value string
 * @description Weak: digits only, letters only, or symbols only
 * @description Medium: letters+digits, letters+symbols, or digits+symbols
 * @description Strong: letters+digits+symbols
 * @returns One of the Chinese labels for weak, medium, or strong
 */
export function verifyPasswordStrength(val: string) {
	let v = '';
	// Weak: digits only, letters only, or symbols only.
	if (/^(?:\d+|[a-zA-Z]+|[!@#$%^&\.* ]+){6,16}$/.test(val)) v = '弱';
	// Medium: letters+digits, letters+symbols, or digits+symbols.
	if (/^(?![a-zA-z]+$)(?!\d+$)(?![!@#$%^&\.* ]+$)[a-zA-Z\d!@#$%^&\.*]{6,16}$/.test(val)) v = '中';
	// Strong: letters+digits+symbols.
	if (/^(?![a-zA-z]+$)(?!\d+$)(?![!@#$%^&\.*]+$)(?![a-zA-z\d]+$)(?![a-zA-z!@#$%^&\.*]+$)(?![\d!@#$%^&\.*]+$)[a-zA-Z\d!@#$%^&\.*]{6,16}$/.test(val))
		v = '强';
	// Response payload
	return v;
}

/**
 * Validate an IP address
 * @param val current value string
 * @returns `true` when the IP address is valid
 */
export function verifyIPAddress(val: string) {
	// Invalid IP address.
	if (
		!/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/.test(
			val
		)
	)
		return false;
	// Valid IP address.
	else return true;
}

/**
 * Validate an email address
 * @param val current value string
 * @returns `true` when the email address is valid
 */
export function verifyEmail(val: string) {
	// Invalid email address.
	if (
		!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
			val
		)
	)
		return false;
	// Valid email address.
	else return true;
}

/**
 * Validate a mainland China ID card number
 * @param val current value string
 * @returns `true` when the ID card number is valid
 */
export function verifyIdCard(val: string) {
	// Invalid ID card number.
	if (!/^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(val)) return false;
	// Valid ID card number.
	else return true;
}

/**
 * Validate a Chinese full name
 * @param val current value string
 * @returns `true` when the name format is valid
 */
export function verifyFullName(val: string) {
	// Invalid name format.
	if (!/^[\u4e00-\u9fa5]{1,6}(·[\u4e00-\u9fa5]{1,6}){0,2}$/.test(val)) return false;
	// Valid name format.
	else return true;
}

/**
 * Validate a postal code
 * @param val current value string
 * @returns `true` when the postal code is valid
 */
export function verifyPostalCode(val: string) {
	// Invalid postal code.
	if (!/^[1-9][0-9]{5}$/.test(val)) return false;
	// Valid postal code.
	else return true;
}

/**
 * Validate a URL
 * @param val current value string
 * @returns `true` when the URL is valid
 */
export function verifyUrl(val: string) {
	// Invalid URL.
	if (
		!/^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(
			val
		)
	)
		return false;
	// Valid URL.
	else return true;
}

/**
 * Validate a vehicle license plate number
 * @param val current value string
 * @returns `true` when the license plate number is valid
 */
export function verifyCarNum(val: string) {
	// Invalid license plate number.
	if (
		!/^(([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z](([0-9]{5}[DF])|([DF]([A-HJ-NP-Z0-9])[0-9]{4})))|([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9挂学警港澳使领]))$/.test(
			val
		)
	)
		return false;
	// Valid license plate number.
	else return true;
}
