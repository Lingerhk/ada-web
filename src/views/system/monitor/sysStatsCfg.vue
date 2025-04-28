<template>
    <el-row style="width: 100%;">
        <el-col :span="24">
            <el-descriptions :title="T('sysStatsCfg')" :column="3" size="default">
                <template #extra>
                    <el-space>
                        <el-button type="primary" @click="confirm" :disabled="isConfirmDisabled()"
                            :loading="state.confirming">{{ T('confirm')
                            }}</el-button>
                        <el-button @click="reset" :disabled="state.initing">{{ T('reset') }}</el-button>
                        <el-button @click="refresh" :loading="state.initing">{{ T('refresh') }}</el-button>
                    </el-space>
                </template>

                <el-descriptions-item v-for="field in fields" :key="field" align="left">
                    <template #label><span :class="isFieldChanged(field) ? 'modified' : ''">{{ T(field) }}</span></template>
                    <el-slider v-model="state.req[field]" :min="30" :max="99" show-input size="small" :marks="marks"
                        style="width: 80%;" :disabled="state.initing" />
                </el-descriptions-item>
            </el-descriptions>
        </el-col>
    </el-row>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import api from '/@/api/grpc';
import { alertApiError, alertResult } from '/@/utils/error';
import { SetSystemStatsCfgReq } from '/@/api/grpc/ada';
import { transMonitor as T } from '/@/utils/translator';

const state = reactive({
    req: {
        cpu_percent_notify: 30,
        disk_percent_notify: 30,
        mem_percent_notify: 30,
        es_cpu_percent_notify: 30,
        es_disk_percent_notify: 30,
        es_disk_percent_delete: 30,
    },
    initReq: {
        cpu_percent_notify: 30,
        disk_percent_notify: 30,
        mem_percent_notify: 30,
        es_cpu_percent_notify: 30,
        es_disk_percent_notify: 30,
        es_disk_percent_delete: 30,
    },
    confirming: false,
    initing: false,
});

const marks = reactive({
  0: '0%',
//   50: '50%',
  99: '99%',
});

const fields = ['cpu_percent_notify', 'disk_percent_notify', 'mem_percent_notify', 'es_cpu_percent_notify', 'es_disk_percent_notify', 'es_disk_percent_delete'];

const refresh = () => {
    state.initing = true;

    api.getSystemInfo({})
    .then(resp => resp.response)
    .then(info => {
        fields.forEach(field => {
            state.req[field] = Number(info.statsCfg[field] ?? 30);
        });
        state.initReq = { ...state.req };
        state.initing = false;
    })
    .catch(err => alertApiError(err));
};

const confirm = () => {
    let req: SetSystemStatsCfgReq = {
        stats: {},
    };
    fields.forEach(field => {
        req.stats[field] = `${state.req[field] ?? 30}`;
    });

    state.confirming = true;
    api.setSystemStatsCfg(req)
    .then(resp => resp.response)
    .then(result => {
        alertResult(result.result, T('setSucc'), T('setFail'));
    })
    .catch(err => alertApiError(err))
    .finally(() => {
        state.confirming = false;
        refresh();
    });
};

const reset = () => {
    state.req = { ...state.initReq };
};

const isConfirmDisabled = () => {
    return fields.map(field => {
        return state.req[field] === state.initReq[field];
    }).reduce((a, b) => a && b);
};

const isFieldChanged = (field: string): boolean => {
    return state.initReq[field] !== state.req[field];
};

onMounted(() => {
    refresh();
});

</script>

<style lang="scss" scoped>
.modified {
    font-weight: bold;
}

.modified::before {
    content: '* '
}
</style>

