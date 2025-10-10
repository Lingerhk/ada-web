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
                </el-descriptions>

                <!-- DC List Table -->
                <div style="margin-top: 20px;">
                    <h3>{{ $t('message.adDomain.dcList') }}</h3>
                    <el-table 
                        :data="state.data.dCs || []" 
                        style="width: 100%; margin-top: 10px;" 
                        border
                        table-layout="auto"
                        :max-height="400">
                        <el-table-column prop="hostname" :label="$t('message.adDomain.dcHostname')" min-width="120" fixed>
                            <template #default="scope">
                                <el-tooltip :content="scope.row.platform" placement="top">
                                    <span>{{ scope.row.hostname }}</span>
                                </el-tooltip>
                            </template>
                        </el-table-column>
                        <el-table-column prop="ips" :label="$t('message.adDomain.ip')" min-width="120"></el-table-column>
                        <el-table-column prop="timeout" :label="$t('message.adDomain.timeout')" min-width="90"></el-table-column>
                        <el-table-column prop="status" :label="$t('message.adDomain.status')" min-width="80">
                            <template #default="scope">
                                <el-tag :type="getStatusType(scope.row.status)">
                                    {{ $t('message.adDomain.state.' + scope.row.status) }}
                                    <el-tooltip v-if="scope.row.errMsg && scope.row.errMsg !== ''" :content="scope.row.errMsg" placement="top">
                                        <el-icon class="error-icon"><QuestionFilled /></el-icon>
                                    </el-tooltip>
                                </el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column prop="hasSensor" :label="$t('message.adDomain.hasSensor')" min-width="100" align="center">
                            <template #default="scope">
                                <el-icon v-if="scope.row.hasSensor" color="#67C23A"><Check /></el-icon>
                                <el-button v-else type="primary" link size="small" @click="handleDeploySensor(scope.row)">
                                    {{ $t('message.adDomain.automaticInstall') }}
                                </el-button>
                            </template>
                        </el-table-column>
                        <el-table-column prop="fsmoRole" :label="$t('message.adDomain.fsmoRole')" min-width="100"></el-table-column>
                        <el-table-column prop="version" :label="$t('message.adDomain.version')" min-width="120"></el-table-column>
                        <el-table-column prop="lastOnlineTm" :label="$t('message.adDomain.lastOnlineTm')" min-width="180">
                            <template #default="scope">
                                {{ formatApiTime(scope.row.lastOnlineTm) }}
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
                <!-- WinRM Notes -->
                <div style="margin-top: 20px; padding: 10px; border: 1px solid #e4e7ed; border-radius: 4px;">
                    <h4>{{ $t('message.adDomain.winRmNotesTitle') }}</h4>
                    <p style="font-size: 12px; color: #606266; margin-top: 5px;">
                        {{ $t('message.adDomain.winRmNotesBody') }}
                    </p>
                </div>
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
import { ListDomainReply_Details, TestDomainReply, TestDomainReq, DeploySensorReq, DeploySensorReply } from '/@/api/grpc/ada';
import api from '/@/api/grpc';
import { alertApiError } from '/@/utils/error';
import { formatApiTime } from '/@/utils/formatTime';
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus';
import { QuestionFilled, Check, Close } from '@element-plus/icons-vue';

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

// Function to determine el-tag type based on status
const getStatusType = (status: string): 'success' | 'warning' | 'danger' => {
    switch (status) {
        case 'run':
            return 'success';
        case 'init':
            return 'warning';
        case 'error':
        case 'stop':
        default:
            return 'danger';
    }
};

const testDomain = () => {
    let req: TestDomainReq = {
        ldapAddr: `ldap://${state.data.dcHostname}.${state.data.name}`, //:${state.data.port}`,
        username: state.data.domainInfo.user,
        password: state.data.domainInfo.password,
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

    state.dcHostNum = row.dCs?.length || 0;
}

const handleDeploySensor = (dcDetails: any) => {
    if (!state.data || !state.data.iD) return;

    ElMessageBox.confirm(
        t('message.adDomain.confirmDeploySensor', [dcDetails.hostname]),
        t('message.dialog.prompt'),
        {
            confirmButtonText: t('message.dialog.confirm'),
            cancelButtonText: t('message.dialog.cancel'),
            type: 'warning',
        }
    )
        .then(() => {
            const loadingInstance = ElLoading.service({
                lock: true,
                text: t('message.adDomain.deployInProgress'),
                background: 'rgba(0, 0, 0, 0.7)',
            });

            const req: DeploySensorReq = {
                domainID: state.data.iD,
                dcHostname: dcDetails.hostname,
            };
            console.log('DeploySensor request:', req);
            api.deploySensor(req)
                .then(resp => resp.response)
                .then((data: DeploySensorReply) => {
                    console.log('DeploySensor response:', data);
                    if (data.result === 'success') {
                        ElMessage.success(t('message.adDomain.deploySensorSucc', [dcDetails.hostname]));
                        // Optionally, update the local state or trigger a refresh if needed
                        // For now, we just show a message. The table will reflect the change upon next full data load.
                    } else {
                        ElMessage.error(t('message.adDomain.deploySensorFail', [dcDetails.hostname, data.result]));
                    }
                })
                .catch(err => {
                    ElMessage.error(t('message.adDomain.deploySensorFail', [dcDetails.hostname, err.message || 'Unknown error']));
                })
                .finally(() => {
                    loadingInstance.close();
                });
        })
        .catch(() => {
            ElMessage.info(t('message.adDomain.deploySensorCancelled'));
        });
};

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

.error-icon {
  margin-left: 5px;
  font-size: 14px;
  cursor: pointer;
  vertical-align: middle;
}
</style>


