import { ElMessage } from "element-plus";

import { i18n } from "../i18n";

export function alertApiError(
    err: { code: string; message: string; },
    prefix: string = '',
    subfix: string = '',
) {
    const msg = decodeURIComponent(err.message);
    ElMessage.error(prefix + msg + subfix);
    //ElMessage.error(i18n.global.t('message.api.alertMessage'));
    console.error(err.code, msg);
};

export function alertResult(result: string, succMsg: string, failMsg: string) {
    if (result.toLowerCase() === 'success') {
        ElMessage.success(succMsg === '' ? i18n.global.t('message.api.alertDefaultSuccess') : succMsg);
        return true;
    } else {
        ElMessage.warning(failMsg === '' ? i18n.global.t('message.api.alertDefaultFail') : failMsg)
        return false;
    }
}

export function alertError(err: Error) {
    ElMessage.warning(err.message);
}