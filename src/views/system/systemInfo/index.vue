<template>
    <div class="layout-pd">
        <el-card shadow="hover">
            <el-tabs v-model="activeTab" type="border-card">
                <!-- 基础信息 Tab -->
                <el-tab-pane :label="$t('message.router.basicInfoIndex')" name="basicInfo">
                    <div class="tab-content">
                        <h3>{{ $t('message.system.basicInfo.title') }}</h3>
                        <div class="basic-info-container">
                            <el-form label-position="left" label-width="120px">
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
                            </el-form>

                            <el-form class="logo-form" label-position="left" label-width="120px">
                                <el-form-item>
                                    <template #label>
                                        <h4>LOGO:</h4>
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
                        </div>
                    </div>
                </el-tab-pane>

                <!-- 系统时间 Tab -->
                <el-tab-pane :label="$t('message.router.sysTimeIndex')" name="sysTime">
                    <div class="tab-content">
                        <h3>{{ $t('message.sysTime.sysTime') }}: {{ sysTimeState.time }}</h3>
                        <el-form style="margin-top: 30px;">
                            <el-form-item>
                                <el-radio-group v-model="sysTimeState.form.enable" class="ml-4">
                                    <el-radio value="1" size="default">{{ $t('message.sysTime.enableNtp') }}</el-radio>
                                </el-radio-group>
                            </el-form-item>
                            <el-form-item>
                                <template #label>
                                    <h4>{{ $t('message.sysTime.ntp') }}:</h4>
                                </template>
                                <el-input size="default" v-model="sysTimeState.form.ntp" style="width: 240px"></el-input>
                            </el-form-item>
                            <el-form-item>
                                <el-button type="primary" size="default" @click="updateNtp" :loading="sysTimeState.form.loading">{{ $t('message.sysTime.save') }}</el-button>
                            </el-form-item>
                        </el-form>
                    </div>
                </el-tab-pane>

                <!-- 产品许可 Tab -->
                <el-tab-pane :label="$t('message.router.licenseIndex')" name="license">
                    <div class="tab-content">
                        <div class="basic-info-container">
                            <el-form label-position="left" label-width="120px">
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
                                    <el-radio-group v-model="licenseState.methodToUpdateLicense" class="ml-4">
                                        <el-radio v-for="item in licenseMethod" :value="item.value" size="default" :key="item.value">
                                            {{ item.label }}
                                        </el-radio>
                                    </el-radio-group>
                                </el-form-item>
                                <el-form-item v-if="licenseState.methodToUpdateLicense === 'code'">
                                    <div>
                                        <el-input size="default" v-model="licenseState.licenseCode" style="width: 240px;"
                                            :placeholder="$t('message.system.license.inputLicenseCode')"></el-input>
                                        <el-button style="margin-left: 10px;" size="default" type="primary" @click="submitLicenseKey">{{
                                            $t('message.system.license.updateLicense') }}</el-button>
                                    </div>
                                </el-form-item>
                                <el-form-item v-if="licenseState.methodToUpdateLicense === 'file'">
                                    <el-upload ref="uploadRef" action="#" :limit="1" :auto-upload="true" :show-file-list="false"
                                        :before-upload="beforeUploadFile" :http-request="handleUploadFile">
                                        <template #trigger>
                                            <el-input size="default" v-model="licenseState.licenseFilename" readonly
                                                style="width: 240px;"
                                                :placeholder="$t('message.system.license.uploadLicenseFilePlaceholder')">{{
                                                licenseState.licenseFilename }}</el-input>
                                        </template>
                                        <el-button type="primary" size="default" style="margin-left: 10px;" @click="submitLicenseKey">{{
                                            $t('message.system.license.uploadLicenseFile') }}</el-button>
                                    </el-upload>
                                </el-form-item>
                            </el-form>
                        </div>
                    </div>
                </el-tab-pane>

                <!-- 网络诊断 Tab -->
                <el-tab-pane :label="$t('message.router.diagnoseIndex')" name="diagnose">
                    <div class="tab-content">
                        <el-form label-width="auto" :inline="true">
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
                    </div>
                </el-tab-pane>
            </el-tabs>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { ElMessage, ElMessageBox, type UploadProps } from 'element-plus';
import { Edit } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';
import api from '/@/api/grpc';
import { GetSystemInfoReply, GetLicenseReply, UpdateSystemIPReq, UpdateNtpAddressReq, NetworkDebugReq } from '/@/api/grpc/ada';
import { getSystemInfo } from '/@/api/grpc/method';
import { alertApiError, alertResult } from '/@/utils/error';
import { formatApiTime } from '/@/utils/formatTime';

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
        enable: '1',
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

let intervalId: NodeJS.Timeout | null = null;

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
    const req: UpdateSystemIPReq = {
        systemIP: newIP,
    };
    api.updateSystemIP(req)
    .then(resp => resp.response)
    .then(data => {
        alertResult(data.result, t('message.system.basicInfo.updateIPSucc'), t('message.system.basicInfo.updateIPFail'));
        if (data.result === 'SUCCESS') {
            refreshBasicInfo();
        }
    })
    .catch(err => alertApiError(err));
};

const handleUpload = (options: any) => {
    if (basicInfoState.iconUpload === '') {
        return;
    }

    api.updateSystemIcon({
        icon: basicInfoState.iconUpload
    })
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
    });
};

// System Time Methods
const updateNtp = () => {
    const req: UpdateNtpAddressReq = {
        ntp: sysTimeState.form.ntp
    };

    sysTimeState.form.loading = true;
    api.updateNtpAddress(req)
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
.tab-content {
    padding: 20px;
}

.basic-info-container {
    display: flex;
    flex-direction: row;
    gap: 40px;
    margin-top: 20px;

    .logo-form {
        flex-shrink: 0;
    }
}

.logo-container {
    position: relative;
    width: 200px;
    height: 60px;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
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
