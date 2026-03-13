
import { transAlarmList, transExport, transLevel, transThreatBlock, transThreatRule, transWhiteList } from "./translator";

export interface OptionType {
    label: string,
    value: string,
}

export const getLevelOptions = (t: any) => [2, 3, 4, 5].map(l => ({ value: l, label: t(`message.tableCommon.level.${l}`) }));

export const getLevelOptions2 = () => [2, 3, 4, 5].map(l => ({ value: l, label: transLevel(l) }));

export const getLevelColor = (t: number) => {
    return {
        2: '#1956af',
        3: '#f7c131',
        4: '#ff8626',
        5: '#c5261e',
    }[t] ?? '#c5261e'
};

export const getRiskResultOptions = (t: any) => [0, 1].map(l => ({ value: l, label: t(`message.risk.result_${l}`) }));

export const getWeakpwdLockedOptions = (t: any) => [0, 1].map(l => ({ value: l, label: t(`message.risk.weakpwd.locked_${l}`)}));

export const getSensorStatusOptions = (t: any) => ['Init', 'Stopped', 'Running'].map(l => ({ value: l, label: t(`message.sysConfig.sensorConfig.status_${l}`) }));

export const getNotifyModuleOptions = (t: any) => ['alert', 'baseline', 'leak', 'system'].map(l => ({ value: l, label: t(`message.system.notify.module_${l}`) }));

export const getNotifyNotifyOptions = (t: any) => ['syslog', 'webhook', 'email'].map(l => ({ value: l, label: t(`message.system.notify.notify_${l}`) }));

export const getNotifyEnableOptions = (t: any) => ['enable', 'disable'].map(l => ({ value: l, label: t(`message.system.notify.enable_${l}`) }));

export const getMessageTypeOptions = (t: any) => ['alert', 'baseline', 'leak', 'system'].map(l => ({ value: l, label: t(`message.system.message.msgType_${l}`) }));

export const getMessageStatusOptions = (t: any) => [0, 1].map(l => ({ value: l, label: t(`message.system.message.status_${l}`) }));

export const getSafetyOverviewDayOptions = (t: any) => [1, 7, 30].map(l => ({ value: l, label: t(`message.threat.safetyOverview.duration${l}`) }));

export const getAuditEventOptions = (t: any) => ['上传Logo', '删除域控', '测试域连接', '添加域控', '添加子用户', '登录', '编辑域控信息'].map(l => ({ value: l, label: t(`message.system.audit.event_${l}`) }));

export const getAddWhiteOpeartionOptins = () => ['==', '!=', '>', '<', '>=', '<=', 'contain', 'not_contain', 'in', 'not_in','regex'].map(l => ({ value: l, label: transAlarmList(l) }));

export const getThreatRuleEnableOptions = () => [true, false].map(l => ({value: l, label: transThreatRule(`is_enable_${l}`)}));

export const getWhiteListOriginOptions = () => [1, 2].map(l => ({value: l, label: transWhiteList(`origin_${l}`)}));

export const getExportTaskTypeOptions = () => ['alert_event', 'alert_activity', 'baseline', 'leak', 'weakpwd', 'system', 'audit'].map(value => ({value, label: transExport(`type_${value}`)}));

export const getExportTaskStatusOpitions = () => ['padding', 'doing', 'finish', 'failed'].map(value => ({value, label: transExport(`status_${value}`)}));

export const getThreatBlockOriginOptions = () => [1, 2].map(l => ({value: l, label: transThreatBlock(`origin_${l}`)}));
