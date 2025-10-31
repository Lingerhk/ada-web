import { ListNotifyConfReply_Details } from "/@/api/grpc/ada";
import { transNotify as T } from '/@/utils/translator';

export type EditorData = {
    [key: string]: string;
};

export const formatNotifyType = (row: ListNotifyConfReply_Details, column: any, cellValue: any, index: number) => {
    return row.notifyType === 'webhook' ? T(`notify_${row.notifyType}${row.metadata.application_type ?? ''}`) : row.notifyType;
};

export const formatNotifyTypeFromUpdateReq = (notifyType: string, applicationType?: string) => {
    return notifyType === 'webhook' ? T(`notify_${notifyType}${applicationType ?? ''}`) : notifyType;
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