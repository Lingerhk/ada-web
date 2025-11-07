<template>
    <div class="layout-pd">
        <el-card shadow="hover">
            <el-tabs v-model="activeTab">
                <!-- 基础信息 Tab -->
                <el-tab-pane :label="$t('message.router.basicInfoIndex')" name="basicInfo">
                        <h3>{{ $t('message.system.basicInfo.title') }}</h3>
                        <el-form style="margin-top: 30px;" label-width="180px">
                            <el-form-item>
                                <template #label>
                                    <h4>{{ $t('message.system.basicInfo.systemName') }}:</h4>
                                </template>
                                {{ basicInfoState.data.systemName }}
                            </el-form-item>
                            <el-form-item>
                                <template #label>
                                    <h4>{{ $t('message.system.basicInfo.ip') }}:</h4>
                                </template>
                                {{ basicInfoState.data.systemIP }}
                                <el-button type="primary" :icon="Edit" circle @click="showUpdateIPDialog" style="margin-left: 10px;"/>
                            </el-form-item>
                            <el-form-item>
                                <template #label>
                                    <h4>{{ $t('message.system.basicInfo.systemLogo') }}:</h4>
                                </template>
                                <el-upload action="#" :show-file-list="false"
                                    :before-upload="beforeUpload"
                                    :http-request="handleUpload">
                                    <template #trigger>
                                        <div class="logo-container">
                                            <img class="logo-img" :src="basicInfoState.icon" alt="Logo" />
                                            <div class="logo-overlay">
                                                <el-icon size="24"><Edit /></el-icon>
                                                <span>{{ $t('message.tableCommon.edit') }}</span>
                                            </div>
                                        </div>
                                    </template>
                                </el-upload>
                            </el-form-item>
                        </el-form>
                </el-tab-pane>

                <!-- 系统时间 Tab -->
                <el-tab-pane :label="$t('message.router.sysTimeIndex')" name="sysTime">
                        <h3>{{ $t('message.system.sysTime.title') }}</h3>
                        <el-form style="margin-top: 30px;" label-width="180px">
                            <el-form-item>
                                <template #label>
                                    <h4>{{ $t('message.system.sysTime.currentTime') }}:</h4>
                                </template>
                                {{ sysTimeState.time }}
                            </el-form-item>
                            <el-form-item>
                                <template #label>
                                    <h4>{{ $t('message.system.sysTime.enableNtp') }}:</h4>
                                </template>
                                <el-checkbox
                                    v-model="sysTimeState.form.enableNtp"
                                    size="default">
                                    {{ $t('message.system.sysTime.enableNtpDesc') }}
                                </el-checkbox>
                            </el-form-item>
                            <el-form-item>
                                <template #label>
                                    <h4>{{ $t('message.system.sysTime.ntpServer') }}:</h4>
                                </template>
                                <el-input size="default" v-model="sysTimeState.form.ntp" style="width: 400px"></el-input>
                            </el-form-item>
                            <el-form-item>
                                <el-button type="primary" size="default" @click="updateNtp" :loading="sysTimeState.form.loading">{{ $t('message.system.sysTime.save') }}</el-button>
                            </el-form-item>
                        </el-form>
                </el-tab-pane>

                <!-- 产品许可 Tab -->
                <el-tab-pane :label="$t('message.router.licenseIndex')" name="license">
                        <h3>{{ $t('message.system.license.title') }}</h3>
                        <el-form style="margin-top: 30px;" label-width="180px">
                            <el-form-item>
                                <template #label>
                                    <h4>{{ $t('message.system.license.version') }}:</h4>
                                </template>
                                {{ licenseState.data.version }}
                            </el-form-item>
                            <el-form-item>
                                <template #label>
                                    <h4>{{ $t('message.system.license.endTime') }}:</h4>
                                </template>
                                {{ formatApiTime(new Date(Number(licenseState.data.endTime) * 1000).toLocaleString()) }}
                            </el-form-item>
                            <el-form-item>
                                <template #label>
                                    <h4>{{ $t('message.system.license.trait') }}:</h4>
                                </template>
                                {{ licenseState.data.trait }}
                            </el-form-item>
                            <el-form-item>
                                <template #label>
                                    <h4>{{ $t('message.system.license.partner') }}:</h4>
                                </template>
                                {{ licenseState.data.partner }}
                            </el-form-item>
                            <el-form-item>
                                <template #label>
                                    <h4>{{ $t('message.system.license.grantType') }}:</h4>
                                </template>
                                <el-radio-group v-model="licenseState.methodToUpdateLicense">
                                    <el-radio v-for="item in licenseMethod" :value="item.value" size="default" :key="item.value">
                                        {{ item.label }}
                                    </el-radio>
                                </el-radio-group>
                            </el-form-item>
                            <el-form-item v-if="licenseState.methodToUpdateLicense === 'code'">
                                <el-input size="default" v-model="licenseState.licenseCode" style="width: 400px;"
                                    :placeholder="$t('message.system.license.inputLicenseCode')"></el-input>
                                <el-button style="margin-left: 10px;" size="default" type="primary" @click="submitLicenseKey">{{
                                    $t('message.system.license.updateLicense') }}</el-button>
                            </el-form-item>
                            <el-form-item v-if="licenseState.methodToUpdateLicense === 'file'">
                                <el-upload ref="uploadRef" action="#" :limit="1" :auto-upload="true" :show-file-list="false"
                                    :before-upload="beforeUploadFile" :http-request="handleUploadFile">
                                    <template #trigger>
                                        <el-input size="default" v-model="licenseState.licenseFilename" readonly
                                            style="width: 400px;"
                                            :placeholder="$t('message.system.license.uploadLicenseFilePlaceholder')">{{
                                            licenseState.licenseFilename }}</el-input>
                                    </template>
                                    <el-button type="primary" size="default" style="margin-left: 10px;" @click="submitLicenseKey">{{
                                        $t('message.system.license.uploadLicenseFile') }}</el-button>
                                </el-upload>
                            </el-form-item>
                        </el-form>
                </el-tab-pane>

                <!-- 系统升级 Tab -->
                <el-tab-pane :label="$t('message.router.upgradeIndex')" name="upgrade">
                        <h3>{{ $t('message.system.upgrade.title') }}</h3>
                        <el-form style="margin-top: 30px;" label-width="180px">
                            <el-form-item>
                                <template #label>
                                    <h4>{{ $t('message.system.upgrade.ruleVersion') }}:</h4>
                                </template>
                                <span>{{ upgradeState.currentRuleVer }}</span>
                                <el-tooltip
                                    v-if="hasNewVersion"
                                    :content="$t('message.system.upgrade.canUpgradeTo', { version: upgradeState.cloudRuleVer })"
                                    placement="top">
                                    <el-icon color="#409EFF" style="margin-left: 8px; cursor: pointer;" :size="16">
                                        <UploadFilled />
                                    </el-icon>
                                </el-tooltip>
                                <el-tooltip
                                    v-if="isLatestVersion"
                                    :content="$t('message.system.upgrade.latestVersion')"
                                    placement="top">
                                    <el-icon color="#67C23A" style="margin-left: 8px; cursor: pointer;" :size="16">
                                        <CircleCheck />
                                    </el-icon>
                                </el-tooltip>
                            </el-form-item>
                            <el-form-item>
                                <template #label>
                                    <h4>{{ $t('message.system.upgrade.upgradeRule') }}:</h4>
                                </template>
                                <el-checkbox
                                    v-model="upgradeState.form.upgradeRule"
                                    size="default">
                                    {{ $t('message.system.upgrade.upgradeRuleDesc') }}
                                </el-checkbox>
                            </el-form-item>
                            <el-form-item>
                                <template #label>
                                    <h4>{{ $t('message.system.upgrade.upgradeSrv') }}:</h4>
                                </template>
                                <el-input
                                    size="default"
                                    v-model="upgradeState.form.upgradeSrv"
                                    style="width: 400px"
                                    :placeholder="$t('message.system.upgrade.upgradeSrvPlaceholder')">
                                </el-input>
                            </el-form-item>
                            <el-form-item>
                                <el-button
                                    type="primary"
                                    size="default"
                                    @click="updateUpgradeCfg"
                                    :loading="upgradeState.form.loading">
                                    {{ $t('message.system.upgrade.save') }}
                                </el-button>
                            </el-form-item>
                        </el-form>
                </el-tab-pane>

                <!-- 系统代理 Tab -->
                <el-tab-pane :label="$t('message.router.systemProxyIndex')" name="systemProxy">
                        <h3>{{ $t('message.system.systemProxy.title') }}</h3>
                        <el-form style="margin-top: 30px;" label-width="180px">
                            <el-form-item>
                                <template #label>
                                    <h4>{{ $t('message.system.systemProxy.httpProxy') }}:</h4>
                                </template>
                                <el-input
                                    size="default"
                                    v-model="systemProxyState.form.httpProxy"
                                    style="width: 400px"
                                    :placeholder="$t('message.system.systemProxy.httpProxyPlaceholder')">
                                </el-input>
                            </el-form-item>
                            <el-form-item>
                                <template #label>
                                    <h4>{{ $t('message.system.systemProxy.httpsProxy') }}:</h4>
                                </template>
                                <el-input
                                    size="default"
                                    v-model="systemProxyState.form.httpsProxy"
                                    style="width: 400px"
                                    :placeholder="$t('message.system.systemProxy.httpsProxyPlaceholder')">
                                </el-input>
                            </el-form-item>
                            <el-form-item>
                                <template #label>
                                    <h4>{{ $t('message.system.systemProxy.upgradeProxy') }}:</h4>
                                </template>
                                <el-checkbox
                                    v-model="systemProxyState.form.upgradeProxy"
                                    size="default">
                                    {{ $t('message.system.systemProxy.upgradeProxyDesc') }}
                                </el-checkbox>
                            </el-form-item>
                            <el-form-item>
                                <template #label>
                                    <h4>{{ $t('message.system.systemProxy.notifyProxy') }}:</h4>
                                </template>
                                <el-checkbox
                                    v-model="systemProxyState.form.notifyProxy"
                                    size="default">
                                    {{ $t('message.system.systemProxy.notifyProxyDesc') }}
                                </el-checkbox>
                            </el-form-item>
                            <el-form-item>
                                <el-button
                                    type="primary"
                                    size="default"
                                    @click="updateSystemProxy"
                                    :loading="systemProxyState.form.loading">
                                    {{ $t('message.system.systemProxy.save') }}
                                </el-button>
                            </el-form-item>
                        </el-form>
                </el-tab-pane>

                <!-- 网络诊断 Tab -->
                <el-tab-pane :label="$t('message.router.diagnoseIndex')" name="diagnose">
                        <h3>{{ $t('message.system.diagnose.title') }}</h3>
                        <el-form label-width="auto" :inline="true" style="margin-top: 30px;">
                            <el-form-item>
                                <template #label>{{ $t('message.system.diagnose.type') }}</template>
                                <el-radio-group v-model="diagnoseState.req.type">
                                    <el-radio v-for="t in DebugTypes" :value="t" :key="t">{{ t }}</el-radio>
                                </el-radio-group>
                            </el-form-item>
                            <el-form-item>
                                <el-input size="default" style="width: 300px;" v-model="diagnoseState.req.target"
                                    :placeholder="$t('message.system.diagnose.targetPlaceholder')"></el-input>
                            </el-form-item>
                            <el-form-item>
                                <el-button size="default" type="primary" @click="handleDiagnoseSubmit">{{ $t('message.tableCommon.submit')
                                    }}</el-button>
                            </el-form-item>
                        </el-form>
                        <div>
                            <el-input v-loading="diagnoseState.loading" v-model="diagnoseState.result" style="width: 830px" :autosize="{ minRows: 10 }" type="textarea" readonly />
                        </div>
                </el-tab-pane>

                <!-- 系统日志 Tab -->
                <el-tab-pane :label="$t('message.router.systemLogsIndex')" name="systemLogs">
                        <el-row justify="space-between" style="margin-bottom: 10px;">
                            <el-col :span="24">
                                <el-form :inline="true">
                                    <el-form-item :label="$t('message.system.systemLogs.level')">
                                        <el-select v-model="systemLogsState.req.level" multiple clearable collapse-tags collapse-tags-tooltip
                                            :max-collapse-tags="1" size="default" style="width: 200px"
                                            :placeholder="$t('message.system.systemLogs.selectLevel')" popper-class="custom-header">
                                            <template #header>
                                                <el-checkbox v-model="levelCheckAll" :indeterminate="levelIndeterminate" @change="handleLevelCheckAll">
                                                    {{ $t('message.tableCommon.checkAll') }}
                                                </el-checkbox>
                                            </template>
                                            <el-option v-for="option in LogLevelOptions" :key="option.value" :label="option.label" :value="option.value" />
                                        </el-select>
                                    </el-form-item>
                                    <el-form-item :label="$t('message.system.systemLogs.module')">
                                        <el-select v-model="systemLogsState.req.module" multiple clearable collapse-tags collapse-tags-tooltip
                                            :max-collapse-tags="1" size="default" style="width: 250px"
                                            :placeholder="$t('message.system.systemLogs.selectModule')" popper-class="custom-header">
                                            <template #header>
                                                <el-checkbox v-model="moduleCheckAll" :indeterminate="moduleIndeterminate" @change="handleModuleCheckAll">
                                                    {{ $t('message.tableCommon.checkAll') }}
                                                </el-checkbox>
                                            </template>
                                            <el-option v-for="option in LogModuleOptions" :key="option.value" :label="option.label" :value="option.value" />
                                        </el-select>
                                    </el-form-item>
                                    <el-form-item :label="$t('message.system.systemLogs.search')">
                                        <el-input v-model="systemLogsState.req.search" size="default" style="width: 200px"
                                            :placeholder="$t('message.system.systemLogs.searchPlaceholder')" clearable />
                                    </el-form-item>
                                    <el-form-item :label="$t('message.system.systemLogs.timeRange')">
                                        <el-date-picker size="default" v-model="systemLogsTimeRange" type="datetimerange"
                                            :range-separator="$t('message.time.to')" :start-placeholder="$t('message.time.start')"
                                            :end-placeholder="$t('message.time.end')" :shortcuts="shortcuts" />
                                    </el-form-item>
                                </el-form>
                            </el-col>
                        </el-row>
                        <el-row style="margin-top: 10px">
                            <el-table :data="systemLogsState.reply.list" v-loading="systemLogsState.loading" :border="true"
                                style="width: 100%" row-key="time"
                                :expand-row-keys="systemLogsState.expandedRowKeys"
                                @sort-change="handleLogsortChange"
                                @row-click="toggleLogsRowExpansion">
                                <el-table-column type="expand" width="30">
                                    <template #default="props">
                                        <div style="padding: 10px 20px;">
                                            <p style="margin-bottom: 8px;"><strong>{{ $t('message.system.systemLogs.func') }}:</strong> {{ props.row.func || '-' }}</p>
                                            <p style="margin-bottom: 8px;"><strong>{{ $t('message.system.systemLogs.file') }}:</strong> {{ props.row.file || '-' }}</p>
                                        </div>
                                    </template>
                                </el-table-column>
                                <el-table-column prop="time" :label="$t('message.system.systemLogs.time')" sortable="custom" width="180" header-align="center" align="center">
                                    <template #default="scope">
                                        {{ formatApiTime(scope.row.time) }}
                                    </template>
                                </el-table-column>
                                <el-table-column prop="level" :label="$t('message.system.systemLogs.level')" width="100">
                                    <template #default="scope">
                                        <el-tag :type="scope.row.level === 'error' ? 'danger' : 'warning'">{{ scope.row.level }}</el-tag>
                                    </template>
                                </el-table-column>
                                <el-table-column prop="module" :label="$t('message.system.systemLogs.module')" width="150" />
                                <el-table-column prop="msg" :label="$t('message.system.systemLogs.msg')" show-overflow-tooltip />
                            </el-table>
                        </el-row>
                        <el-row style="margin-top: 10px" justify="end">
                            <el-pagination v-model:current-page="systemLogsState.req.pageIdx" v-model:page-size="systemLogsState.req.pageSize"
                                :page-sizes="[10, 30, 60, 100]" layout="sizes, prev, pager, next, jumper"
                                :total="systemLogsState.reply.page?.total"
                                @size-change="handleLogsPageSizeChange"
                                @current-change="handleLogsCurrentPageChange" />
                        </el-row>
                </el-tab-pane>
            </el-tabs>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch, computed } from 'vue';
import { ElMessage, ElMessageBox, type UploadProps } from 'element-plus';
import { Edit, UploadFilled, CircleCheck } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';
import api from '/@/api/grpc';
import { GetSystemInfoReply, GetLicenseReply, UpdateSystemCfgReq, NetworkDebugReq, ListSystemLogsReq, ListSystemLogsReply, UpdateSystemProxyReq } from '/@/api/grpc/ada';
import { getSystemInfo } from '/@/api/grpc/method';
import { alertApiError, alertResult } from '/@/utils/error';
import { formatApiTime, shortcuts } from '/@/utils/formatTime';

const { t } = useI18n();
const activeTab = ref('basicInfo');

// Basic Info State
const basicInfoState = reactive({
    data: {} as GetSystemInfoReply,
    icon: '',
    iconUpload: '',
});

// System Time State
const sysTimeState = reactive({
    time: '',
    ts: 0,
    form: {
        loading: false,
        ntp: '',
        enableNtp: true,
    }
});

// License State
const uploadRef = ref();
const licenseState = reactive({
    methodToUpdateLicense: 'file',
    licenseCode: '',
    licenseFilename: '',
    data: {} as GetLicenseReply,
});

const licenseMethod = ['code', 'file'].map(l => ({ value: l, label: t(`message.system.license.licenseType_${l}`)}));

// Upgrade State
const upgradeState = reactive({
    form: {
        loading: false,
        upgradeRule: false,
        upgradeSrv: '',
    },
    currentRuleVer: '',
    cloudRuleVer: '',
});

const hasNewVersion = computed(() => {
    if (!upgradeState.cloudRuleVer) {
        return false;
    }
    // Compare versions - assuming format like "1.0.0" or similar
    return upgradeState.cloudRuleVer > upgradeState.currentRuleVer;
});

const isLatestVersion = computed(() => {
    if (!upgradeState.cloudRuleVer) {
        return false;
    }
    // Check if current version equals cloud version
    return upgradeState.cloudRuleVer === upgradeState.currentRuleVer;
});

// System Proxy State
const systemProxyState = reactive({
    form: {
        loading: false,
        httpProxy: '',
        httpsProxy: '',
        upgradeProxy: false,
        notifyProxy: false,
    }
});

// Diagnose State
const DebugTypes = ['ping', 'nslookup', 'traceroute', 'nc'];
const diagnoseState = reactive({
    req: {
        type: 'ping',
        target: '',
    } as NetworkDebugReq,
    loading: false,
    result: '',
});

let intervalId: number | null = null;

// Basic Info Methods
const showUpdateIPDialog = () => {
    ElMessageBox.prompt(t('message.system.basicInfo.enterNewIP'), t('message.system.basicInfo.updateIPTitle'), {
        confirmButtonText: t('message.tableCommon.submit'),
        cancelButtonText: t('message.tableCommon.cancel'),
        inputPattern: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
        inputErrorMessage: t('message.system.basicInfo.invalidIPFormat'),
    })
    .then(({ value }) => {
        handleUpdateIP(value);
    })
    .catch(() => {});
};

const handleUpdateIP = (newIP: string) => {
    const req: UpdateSystemCfgReq = {
        systemIP: newIP,
        ntp: '',
        file: '',
        upgradeSrv: '',
        upgradeRule: '',
        currentRuleVer: '',
        cloudRuleVer: '',
    };
    api.updateSystemCfg(req)
    .then(resp => resp.response)
    .then(data => {
        alertResult(data.result, t('message.system.basicInfo.updateIPSucc'), t('message.system.basicInfo.updateIPFail'));
        if (data.result === 'SUCCESS') {
            refreshBasicInfo();
        }
    })
    .catch(err => alertApiError(err));
};

const handleUpload = () => {
    if (basicInfoState.iconUpload === '') {
        return;
    }

    const req: UpdateSystemCfgReq = {
        file: basicInfoState.iconUpload,
        systemIP: '',
        ntp: '',
        upgradeSrv: '',
        upgradeRule: '',
        currentRuleVer: '',
        cloudRuleVer: '',
    };
    api.updateSystemCfg(req)
    .then(resp => resp.response)
    .then(data => {
        alertResult(data.result, t('message.system.basicInfo.updateSystemIconSucc'), t('message.system.basicInfo.updateSystemIconFail'));
        if (data.result === 'SUCCESS') {
            refreshBasicInfo();
        }
    })
    .catch(err => alertApiError(err));
};

const beforeUpload: UploadProps['beforeUpload'] = (rawFile) => {
    if (rawFile.type !== 'image/png') {
        ElMessage.error(t('message.system.basicInfo.uploadLogoFailFormat'));
        return false;
    } else if (rawFile.size / 1024 / 1024 > 2) {
        ElMessage.error(t('message.system.basicInfo.uploadLogoFailSize'));
        return false;
    }

    const reader = new FileReader();
    reader.readAsDataURL(rawFile);
    reader.onload = () => {
        basicInfoState.iconUpload = reader.result as string;
    };
    return true;
};

const refreshBasicInfo = () => {
    getSystemInfo().then(data => {
        basicInfoState.data = data;
        basicInfoState.icon = data.systemIcon;
        // Also update upgrade state
        upgradeState.form.upgradeSrv = data.upgradeSrv || '';
        upgradeState.form.upgradeRule = data.upgradeRule === 'true';
        upgradeState.currentRuleVer = data.currentRuleVer || '';
        upgradeState.cloudRuleVer = data.cloudRuleVer || '';
    });
};

// System Time Methods
const updateNtp = () => {
    const req: UpdateSystemCfgReq = {
        ntp: sysTimeState.form.ntp,
        systemIP: '',
        file: '',
        upgradeSrv: '',
        upgradeRule: '',
        currentRuleVer: '',
        cloudRuleVer: '',
    };

    sysTimeState.form.loading = true;
    api.updateSystemCfg(req)
    .then(resp => resp.response)
    .then(data => alertResult(data.result, t('message.sysTime.save') + t('message.api.alertDefaultSuccess'), t('message.api.alertDefaultFail')))
    .catch(err => alertApiError(err))
    .finally(() => sysTimeState.form.loading = false);
};

// License Methods
const submitLicenseKey = () => {
    if (!licenseState.licenseCode) {
        return;
    }

    api.updateLicense({
        licenseKey: licenseState.licenseCode
    })
    .then(resp => resp.response)
    .then(data => {
        alertResult(data.result, t('message.system.license.updateLicenseSucc'), t('message.system.license.updateLicenseFail'));
        if (data.result === 'SUCCESS') {
            refreshLicense();
        }
    })
    .catch(err => alertApiError(err));
};

const beforeUploadFile: UploadProps['beforeUpload'] = (rawFile) => {
    const reader = new FileReader();
    reader.readAsText(rawFile);
    reader.onload = () => {
        licenseState.licenseCode = reader.result as string;
        licenseState.licenseFilename = rawFile.name;
    };
    return false;
};

const handleUploadFile = () => {};

const refreshLicense = () => {
    api.getLicense({})
    .then(resp => resp.response)
    .then(data => {
        licenseState.data = data;
    })
    .catch(err => alertApiError(err));
};

// Upgrade Methods
const updateUpgradeCfg = () => {
    const req: UpdateSystemCfgReq = {
        upgradeRule: upgradeState.form.upgradeRule ? 'true' : 'false',
        upgradeSrv: upgradeState.form.upgradeSrv,
        ntp: '',
        systemIP: '',
        file: '',
        currentRuleVer: '',
        cloudRuleVer: '',
    };

    upgradeState.form.loading = true;
    api.updateSystemCfg(req)
    .then(resp => resp.response)
    .then(data => {
        alertResult(
            data.result,
            t('message.system.upgrade.updateSucc'),
            t('message.system.upgrade.updateFail')
        );
    })
    .catch(err => alertApiError(err))
    .finally(() => upgradeState.form.loading = false);
};

// System Proxy Methods
const updateSystemProxy = () => {
    // Validate proxy URLs
    const httpProxyPattern = /^http:\/\/.+/;
    const httpsProxyPattern = /^https:\/\/.+/;

    if (systemProxyState.form.httpProxy && !httpProxyPattern.test(systemProxyState.form.httpProxy)) {
        ElMessage.error(t('message.system.systemProxy.invalidHttpProxy'));
        return;
    }

    if (systemProxyState.form.httpsProxy && !httpsProxyPattern.test(systemProxyState.form.httpsProxy)) {
        ElMessage.error(t('message.system.systemProxy.invalidHttpsProxy'));
        return;
    }

    const req: UpdateSystemProxyReq = {
        httpProxy: systemProxyState.form.httpProxy,
        httpsProxy: systemProxyState.form.httpsProxy,
        upgradeProxy: systemProxyState.form.upgradeProxy,
        notifyProxy: systemProxyState.form.notifyProxy,
    };

    systemProxyState.form.loading = true;
    api.updateSystemProxy(req)
    .then(resp => resp.response)
    .then(data => {
        alertResult(
            data.result,
            t('message.system.systemProxy.updateSucc'),
            t('message.system.systemProxy.updateFail')
        );
        if (data.result === 'SUCCESS') {
            refreshSystemProxy();
        }
    })
    .catch(err => alertApiError(err))
    .finally(() => systemProxyState.form.loading = false);
};

const refreshSystemProxy = () => {
    api.getSystemProxy({})
    .then(resp => resp.response)
    .then(data => {
        if (data.systemProxy) {
            systemProxyState.form.httpProxy = data.systemProxy.httpProxy || '';
            systemProxyState.form.httpsProxy = data.systemProxy.httpsProxy || '';
            systemProxyState.form.upgradeProxy = data.systemProxy.upgradeProxy || false;
            systemProxyState.form.notifyProxy = data.systemProxy.notifyProxy || false;
        }
    })
    .catch(err => alertApiError(err));
};

// Diagnose Methods
const handleDiagnoseSubmit = () => {
    diagnoseState.loading = true;

    api.networkDebug(diagnoseState.req)
    .then(resp => resp.response)
    .then(data => {
        diagnoseState.result = data.result;
    })
    .catch(err => {
        alertApiError(err);
    })
    .finally(() => {
        diagnoseState.loading = false;
    });
};

// System Logs State
const LogLevelOptions = [
    { label: 'Error', value: 'error' },
    { label: 'Warning', value: 'warn' }
];

const LogModuleOptions = [
    { label: 'apiserver', value: 'apiserver' },
    { label: 'task_worker', value: 'task_worker' },
    { label: 'task_server', value: 'task_server' },
    { label: 'scanner', value: 'scanner' },
    { label: 'engine', value: 'engine' }
];

const systemLogsTimeRange = ref([] as string[]);
const levelCheckAll = ref(true);
const levelIndeterminate = ref(false);
const moduleCheckAll = ref(true);
const moduleIndeterminate = ref(false);

const systemLogsState = reactive({
    req: {
        pageIdx: 1,
        pageSize: 10,
        level: LogLevelOptions.map(opt => opt.value), // Default: select all levels
        module: LogModuleOptions.map(opt => opt.value), // Default: select all modules
        search: '',
        startTm: '',
        endTm: '',
        sortTime: -1, // Default: descending order
    } as ListSystemLogsReq,
    reply: {
        list: [],
        exhausted: false,
    } as ListSystemLogsReply,
    loading: false,
    expandedRowKeys: [] as string[],
});

// System Logs Methods
const toggleLogsRowExpansion = (row: any) => {
    const index = systemLogsState.expandedRowKeys.indexOf(row.time);
    if (index > -1) {
        systemLogsState.expandedRowKeys.splice(index, 1);
    } else {
        systemLogsState.expandedRowKeys.push(row.time);
    }
};

const handleLevelCheckAll = (val: boolean) => {
    levelIndeterminate.value = false;
    if (val) {
        systemLogsState.req.level = LogLevelOptions.map(opt => opt.value);
    } else {
        systemLogsState.req.level = [];
    }
};

const handleModuleCheckAll = (val: boolean) => {
    moduleIndeterminate.value = false;
    if (val) {
        systemLogsState.req.module = LogModuleOptions.map(opt => opt.value);
    } else {
        systemLogsState.req.module = [];
    }
};

const refreshSystemLogs = () => {
    systemLogsState.loading = true;

    console.log('listSystemLogs', systemLogsState.req);

    api.listSystemLogs(systemLogsState.req)
    .then(resp => resp.response)
    .then(data => {
        systemLogsState.reply = data;
        console.log(data);
    })
    .catch(err => alertApiError(err))
    .finally(() => systemLogsState.loading = false);
};

const handleLogsPageSizeChange = (newPageSize: number) => {
    systemLogsState.req.pageSize = newPageSize;
    refreshSystemLogs();
};

const handleLogsCurrentPageChange = (newPage: number) => {
    systemLogsState.req.pageIdx = newPage;
    refreshSystemLogs();
};

const handleLogsortChange = ({ prop, order }: { prop: string, order: 'ascending' | 'descending' | null }) => {
    if (prop === 'time') {
        if (order === 'ascending') {
            systemLogsState.req.sortTime = 1;
        } else if (order === 'descending') {
            systemLogsState.req.sortTime = -1;
        } else {
            systemLogsState.req.sortTime = -1; // Default to descending
        }
    } else {
        systemLogsState.req.sortTime = -1;
    }
    refreshSystemLogs();
};

// Watch level selection changes
watch(() => systemLogsState.req.level, (val) => {
    levelIndeterminate.value = false;
    if (val.length === 0) {
        levelCheckAll.value = false;
    } else if (val.length === LogLevelOptions.length) {
        levelCheckAll.value = true;
    } else {
        levelIndeterminate.value = true;
    }
    console.log('Level changed, refreshing. New:', val);
    systemLogsState.req.pageIdx = 1;
    refreshSystemLogs();
}, { deep: true });

// Watch module selection changes
watch(() => systemLogsState.req.module, (val) => {
    moduleIndeterminate.value = false;
    if (val.length === 0) {
        moduleCheckAll.value = false;
    } else if (val.length === LogModuleOptions.length) {
        moduleCheckAll.value = true;
    } else {
        moduleIndeterminate.value = true;
    }
    console.log('Module changed, refreshing. New:', val);
    systemLogsState.req.pageIdx = 1;
    refreshSystemLogs();
}, { deep: true });

// Watch search changes
watch(() => systemLogsState.req.search, () => {
    systemLogsState.req.pageIdx = 1;
    refreshSystemLogs();
});

// Watch time range changes
watch(systemLogsTimeRange, (val) => {
    if (val && val.length === 2) {
        systemLogsState.req.startTm = formatApiTime(val[0]);
        systemLogsState.req.endTm = formatApiTime(val[1]);
    } else {
        systemLogsState.req.startTm = '';
        systemLogsState.req.endTm = '';
    }
    refreshSystemLogs();
});

// Watch tab changes to load data when switching to SystemLogs, Upgrade, or SystemProxy tab
watch(activeTab, (newTab) => {
    if (newTab === 'systemLogs') {
        refreshSystemLogs();
    } else if (newTab === 'upgrade') {
        // Refresh upgrade config from basicInfoState
        if (basicInfoState.data.upgradeSrv !== undefined || basicInfoState.data.upgradeRule !== undefined) {
            upgradeState.form.upgradeSrv = basicInfoState.data.upgradeSrv || '';
            upgradeState.form.upgradeRule = basicInfoState.data.upgradeRule === 'true';
            upgradeState.currentRuleVer = basicInfoState.data.currentRuleVer || '';
            upgradeState.cloudRuleVer = basicInfoState.data.cloudRuleVer || '';
        }
    } else if (newTab === 'systemProxy') {
        refreshSystemProxy();
    }
});

// Initialize
onMounted(async () => {
    // Load Basic Info
    refreshBasicInfo();

    // Load System Time
    const info = await getSystemInfo();
    sysTimeState.form.ntp = info.systemNtpAddress;
    sysTimeState.ts = Number(info.systemTimestamp);

    intervalId = setInterval(() => {
        sysTimeState.ts += 1;
        const now = new Date(sysTimeState.ts * 1000);
        sysTimeState.time = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
    }, 1000);

    // Load Upgrade Config
    upgradeState.form.upgradeSrv = info.upgradeSrv || '';
    upgradeState.form.upgradeRule = info.upgradeRule === 'true';
    upgradeState.currentRuleVer = info.currentRuleVer || '';
    upgradeState.cloudRuleVer = info.cloudRuleVer || '';

    // Load System Proxy Config
    if (info.systemProxy) {
        systemProxyState.form.httpProxy = info.systemProxy.httpProxy || '';
        systemProxyState.form.httpsProxy = info.systemProxy.httpsProxy || '';
        systemProxyState.form.upgradeProxy = info.systemProxy.upgradeProxy || false;
        systemProxyState.form.notifyProxy = info.systemProxy.notifyProxy || false;
    }

    // Load License
    refreshLicense();
});

onUnmounted(() => {
    if (intervalId) {
        clearInterval(intervalId);
    }
});
</script>

<style scoped lang="scss">
.logo-container {
    position: relative;
    width: 80px;
    height: 80px;
    border: 1px dashed #d9d9d9;
    border-radius: 50%;
    cursor: pointer;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover .logo-overlay {
        opacity: 1;
    }
}

.logo-img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}

.logo-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    opacity: 0;
    transition: opacity 0.3s;
    gap: 5px;
}
</style>
