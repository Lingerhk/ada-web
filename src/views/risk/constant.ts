
export interface OptionType {
    label: string,
    value: string,
};

const toOptionType = (arr: string[], t: any, i18nPrefix: string): OptionType[] => {
    return arr.map(v => ({value: v, label: t(`${i18nPrefix}${v}`)}));
};

const riskTypes = ['all', 'baseline', 'leak', 'weakpwd'];

export const getRiskTypeOptions = (t: any): OptionType[] => {
    return toOptionType(riskTypes, t, 'message.risk.ruleConfig.');
};

export const getRiskTypeOptions2 = (t: any): OptionType[] => {
    return toOptionType(riskTypes.slice(1), t, 'message.risk.ruleConfig.');
};

export const getLeakTypeOptions = (t: any): OptionType[] => {
    return toOptionType(
        ['command_execution', 'privilege_escalation', 'information_leakage', 'improper_configuration'],
        t,
        'message.risk.ruleConfig.leakDetailValue_');
};

export const getTaskCycleOptions = (t: any): OptionType[] => {
    return toOptionType(['all', 'cycle', 'once'], t, 'message.risk.task.cycle_');
};

export const getTaskStatusOptions = (t: any): OptionType[] => {
    return toOptionType(['all', 'PENDING', 'RUNNING', 'FINISH', 'FAILURE'], t, 'message.risk.task.status_');
};