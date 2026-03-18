// Common functions
import useClipboard from 'vue-clipboard3';
import { ElMessage } from 'element-plus';
import { formatDate } from '/@/utils/formatTime';
import { useI18n } from 'vue-i18n';

export default function () {
	const { t } = useI18n();
	const { toClipboard } = useClipboard();

	// Format percentages
	const percentFormat = (row: EmptyArrayType, column: number, cellValue: string) => {
		return cellValue ? `${cellValue}%` : '-';
	};
	// Format date and time values in lists
	const dateFormatYMD = (row: EmptyArrayType, column: number, cellValue: string) => {
		if (!cellValue) return '-';
		return formatDate(new Date(cellValue), 'YYYY-mm-dd');
	};
	// Format date and time values in lists
	const dateFormatYMDHMS = (row: EmptyArrayType, column: number, cellValue: string) => {
		if (!cellValue) return '-';
		return formatDate(new Date(cellValue), 'YYYY-mm-dd HH:MM:SS');
	};
	// Format date and time values in lists
	const dateFormatHMS = (row: EmptyArrayType, column: number, cellValue: string) => {
		if (!cellValue) return '-';
		let time = 0;
		if (typeof row === 'number') time = row;
		if (typeof cellValue === 'number') time = cellValue;
		return formatDate(new Date(time * 1000), 'HH:MM:SS');
	};
	// Format decimals
	const scaleFormat = (value: string = '0', scale: number = 4) => {
		return Number.parseFloat(value).toFixed(scale);
	};
	// Format decimals
	const scale2Format = (value: string = '0') => {
		return Number.parseFloat(value).toFixed(2);
	};
	// Copy text on click
	const copyText = (text: string) => {
		return new Promise((resolve, reject) => {
			try {
				// Copy
				toClipboard(text);
				// You can add a success notification here if needed
				ElMessage.success(t('message.layout.copyTextSuccess'));
				resolve(text);
			} catch (e) {
				// Copy failed
				ElMessage.error(t('message.layout.copyTextError'));
				reject(e);
			}
		});
	};
	return {
		percentFormat,
		dateFormatYMD,
		dateFormatYMDHMS,
		dateFormatHMS,
		scaleFormat,
		scale2Format,
		copyText,
	};
}
