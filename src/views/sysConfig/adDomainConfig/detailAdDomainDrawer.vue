<template>
    <el-drawer size="40%" v-model="state.open" :close-on-click-modal="false">
        <template #header>
            <h3>{{ t('message.adDomain.detailTitle') }}</h3>
        </template>
        <template #default>
            <div style="padding: 20px;">
                <el-alert v-if="state.data.errMsg !== ''" :title="state.data.errMsg" type="warning" />
                <!-- description -->
                <el-descriptions size="default" style="margin-top: 20px;" :column="1" border>
                    <el-descriptions-item :label="$t('message.adDomain.name') + ':'">{{
                        state.data.name}}</el-descriptions-item>
                    <el-descriptions-item :label="$t('message.adDomain.dns') + ':'">{{
                        `${state.data.domainInfo.dns}` }}</el-descriptions-item>
                    <el-descriptions-item :label="$t('message.adDomain.dcHostnameNum') + ':'">{{ state.dcHostNum
                        }}</el-descriptions-item>
                    <el-descriptions-item :label="$t('message.adDomain.createTm') + ':'">{{
                        formatApiTime(state.data.createTm)
                        }}</el-descriptions-item>
                    <el-descriptions-item :label="$t('message.adDomain.testDomain') + ':'">
                        <el-button size="default" type="primary" @click="testDomain">{{ $t('message.adDomain.exec')
                            }}</el-button>
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('message.adDomain.updateDomainData') + ':'">
                        <el-button size="default" type="primary" @click="updateDomainData">{{
                            $t('message.adDomain.exec')
                            }}</el-button>
                    </el-descriptions-item>
                </el-descriptions>
            </div>
        </template>
        <template #footer>
            <div style="display: flex; justify-content: right; padding: 20px;">
                <el-button @click="handleClose">{{ $t('message.tableCommon.close')
                    }}</el-button>
            </div>
        </template>
    </el-drawer>
</template>

<script setup lang="ts">

import { reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { ListDomainReply_Details, TestDomainReply, TestDomainReq, UpdateDomainDataReply, UpdateDomainDataReq } from '/@/api/grpc/ada';
import api from '/@/api/grpc';
import { alertApiError } from '/@/utils/error';
import { formatApiTime } from '/@/utils/formatTime';
import { ElMessage, ElMessageBox } from 'element-plus';
import { listDchostNum } from '/@/api/grpc/method';

const { t } = useI18n();

type OnCloseFunc = () => void;

const state = reactive({
    open: false,
    data: {
        iD: '',
        name: '',
        dcHostname: '',
        status: '',
        domainInfo: {},
        createTm: '',
        errMsg: '',
    } as ListDomainReply_Details,
    dcHostNum: 1,
    onClose: null as OnCloseFunc | null,
});

const updateDomainData = () => {
    const req: UpdateDomainDataReq = {
        domainID: state.data.iD
    };

    console.log('updateDomainData', req);

    api.updateDomainData(req)
    .then(resp => resp.response)
    .then((data: UpdateDomainDataReply) => {
        if (data.result === 'success') {
            ElMessage.success(t('message.adDomain.updateDataSucc'));
        } else {
            ElMessage.warning(t('message.adDomain.updateDataFail'))
        }
    })
    .catch(err => alertApiError(err));
};

const testDomain = () => {
    let req: TestDomainReq = {
        ldapAddr: `ldap://${state.data.dcHostname}.${state.data.name}`, //:${state.data.port}`,
        username: state.data.domainInfo.user,
        password: '',
        dNS: state.data.domainInfo.dns,
    };

    console.log("testDomain", { ...req, ['password']: '******' });

	ElMessageBox.prompt(t('message.adDomain.enterPassword'), t('message.dialog.prompt'), {
		confirmButtonText: t('message.dialog.confirm'),
		cancelButtonText: t('message.dialog.cancel'),
        inputType: 'password',
	})
	.then(({ value }) => {
        req.password = value;

        api.testDomain(req)
            .then(resp => resp.response)
            .then((data: TestDomainReply) => {
                if (data.status === 1) {
                    ElMessage.success(t('message.adDomain.testSucc'));
                } else {
                    ElMessage.warning(data.msg);
                }
            })
            .catch(err => alertApiError(err));
    })
	.catch(() => { });
};

const handleClose = () => {
    state.open = false;
    if (state.onClose) {
        state.onClose;
    }
};

const open = (row: ListDomainReply_Details, onClose: OnCloseFunc | null) => {
    state.open = true;
    state.data = row;
    state.onClose = onClose;

    listDchostNum(row.name).then(num => state.dcHostNum = num).catch(err => {});
}

defineExpose({
    open,
});
</script>

<style>
.el-step__icon-inner {
    font-size: 18px !important;
}

.drawer-form {
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 40px;
}

.slider-block {
    width: 600px;
    align-items: center;
}

.slider-block .el-slider {
  margin-top: 0;
}

</style>


