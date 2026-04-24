import { ElMessage } from "element-plus";

import { i18n } from "../i18n";

const decodeErrorMessage = (message?: string) => {
    if (!message) return i18n.global.t('message.api.alertMessage');

    try {
        return decodeURIComponent(message);
    } catch {
        return message;
    }
};

export function alertApiError(
    err: { code?: string; message?: string; },
    prefix: string = '',
    subfix: string = '',
) {
    const msg = decodeErrorMessage(err?.message);
    const isCanceledRequest =
        err.code === 'CANCELLED' ||
        /abort|aborted|cancelled|canceled/i.test(msg);

    if (isCanceledRequest) {
        return;
    }

    ElMessage.error(prefix + msg + subfix);
    if (import.meta.env.DEV) {
        console.debug('[api]', err?.code ?? 'ERROR', msg);
    }
}

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
