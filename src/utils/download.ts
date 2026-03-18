import { saveAs } from 'file-saver';
import { i18n } from '../i18n';

export const downloadFile = async (fileUrl: string, fileName: string) => {
	const response = await fetch(fileUrl, {
		mode: 'cors', // Ensure cross-origin requests are allowed
	});

	if (!response.ok) {
		throw new Error(i18n.global.t('message.download.responseError')); // 'Network response error');
	}

	const blob = await response.blob();
	saveAs(blob, fileName);
};
