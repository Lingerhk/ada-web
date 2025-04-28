<template>
    <div class="layout-pd">
        <el-card shadow="hover">
            <el-form label-width="auto" :inline="true">
                <el-form-item>
                    <template #label>{{ $t('message.system.diagnose.type') }}</template>
                    <el-radio-group v-model="state.req.type">
                        <el-radio v-for="t in DebugTypes" :value="t">{{ t }}</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item>
                    <el-input size="default" style="width: 300px;" v-model="state.req.target"
                        :placeholder="$t('message.system.diagnose.targetPlaceholder')"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button size="default" type="primary" @click="handleSubmit">{{ $t('message.tableCommon.submit')
                        }}</el-button>
                </el-form-item>
            </el-form>
            <div>
                <el-input v-loading="state.loading" v-model="state.result" style="width: 830px" :autosize="{ minRows: 10 }" type="textarea" readonly />
            </div>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { NetworkDebugReq } from '/@/api/grpc/ada';
import api from '/@/api/grpc';
import { useI18n } from 'vue-i18n';
import { alertApiError } from '/@/utils/error';

const { t } = useI18n();

const DebugTypes = ['ping', 'nslookup', 'traceroute', 'nc'];

const state = reactive({
    req: {
        type: 'ping',
        target: '',
    } as NetworkDebugReq,
    loading: false,
    result: '',
});

const handleSubmit = () => {
    state.loading = true;

    api.networkDebug(state.req)
    .then(resp => resp.response)
    .then(data => {
        state.result = data.result;
    })
    .catch(err => {
        alertApiError(err);

    })
    .finally(() => {
        state.loading = false;
    });
};

</script>
