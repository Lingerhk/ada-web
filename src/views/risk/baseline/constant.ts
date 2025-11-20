
import { i18n } from "/@/i18n";

type SubTypeOption = {
    label: string;
    value: string;
};

const subTypeOptions: SubTypeOption[] = [{
    label: 'message.risk.baseline.PrivilegedAccounts',
    value: 'PrivilegedAccounts'
}, {
    label: 'message.risk.baseline.Anomalies',
    value: 'Anomalies'
}, {
    label: 'message.risk.baseline.StaleObjects',
    value: 'StaleObjects'
}, {
    label: 'message.risk.baseline.Trusts',
    value: 'Trusts'
}];

export const getSubTypeOptions = (t: (key: string) => string) => {
    return subTypeOptions.map((v) => ({ ...v, label: t(v.label) }));
};

export const getResultOptions = () => {
    return [0, 1].map(value => ({ label: i18n.global.t(`message.risk.baseline.result_${value}`), value }));
};
