<template>
    <div class="layout-pd">
        <el-card shadow="hover">
            <h3>{{ $t('message.system.basicInfo.title') }}</h3>
            <div class="basic-info-container">
                <el-form label-position="left" label-width="120px">
                    <el-form-item>
                        <template #label>
                            <h4>{{ $t('message.system.basicInfo.companyName') }}:</h4>
                        </template>
                        {{ state.data.companyName }}
                    </el-form-item>
                    <el-form-item>
                        <template #label>
                            <h4>{{ $t('message.system.basicInfo.companyWebsite') }}:</h4>
                        </template>
                        {{ state.data.companyWebsite }}
                    </el-form-item>
                    <el-form-item>
                        <template #label>
                            <h4>{{ $t('message.system.basicInfo.ip') }}:</h4>
                        </template>
                        {{ state.data.ip }}
                    </el-form-item>
                    <el-form-item>
                        <template #label>
                            <h4>{{ $t('message.system.basicInfo.systemName') }}:</h4>
                        </template>
                        {{ state.data.systemName }}
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
                                <div class="logo">
                                    <img class="el-upload-list__item-thumbnail logo" :src="state.icon" alt="" />
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
import { ElMessage, type UploadProps } from 'element-plus'
import { GetSystemInfoReply } from '/@/api/grpc/ada';
import api from '/@/api/grpc';
import { alertApiError, alertResult } from '/@/utils/error';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const state = reactive({
    data: {} as GetSystemInfoReply,
    icon: '',
    iconUpload: '',
});

const handleUpload = (options: any) => {
    if (state.iconUpload === '') {
        return;
    }

    api.updateProductIcon({
        file: state.iconUpload
    })
    .then(resp => resp.response)
    .then(data => {
        alertResult(data.result, t('message.system.basicInfo.updateProductIconSucc'), t('message.system.basicInfo.updateProductIconFail'))
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
    api.getProductIcon({})
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
</style>