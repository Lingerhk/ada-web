import { ElMessage } from "element-plus";
import api from "."
import { AddScanTaskReply, AddScanTaskReq, GetActivityNamesReq, GetScanTaskReq, GetScanTmplReply, GetScanTmplReq, GetSystemInfoReply, GetSystemInfoReq, ListAuditLogReq, ListDomainReply, ListDomainReq, ListNotifyReq, ListScanTmplReply, ListScanTmplReply_Details, ListScanTmplReq, ListThreatRuleReq, scanRiskStatsReply, scanRiskStatsReq, UpdateNotifyReq, UpdateSystemLanguageReq } from "./ada"
import { alertApiError } from "/@/utils/error";
import { OptionType } from "/@/utils/constant";
import { formatApiTime, getPrev7Days } from "/@/utils/formatTime";

export const listDomainOptions = async (): Promise<OptionType[]> => {
    const req: ListDomainReq = {
        pageIdx: 1,
        pageSize: 50,
        filterDomain: "",
        filterStatus: "",
        filterKeyword: ""
    };

    let ret = [{ label: '', value: '' }];
    await api.listDomain(req)
    .then(response => response.response)
	.then((data: ListDomainReply) => {
		// console.log("ListDomainReply", data);
        ret = data.list.map((_) => ({ label: _.name, value: _.name }));
	})
    .catch(err => {
        alertApiError(err);
        ret = [];
    });

    return ret;
};

export const listDchostOptions = async (): Promise<OptionType[]> => {
    const req: ListDomainReq = {
        pageIdx: 1,
        pageSize: 50,
        filterDomain: "",
        filterStatus: "",
        filterKeyword: ""
    };

    let ret: OptionType[] = [];

    await api.listDomain(req)
    .then(response => response.response)
	.then((data: ListDomainReply) => {
        data.list.forEach(item => {
            const value = `${item.dcHostname}.${item.name}`;
            ret.push({ label: value, value: value });
        });
	})
    .catch(err => {
        alertApiError(err);
        ret = [];
    });

    return ret;
};

export const listActivityOptions = async (): Promise<OptionType[]> => {
    const req: GetActivityNamesReq = {
        dcHostname: [],
        startTm: '',
        endTm: '',
    };

    return api.getActivityNames(req)
    .then(response => response.response)
    .then(data => {
        return Object.keys(data.names).map(name => ({ label: name, value: name }));
    })
    .catch(error => {
        alertApiError(error);
        return [];
    })
};

export const addScanTask = async (type: string, domain: string, templateId: string): Promise<AddScanTaskReply> => {
    const req: AddScanTaskReq = {
        type,
        plans: {
            [domain]: templateId,
        }
    };

    return api.addScanTask(req).then(resp => resp.response);
};

export const recheckTask = async (iD: string, type: string, t: any): Promise<boolean> => {
    const result = api.recheckScanTask({iD, type})
    .then(resp => resp.response)
    .then(data => {
        if (data.result.toLowerCase() === 'failed') {
            ElMessage.warning(t('message.risk.recheckFail'))
            return false;
        } else {

            ElMessage.success(t('message.risk.recheckSucc'));
            return true;
        }
    })
    .catch(err => {
        alertApiError(err);
        return false;
    })

    return result;
}

export const listScanTmpl = async (req: ListScanTmplReq): Promise<ListScanTmplReply> => {
    return api.listScanTmpl(req).then(resp => resp.response);
};

export const listBaselineTmpl = async (): Promise<ListScanTmplReply_Details[]> => {
    const req: ListScanTmplReq = {
        pageIdx: 1,
        pageSize: 100,
        type: 'baseline',
    };

    return listScanTmpl(req).then(reply => reply.list);
}

export const listLeakTmpl = async (): Promise<ListScanTmplReply_Details[]> => {
    const req: ListScanTmplReq = {
        pageIdx: 1,
        pageSize: 100,
        type: 'leak',
    };

    return listScanTmpl(req).then(reply => reply.list);
}

export const listWeakpwdTmpl = async (): Promise<ListScanTmplReply_Details[]> => {
    const req: ListScanTmplReq = {
        pageIdx: 1,
        pageSize: 100,
        type: 'weakpwd',
    };

    return listScanTmpl(req).then(reply => reply.list);
}

export const getScanTmpl = async (id: string): Promise<GetScanTmplReply> => {
    const req: GetScanTmplReq = {
        iD: id,
    };

    return api.getScanTmpl(req).then(resp => resp.response);
};

export const scanRiskStats = async (domain: string, type: string): Promise<scanRiskStatsReply|null> => {
    const req: scanRiskStatsReq = {
        domain,
        type,
    };

    try {
        return await api.scanRiskStats(req).then(resp => resp.response);
    } catch (err) {
        alertApiError(err);
        return null;
    }
};

export const getSystemInfo = async (): Promise<GetSystemInfoReply> => {
    return api.getSystemInfo({} as GetSystemInfoReq).then(resp => resp.response);
}

export const getUnreadNotification = async () => {
    const dayRange = getPrev7Days();
    const req: ListNotifyReq = {
        pageIdx: 1, // [(validator.field) = {int_gt: 0}];
        pageSize: 5,
        msgType: [], // 消息类型,Leak漏洞监测，Baseline主动检测，Alert告警事件,System系统告警
        status: [0], // 消息状态: 0未读，1已读
        startTm: formatApiTime(dayRange[0].toString()), //  可选，开始时间
        endTm: formatApiTime(dayRange[1].toString()), //  可选，结束时间
        orderCreateTm: -1, // 创建时间排序 1升序 -1降序, 默认-1
    };

    return api.listNotify(req).then(resp => resp.response);
};

export const setNotificationRead = async (iDs: string[]) => {
    const req: UpdateNotifyReq = {
        iDs,
    };

    return api.updateNotify(req).then(resp => resp.response);
};

export const getSysLanguage = async (): Promise<string> => {
    return api.getSystemInfo({} as GetSystemInfoReq)
        .then(resp => resp.response)
        .then(data => data.systemLanguage)
        .catch(err => 'ZH');
};

export const updateSysLanguage = async (lang: string) => {
    const req: UpdateSystemLanguageReq = {
        language: lang === 'en' ? 'EN' : 'ZH',
    };

    console.log('updateSystemLanguage', req);

    return api.updateSystemLanguage(req)
    .then(resp => resp.response)
};

export const getScanTask = async (iD: string, pageIdx: number = 1, pageSize: number = 10) => {
    const req: GetScanTaskReq = {
        iD,
        pageIdx,
        pageSize,
    };

    console.log("GetScanTaskReq", req);

    return api.getScanTask(req)
        .then(resp => resp.response);
}

export const listThreatRules = async () => {
    const req: ListThreatRuleReq = {
        level: [],
        enable: [],
    };

    return api.listThreatRule(req).then(resp => resp.response).then(data => data.list);
};

export const listThreatRuleOptions = async (): Promise<OptionType[]> => {
    try {
        const rules = await listThreatRules();
        return rules.map(rule => ({
            label: rule.name,
            value: rule.iD,
        }));
    } catch (err) {
        console.error(err);
        return [];
    }
};