import { ElMessage, ElMessageBox } from "element-plus";
import { ActionThreatReply, ActionThreatReq, ListThreatReply_Details } from "/@/api/grpc/ada";
import api from "/@/api/grpc";
import { alertApiError } from "/@/utils/error";

export const closeThreats = (rows: ListThreatReply_Details[], t: any) => {
    if (!rows || rows.length === 0) {
        return
    }

    let succCount = 0;
    const title = rows.length === 1 ? t('message.threat.confirm.single')
        : `${t('message.threat.confirm.multiPrev')}${rows.length}${t('message.threat.confirm.multiNext')}`

    return ElMessageBox.prompt(
            title + `<br><strong>${t('message.threat.confirm.inputRemark')}</strong>`,
            t('message.threat.confirm.prompt'),
            {
                confirmButtonText: t('message.threat.confirm.confirm') ,
                cancelButtonText:  t('message.threat.confirm.cancel'),
                dangerouslyUseHTMLString: true,
            }
        )
        .then(({ value }) => {
            rows.forEach((r: ListThreatReply_Details) => {
                const req: ActionThreatReq = {
                    iD: r.iD,
                    eventStatus: 1,
                    remark: value,
                };

                api.actionThreat(req)
                .then((resp) => resp.response)
                .then((data: ActionThreatReply) => {
                    if (data.result === 'success') {
                        succCount += 1;
                    }
                })
                .catch((err) => {
                    alertApiError(err);
                })
            });
        })
        .then(() => {
            if (succCount === rows.length) {
                ElMessage.success(t('message.threat.confirm.closeSucc'));
            } else if (succCount > 0) {
                ElMessage.warning(t('message.threat.confirm.closePartialSucc'))
            }
        });
}

export const formatTemplate = (tmpl: string): string => {

    const parts = tmpl.split(/(\[[^\]]+\])/);
    return parts.map(part => {
        if (part.startsWith('[') && part.endsWith(']')) {
            return `<span style="color: green;">${part}</span>`;
        }
        return part;
    }).join('');
};
