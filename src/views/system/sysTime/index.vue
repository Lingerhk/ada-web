<template>
    <div class="layout-pd">
        <el-card shadow="hover">
            <h3>{{ T('sysTime') }}: {{ state.time }}</h3>
            <el-form style="margin-top: 30px;">
                <el-form-item>
                    <el-radio-group v-model="state.form.enable" class="ml-4">
                        <el-radio value="1" size="default">{{ T('enableNtp') }}</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item>
                    <template #label>
                        <h4>{{ T('ntp') }}:</h4>
                    </template>
                    <el-input size="default" v-model="state.form.ntp" style="width: 240px"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" size="default" @click="updateNtp" :loading="state.form.loading">{{ T('save') }}</el-button>
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>

<script setup lang="ts">

import { reactive, onMounted, onUnmounted } from 'vue';
import { getSystemInfo } from '/@/api/grpc/method';
import { transSysTime as T } from '/@/utils/translator';
import api from '/@/api/grpc';
import { UpdateSystemCfgReq } from '/@/api/grpc/ada';
import { alertApiError, alertResult } from '/@/utils/error';

const state = reactive({
    time: '',
    ts: 0,
    form: {
        loading: false,
        ntp: '',
        enable: '1',
    }
});

let intervalId = null as any;

const updateNtp = () => {
    const req: UpdateSystemCfgReq = {
        ntp: state.form.ntp,
        systemIP: '',
        file: '',
        upgradeSrv: '',
        upgradeRule: '',
    };

    state.form.loading = true;
    api.updateSystemCfg(req)
    .then(resp => resp.response)
    .then(data => alertResult(data.result, T('updateNtpSucc'), T('updateNtpFail')))
    .catch(err => alertApiError(err))
    .finally(() => state.form.loading = false);
};

onMounted(async () => {
    const info = await getSystemInfo();
    state.form.ntp = info.systemNtpAddress;
    state.ts= Number(info.systemTimestamp);

    intervalId = setInterval(() => {
        state.ts += 1;
        const now = new Date(state.ts * 1000);
        state.time = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
    }, 1000);
})

onUnmounted(() => {
    if (intervalId) {
        clearInterval(intervalId);
    }
})
</script>