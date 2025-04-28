<template>
    <el-drawer size="40%" v-model="state.open" :close-on-click-modal="false">
        <template #header>
            <h3>{{ state.title }}</h3>
        </template>
        <template #default>
            <div style="padding-top: 20px">
                <el-steps :active="state.active" finish-status="success" align-center>
                    <el-step :title="$t('message.sysConfig.sensorConfig.editStep1')" />
                    <el-step :title="$t('message.sysConfig.sensorConfig.editStep2')" />
                </el-steps>
            </div>
            <el-form class="drawer-form" :disabled="state.active !== 0">
                <el-form-item>
                    <template #label>
                        <h3>{{ $t('message.sysConfig.sensorConfig.perfLimit') }}: </h3>
                    </template>
                    <template #default>
                        <div class="slider-block">
                            <span>CPU:</span>
                            <el-row>
                                <el-col :span="20">
                                    <el-slider v-model="state.form.cpu" />
                                </el-col>
                                <el-col :span="4" style="padding-left: 30px;">{{ state.form.cpu }}%</el-col>
                            </el-row>
                        </div>
                        <div class="slider-block">
                            <span>{{ $t('message.sysConfig.sensorConfig.memory') }}:</span>
                            <el-row>
                                <el-col :span="20">
                                    <el-slider v-model="state.form.mem" />
                                </el-col>
                                <el-col :span="4" style="padding-left: 30px;">{{ state.form.mem }}%</el-col>
                            </el-row>
                        </div>
                    </template>
                </el-form-item>
                <el-form-item>
                    <template #label>
                        <h3>{{ $t('message.sysConfig.sensorConfig.logSwitch') }}:</h3>
                    </template>
                    <template #default>
                        <el-switch v-model="state.form.logSwitch" size="small"></el-switch>
                    </template>
                </el-form-item>
                <el-form-item>
                    <template #label>
                        <h3>{{ $t('message.sysConfig.sensorConfig.pktSwitch') }}:</h3>
                    </template>
                    <template #default>
                        <el-switch v-model="state.form.pktSwitch" size="small"></el-switch>
                    </template>
                </el-form-item>
                <el-form-item>
                    <template #label>
                        <h3>{{ $t('message.sysConfig.sensorConfig.rpcFwPluginSwitch') }}:</h3>
                    </template>
                    <template #default>
                        <el-switch v-model="state.form.rpcFwPluginSwitch" size="small"></el-switch>
                    </template>
                </el-form-item>
                <el-form-item>
                    <template #label>
                        <h3>{{ $t('message.sysConfig.sensorConfig.ldapFwPluginSwitch') }}:</h3>
                    </template>
                    <template #default>
                        <el-switch v-model="state.form.ldapFwPluginSwitch" size="small"></el-switch>
                    </template>
                </el-form-item>
                <el-form-item>
                    <template #label>
                        <h3>{{ $t('message.sysConfig.sensorConfig.bindNetIface') }}:</h3>
                    </template>
                    <template #default>
                        <el-checkbox-group v-model="state.form.selectedIfaces">
                            <el-checkbox v-for="(ip, iface) in state.data?.netIface" :key="iface" :label="iface">
                                {{ ip }}
                            </el-checkbox>
                        </el-checkbox-group>
                    </template>
                </el-form-item>
                <el-form-item>
                    <template #label>
                        <h3>{{ $t('message.sysConfig.sensorConfig.remark') }}:</h3>
                    </template>
                    <template #default>
                        <el-input v-model="state.form.remark" style="width: 100%" :autosize="{ minRows: 2, maxRows: 4 }"
                            type="textarea" :placeholder="$t('message.sysConfig.sensorConfig.remarkPlaceholder')" />
                    </template>
                </el-form-item>
            </el-form>
        </template>
        <template #footer>
            <div style="display: flex; justify-content: space-between; padding: 20px;">
                <el-button v-if="state.active === 0" @click="state.open = false">{{ $t('message.drawer.close')
                    }}</el-button>
                <el-button v-if="state.active !== 0" @click="prevStep" type="primary">{{ $t('message.drawer.prev')
                    }}</el-button>
                <el-button @click="nextStep" type="primary"> {{ state.active < 1 ? $t('message.drawer.next') :
                    $t('message.drawer.confirm') }}</el-button>
            </div>
        </template>
    </el-drawer>
</template>

<script setup lang="ts">

import { reactive, ref } from 'vue';
import { ListSensorReply_Details, UpdateSensorReq } from '/@/api/grpc/ada';
import api from '/@/api/grpc';
import { alertApiError, alertResult } from '/@/utils/error';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const state = reactive({
    open: false,
    title: '',
    data: null as ListSensorReply_Details | null,
    active: 0,
    form: {
        cpu: 0,
        mem: 0,
        logSwitch: false,
        pktSwitch: false,
        rpcFwPluginSwitch: false, // rpcfw插件开关: true|false
        ldapFwPluginSwitch: false, // ldapfw插件开关: true|false
        remark: '',
        selectedIfaces: [] as string[],
    },
    cb: null as any | null,
})

const open = (title: string, row: ListSensorReply_Details, cb: () => void) => {
    state.open = true;
    state.title = title;
    state.data = row;
    state.active = 0;
    state.cb = cb;
    state.form.cpu = parseFloat(row.perfLimit.limit_cpu_max) * 100;
    state.form.mem = parseFloat(row.perfLimit.limit_mem_max) * 100;
    state.form.pktSwitch = row.pktPluginSwitch === 'true';
    state.form.logSwitch = row.logPluginSwitch === 'true';
    state.form.rpcFwPluginSwitch = row.rpcFwPluginSwitch === 'true';
    state.form.ldapFwPluginSwitch = row.ldapFwPluginSwitch === 'true';
    state.form.remark = row.remark;
    state.form.selectedIfaces = row.bindNetIface ? [...row.bindNetIface] : [];
}

const prevStep = () => {
    if (state.active > 0) {
        state.active --;
    }
}

const nextStep = () => {
    state.active++;
    if (state.active == 2) {
        if (!state.data) {
            return;
        }

        const req: UpdateSensorReq = {
            iD: state.data.iD,
            bindNetIface: state.form.selectedIfaces,
            perfLimit: {
                limit_cpu_max: `${state.form.cpu / 100}`,
                limit_mem_max: `${state.form.mem / 100}`
            },
            remark: state.form.remark,
            pktPluginSwitch: state.form.pktSwitch ? 'true' : 'false',
            logPluginSwitch: state.form.logSwitch ? 'true' : 'false',
            rpcFwPluginSwitch: state.form.rpcFwPluginSwitch ? 'true' : 'false',
            ldapFwPluginSwitch: state.form.ldapFwPluginSwitch ? 'true' : 'false',
        };

        console.log('updateSensor', req);
        
        api.updateSensor(req)
        .then(resp => resp.response)
        .then(data => {
            alertResult(data.result, t('message.sysConfig.sensorConfig.editSucc'), t('message.sysConfig.sensorConfig.editFail'));
            state.open = false;
            if (state.cb) {
                state.cb();
            }
        })
        .catch(err => alertApiError(err));
    }
}

defineExpose({
    open,
})
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