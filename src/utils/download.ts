import { saveAs } from 'file-saver';
import { i18n } from '../i18n';

export const downloadFile = async (fileUrl: string, fileName: string) => {
	const response = await fetch(fileUrl, {
		mode: 'cors', // 确保跨域请求被允许
	});

	if (!response.ok) {
		throw new Error(i18n.global.t('message.download.responseError')); //'网络响应错误');
	}

	const blob = await response.blob();
	saveAs(blob, fileName);
};
