<template>
    <div class="layout-pd">
        <el-card shadow="hover">
            <h3>{{ $t('message.system.basicInfo.title') }}</h3>
            <div class="basic-info-container">
                <el-form label-position="left" label-width="120px">
                    <el-form-item>
                        <template #label>
                            <h4>{{ $t('message.system.basicInfo.systemName') }}:</h4>
                        </template>
                        {{ state.data.systemName }}
                    </el-form-item>
                    <el-form-item>
                        <template #label>
                            <h4>{{ $t('message.system.basicInfo.ip') }}:</h4>
                        </template>
                        {{ state.data.systemIP }}
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
                                    <img class="logo-img" :src="state.icon" alt="Logo" />
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
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import { ElMessage, type UploadProps, ElMessageBox } from 'element-plus'
import { GetSystemInfoReply, UpdateSystemCfgReq } from '/@/api/grpc/ada';
import api from '/@/api/grpc';
import { alertApiError, alertResult } from '/@/utils/error';
import { useI18n } from 'vue-i18n';
import { Edit } from '@element-plus/icons-vue';

const { t } = useI18n();

const state = reactive({
    data: {} as GetSystemInfoReply,
    icon: '',
    iconUpload: '',
});

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
    .catch(() => {
        // Action cancelled
    });
};

const handleUpdateIP = (newIP: string) => {
    const req: UpdateSystemCfgReq = {
        systemIP: newIP,
        ntp: '',
        file: '',
        upgradeSrv: '',
        upgradeRule: '',
    };
    api.updateSystemCfg(req)
    .then(resp => resp.response)
    .then(data => {
        alertResult(data.result, t('message.system.basicInfo.updateIPSucc'), t('message.system.basicInfo.updateIPFail'));
        if (data.result === 'SUCCESS') {
            refreshInfo();
        }
    })
    .catch(err => alertApiError(err));
};

const handleUpload = (options: any) => {
    if (state.iconUpload === '') {
        return;
    }

    const req: UpdateSystemCfgReq = {
        file: state.iconUpload,
        systemIP: '',
        ntp: '',
        upgradeSrv: '',
        upgradeRule: '',
    };
    api.updateSystemCfg(req)
    .then(resp => resp.response)
    .then(data => {
        alertResult(data.result, t('message.system.basicInfo.updateSystemIconSucc'), t('message.system.basicInfo.updateSystemIconFail'))
    })
    .catch(err => alertApiError(err))
    .finally(() => refreshIcon());
};

const beforeUpload: UploadProps['beforeUpload'] = (rawFile) => {
    if (rawFile.type !== 'image/png') {
        ElMessage.error(t('message.system.basicInfo.uploadLogoFailFormat'));
        return false
    }
    else if (rawFile.size / 1024 / 1024 > 2) {
        ElMessage.error(t('message.system.basicInfo.uploadLogoFailSize'));
        return false
    }
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target === null) {
                state.iconUpload = '';
                resolve(false);
            } else {
                state.iconUpload = e.target.result as string;
                state.iconUpload = state.iconUpload.replace(/^data:.*?;base64,/, '');
                console.log(state.iconUpload);
                resolve(true);
            }
        };
        reader.onerror = error => reject(error);

        reader.readAsDataURL(rawFile);
    });
}

const refreshInfo = () => {
    api.getSystemInfo({})
    .then(resp => resp.response)
    .then(data => state.data = data)
    .catch(err => alertApiError(err));
};

const refreshIcon = () => {
    api.getSystemIcon({})
    .then(resp => resp.response)
    .then(data => {
        if (!state.icon.startsWith('data:image/png;base64,')) {
            state.icon = `data:image/png;base64,${data.icon}`
        } else {
            state.icon = data.icon
        }
    })
    .catch(err => alertApiError(err));
};

onMounted(() => {
    refreshInfo();
    refreshIcon();
});
</script>

<style>
.basic-info-container {
    display: flex;
    flex-direction: row;
    padding-top: 20px;
}
.logo-form {
    margin-left: 80px;
}
.logo {
    width: 178px;
    height: 178px;
}

.logo-container {
    position: relative;
    width: 100px; /* Adjust size as needed */
    height: 100px; /* Adjust size as needed */
    border-radius: 50%;
    overflow: hidden;
    cursor: pointer;
    border: 2px solid #eee; /* Optional: adds a border */
    display: flex;
    align-items: center;
    justify-content: center;
}

.logo-img {
    width: 100%;
    height: 100%;
    object-fit: cover; /* Ensures the image covers the circle without distortion */
}

.logo-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent overlay */
    color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.logo-container:hover .logo-overlay {
    opacity: 1;
}

.logo-overlay .el-icon {
    margin-bottom: 5px;
}
</style>