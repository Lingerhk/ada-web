
import { i18n } from "../i18n";

export const transSysTime = (field: string): string => {
    return i18n.global.t(`message.sysTime.${field}`);
};

export const transAccount = (field: string, list: any[] = []) => {
    return i18n.global.t(`message.accountPerson.${field}`, list);
};

export const transAlarmList = (field: string, list: any[] = []) => {
    return i18n.global.t(`message.threat.alarmList.${field}`, list);
};

export const transThreatRule = (field: string, list: any[] = []) => {
    return i18n.global.t(`message.threat.rule.${field}`, list);
};

export const transLevel = (field: string | number) => {
    return i18n.global.t(`message.tableCommon.level.${field}`);
};

export const transWhiteList = (field: string, list: any[] = []) => {
    return i18n.global.t(`message.threat.whiteList.${field}`, list);
};

export const transNotify = (field: string, list: any[] = []) => {
    return i18n.global.t(`message.system.notify.${field}`, list);
};

export const transMonitor = (field: string, list: any[] = []) => {
    return i18n.global.t(`message.system.monitor.${field}`, list);
};

export const transTask = (field: string, list: any[] = []) => {
    return i18n.global.t(`message.risk.task.${field}`, list);
};

export const transExport = (field: string, list: any[] = []) => {
    return i18n.global.t(`message.risk.export.${field}`, list);
};

export const transDashboard = (field: string, list: any[] = []) => {
    return i18n.global.t(`message.dashboard.${field}`, list);
};

// Deprecated: Use transDashboard instead
export const transRiskMarket = (field: string, list: any[] = []) => {
    return i18n.global.t(`message.dashboard.${field}`, list);
};

export const transThreatBlock = (field: string, list: any[] = []) => {
    return i18n.global.t(`message.threat.threatBlock.${field}`, list);
};