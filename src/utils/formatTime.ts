/**
 * Format a `Date` instance into a custom string
 * @param date Current date, typically a `new Date()` instance
 * @param format Target format string
 * @description Example patterns: `YYYY-mm`, `YYYY-mm-dd`
 * @description Quarter token: `YYYY-mm-dd HH:MM:SS QQQQ`
 * @description Weekday token: `YYYY-mm-dd HH:MM:SS WWW`
 * @description Week-of-year token: `YYYY-mm-dd HH:MM:SS ZZZ`
 * @description Combined example: `YYYY-mm-dd HH:MM:SS WWW QQQQ ZZZ`
 * @returns Returns the formatted time string
 */
export function formatDate(date: Date, format: string): string {
	let we = date.getDay(); // Weekday index.
	let z = getWeek(date); // Week number.
	let qut = Math.floor((date.getMonth() + 3) / 3).toString(); // Quarter index.
	const opt: { [key: string]: string } = {
		'Y+': date.getFullYear().toString(), // Year.
		'm+': (date.getMonth() + 1).toString(), // Month; `getMonth()` is zero-based.
		'd+': date.getDate().toString(), // Day of month.
		'H+': date.getHours().toString(), // Hour.
		'M+': date.getMinutes().toString(), // Minute.
		'S+': date.getSeconds().toString(), // Second.
		'q+': qut, // Quarter.
	};
	// Chinese numerals used when formatting weekdays.
	const week: { [key: string]: string } = {
		'0': '日',
		'1': '一',
		'2': '二',
		'3': '三',
		'4': '四',
		'5': '五',
		'6': '六',
	};
	// Chinese numerals used when formatting quarters.
	const quarter: { [key: string]: string } = {
		'1': '一',
		'2': '二',
		'3': '三',
		'4': '四',
	};
	if (/(W+)/.test(format))
		format = format.replace(RegExp.$1, RegExp.$1.length > 1 ? (RegExp.$1.length > 2 ? '星期' + week[we] : '周' + week[we]) : week[we]);
	if (/(Q+)/.test(format)) format = format.replace(RegExp.$1, RegExp.$1.length == 4 ? '第' + quarter[qut] + '季度' : quarter[qut]);
	if (/(Z+)/.test(format)) format = format.replace(RegExp.$1, RegExp.$1.length == 3 ? '第' + z + '周' : z + '');
	for (let k in opt) {
		let r = new RegExp('(' + k + ')').exec(format);
		// Pad multi-character tokens with leading zeroes.
		if (r) format = format.replace(r[1], RegExp.$1.length == 1 ? opt[k] : opt[k].padStart(RegExp.$1.length, '0'));
	}
	return format;
}

/**
 * Get the ISO-like week number for a date
 * @param dateTime The input date
 * @returns The week number
 */
export function getWeek(dateTime: Date): number {
	let temptTime = new Date(dateTime.getTime());
	// Weekday index, treating Sunday as 7.
	let weekday = temptTime.getDay() || 7;
	// Shift to Saturday of the current week so year boundaries are handled consistently.
	temptTime.setDate(temptTime.getDate() - weekday + 1 + 5);
	let firstDay = new Date(temptTime.getFullYear(), 0, 1);
	let dayOfWeek = firstDay.getDay();
	let spendDay = 1;
	if (dayOfWeek != 0) spendDay = 7 - dayOfWeek + 1;
	firstDay = new Date(temptTime.getFullYear(), 0, 1 + spendDay);
	let d = Math.ceil((temptTime.valueOf() - firstDay.valueOf()) / 86400000);
	let result = Math.ceil(d / 7);
	return result;
}

/**
 * Convert a timestamp into a relative time label such as "seconds ago" or "days ago"
 * @param param Current time as a `Date` instance or date string
 * @param format Fallback format for older timestamps
 * @description 10 seconds: `10 * 1000`
 * @description 1 minute: `60 * 1000`
 * @description 1 hour: `60 * 60 * 1000`
 * @description 24 hours: `60 * 60 * 24 * 1000`
 * @description 3 days: `60 * 60 * 24 * 1000 * 3`
 * @returns A relative time string or a formatted date
 */
export function formatPast(param: string | Date, format: string = 'YYYY-mm-dd'): string {
	// Normalize the incoming time value.
	let t: any, s: number;
	// Current JavaScript timestamp.
	let time: number = new Date().getTime();
	// Accept either a string or `Date` object.
	typeof param === 'string' || 'object' ? (t = new Date(param).getTime()) : (t = param);
	// Difference between now and the target timestamp.
	time = Number.parseInt(`${time - t}`);
	if (time < 10000) {
		// Within 10 seconds.
		return '刚刚';
	} else if (time < 60000 && time >= 10000) {
		// Between 10 seconds and 1 minute.
		s = Math.floor(time / 1000);
		return `${s}秒前`;
	} else if (time < 3600000 && time >= 60000) {
		// Between 1 minute and 1 hour.
		s = Math.floor(time / 60000);
		return `${s}分钟前`;
	} else if (time < 86400000 && time >= 3600000) {
		// Between 1 hour and 24 hours.
		s = Math.floor(time / 3600000);
		return `${s}小时前`;
	} else if (time < 259200000 && time >= 86400000) {
		// Between 1 day and 3 days.
		s = Math.floor(time / 86400000);
		return `${s}天前`;
	} else {
		// Older than 3 days.
		let date = typeof param === 'string' || 'object' ? new Date(param) : param;
		return formatDate(date, format);
	}
}

/**
 * Return a greeting based on the current hour
 * @param param Current time, usually a `new Date()` instance
 * @description Example: `formatAxis(new Date())` returns the morning greeting
 * @returns Returns the formatted time string
 */
export function formatAxis(param: Date): string {
	let hour: number = new Date(param).getHours();
	if (hour < 6) return '凌晨好';
	else if (hour < 9) return '早上好';
	else if (hour < 12) return '上午好';
	else if (hour < 14) return '中午好';
	else if (hour < 17) return '下午好';
	else if (hour < 19) return '傍晚好';
	else if (hour < 22) return '晚上好';
	else return '夜里好';
}

export function formatApiTime(dt?: string | number): string {
	if (!dt) {
		return ''
	}

	return formatDate(new Date(dt), "YYYY-mm-dd HH:MM:SS");
}

export function getOvernight() {
    const start = new Date();
	const end = new Date();

	start.setHours(0);
	start.setMinutes(0);
	start.setSeconds(0);
	start.setMilliseconds(0);

	end.setHours(0);
	end.setMinutes(0);
	end.setSeconds(0);
	end.setMilliseconds(0);
	end.setDate(end.getDate() + 1)

	return [start, end]
}

export function getPrev7Days() {
	const end = new Date();
	const start = new Date();
	start.setDate(start.getDate() - 7);
	return [start, end];
}

export function getPrev1Year() {
	const end = new Date();
	const start = new Date();
	start.setFullYear(start.getFullYear() -1);
	return [start, end];
}

export const shortcuts = [
    {
        text: '今日',
        value: () => {
            const end = new Date();
            const start = new Date();
            start.setHours(0);
            start.setMinutes(0);
            start.setSeconds(0);
            start.setMilliseconds(0);
            return [start, end]
        },
    },
    {
        text: '最近15分钟',
        value: () => {
            const end = new Date();
            const start = new Date();
            start.setMinutes(start.getMinutes() - 15);
            return [start, end];
        },
    },
    {
        text: '最近30分钟',
        value: () => {
            const end = new Date();
            const start = new Date();
            start.setMinutes(start.getMinutes() - 30);
            return [start, end];
        },
    },
    {
        text: '最近1个小时',
        value: () => {
            const end = new Date();
            const start = new Date();
            start.setHours(start.getHours() - 1);
            return [start, end];
        },
    },
    {
        text: '最近24小时',
        value: () => {
            const end = new Date();
            const start = new Date();
            start.setHours(start.getHours() - 24);
            return [start, end];
        },
    },
    {
        text: '最近7天',
        value: getPrev7Days,
    },
    {
        text: '最近30天',
        value: () => {
            const end = new Date();
            const start = new Date();
            start.setDate(start.getDate() - 30); 
            return [start, end];
        },
    },
    {
        text: '最近90天',
        value: () => {
            const end = new Date();
            const start = new Date();
            start.setDate(start.getDate() - 90); 
            return [start, end];
        },
    },
    {
        text: '最近1年',
        value: () => {
            const end = new Date();
            const start = new Date();
            start.setFullYear(start.getFullYear() - 1);
            return [start, end];
        },
    },
];
