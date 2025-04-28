<template>
    <div class="layout-pd">
        <el-card shadow="hover">
            <div class="basic-info-container">
                <el-form label-position="left" label-width="120px">
                    <el-form-item>
                        <template #label>
                            <h4>{{ $t('message.system.license.version') }}:</h4>
                        </template>
                        {{ state.data.version }}
                    </el-form-item>
                    <el-form-item>
                        <template #label>
                            <h4>{{ $t('message.system.license.endTime') }}:</h4>
                        </template>
                        {{ formatApiTime(new Date(Number(state.data.endTime) * 1000).toLocaleString()) }}
                    </el-form-item>
                    <el-form-item>
                        <template #label>
                            <h4>{{ $t('message.system.license.trait') }}:</h4>
                        </template>
                        {{ state.data.trait }}
                    </el-form-item>
                    <el-form-item>
                        <template #label>
                            <h4>{{ $t('message.system.license.partner') }}:</h4>
                        </template>
                        {{ state.data.partner }}
                    </el-form-item>
                    <el-form-item>
                        <template #label>
                            <h4>{{ $t('message.system.license.grantType') }}:</h4>
                        </template>
                        <el-radio-group v-model="state.methodToUpdateLicense" class="ml-4">
                            <el-radio v-for="item in licenseMethod" :value="item.value" size="default">
                                {{ item.label }}
                            </el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item v-if="state.methodToUpdateLicense === 'code'">
                        <div >
                            <el-input size="default" v-model="state.licenseCode" style="width: 240px;"
                                :placeholder="$t('message.system.license.inputLicenseCode')"></el-input>
                            <el-button style="margin-left: 10px;" size="default" type="primary" @click="submitlicenseKey">{{
                                $t('message.system.license.updateLicense') }}</el-button>
                        </div>
                    </el-form-item>
                    <el-form-item v-if="state.methodToUpdateLicense === 'file'">
                        <el-upload ref="uploadRef" action="#" :limit="1" :auto-upload="true" :show-file-list="false"
                            :before-upload="beforeUploadFile" :http-request="handleUploadFile">
                            <template #trigger>
                                <el-input size="default" v-model="state.licenseFilename" readonly
                                    style="width: 240px;"
                                    :placeholder="$t('message.system.license.uploadLicenseFilePlaceholder')">{{
                                    state.licenseFilename }}</el-input>
                            </template>
                            <el-button type="primary" size="default" style="margin-left: 10px;" @click="submitlicenseKey">{{
                                $t('message.system.license.uploadLicenseFile') }}</el-button>
                        </el-upload>
                    </el-form-item>
                </el-form>
            </div>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { GetLicenseReply } from '/@/api/grpc/ada';
import api from '/@/api/grpc';
import { alertApiError, alertResult } from '/@/utils/error';
import { formatApiTime } from '/@/utils/formatTime';
import { useI18n } from 'vue-i18n';
import { UploadProps } from 'element-plus';

const { t } = useI18n();

const uploadRef = ref();

const state = reactive({
    methodToUpdateLicense: 'file',
    licenseCode: '',
    licenseFilename: '',

    data: {} as GetLicenseReply,
});

const licenseMethod = ['code', 'file'].map(l => ({ value: l, label: t(`message.system.license.licenseType_${l}`)}));

const submitlicenseKey = () => {
    if (!state.licenseCode) {
        return;
    }

    api.updateLicense({
        licenseKey: state.licenseCode
    })
    .then(resp => resp.response)
    .then(data => {
        alertResult(data.result, t('message.system.license.updateLicenseSucc'), t('message.system.license.updateLicenseFail'));
        state.licenseFilename = '';
        state.licenseCode = '';
        refresh();
    })
    .catch(err => alertApiError(err));
};

const handleUploadFile = (options: any) => {
};

const beforeUploadFile: UploadProps['beforeUpload'] = (rawFile) => {

    state.licenseFilename = rawFile.name;

    const reader = new FileReader();
    reader.onload = (e) => {
        state.licenseCode = e.target.result; // 将文件内容存储到 Vue 组件的数据中
    };
    reader.readAsText(rawFile, 'utf-8'); // 读取文件为文本

    return false;
};

const refresh = () => {
    api.getLicense({})
    .then(resp => resp.response)
    .then(data => {
        state.data = data;
        console.log(data);
    })
    .catch(err => alertApiError(err));
};

onMounted(() => {
    refresh();
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