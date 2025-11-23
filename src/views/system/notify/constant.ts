import { ListNotifyConfReply_Details } from "/@/api/grpc/ada";
import { transNotify as T } from '/@/utils/translator';

export type EditorData = {
    [key: string]: string;
};

export const formatNotifyType = (row: ListNotifyConfReply_Details, column: any, cellValue: any, index: number) => {
    if (row.notifyType === 'webhook') {
        return T(`notify_${row.notifyType}${row.metadata.application_type ?? ''}`);
    }
    return T(`notify_${row.notifyType}`);
};

export const formatNotifyTypeFromUpdateReq = (notifyType: string, applicationType?: string) => {
    if (notifyType === 'webhook') {
        return T(`notify_${notifyType}${applicationType ?? ''}`);
    }
    return T(`notify_${notifyType}`);
};

export const parseWebhookType = (url: string): string => {
    if (url.includes("weixin.qq.com")) {
        return "weixin";
    } else if (url.includes("dingtalk.com")) {
        return "dingtalk";
    } else if (url.includes("feishu.cn")) {
        return "feishu";
    }
    return "common";
};