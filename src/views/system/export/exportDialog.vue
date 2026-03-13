<template>
    <el-dialog v-model="model" :title="T('title')" :width="600" :close-on-click-modal="false"
        :close-on-press-escape="false">
        <template #footer>
            <el-button @click="cancel">{{ T('cancel') }}</el-button>
            <el-button type="primary" @click="confirm(formRef)" :loading="state.loading">{{ T('confirm') }}</el-button>
        </template>
        <template #default>
            <el-form ref="formRef" :rules="rules" :model="state.req">
                <el-space direction="vertical" alignment="flex-start" style="width: 100%;" :fill="true">
                    <el-row style="padding: 20px 0px">
                        <el-col :span="24" class="explain">{{ T('explain1') }}</el-col>
                        <el-col :span="24" class="explain">{{ T('explain2') }}</el-col>
                    </el-row>
                    <el-divider content-position="left"><span class="explain">* {{ T('exportName')
                            }}</span></el-divider>
                    <el-form-item prop="name" required>
                        <el-input v-model="state.req.name"></el-input>
                    </el-form-item>
                    <el-divider content-position="left" v-if="props.type !== 'audit'"><span class="explain">{{
                            T('domain')
                            }}</span></el-divider>
                    <el-row v-if="props.type !== 'audit'">
                        <Checkbox v-model="domainRef" :options="state.domainOptions" />
                    </el-row>
                    <el-divider content-position="left" v-if="props.type !== 'audit'"><span class="explain">{{
                            T('level') }}</span></el-divider>
                    <el-row v-if="props.type !== 'audit'">
                        <LevelCheckbox text v-model="level" check-all />
                    </el-row>
                    <el-divider content-position="left"><span class="explain">{{ T('timeRange') }}</span></el-divider>
                    <el-row>
                        <el-date-picker size="default" v-model="timeRangeRef" type="datetimerange"
                            :range-separator="$t('message.time.to')" :start-placeholder="$t('message.time.start')"
                            :end-placeholder="$t('message.time.end')" :shortcuts="shortcuts" />
                    </el-row>
                </el-space>
            </el-form>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { transExport as T, transExport } from '/@/utils/translator';
import { listDomainOptions } from '/@/api/grpc/method';
import { OptionType } from '/@/utils/constant';
import { AddExportTaskReq } from '/@/api/grpc/ada';
import Checkbox from '/@/components/domain/checkbox.vue';
import { formatApiTime, shortcuts } from '/@/utils/formatTime';
import api from '/@/api/grpc';
import { alertApiError, alertResult } from '/@/utils/error';
import { FormInstance, FormRules } from 'element-plus';
import LevelCheckbox from '/@/components/level/checkbox.vue';

const model = defineModel({
    type: Boolean,
    default: false,
});

const props = defineProps({
    type: String,
});

const state = reactive({
    domainOptions: [] as OptionType[],
    req: {
        name: '',
        type: '',
        params: {},
    } as AddExportTaskReq,
    loading: false,
});

const domainRef = ref([]);
const timeRangeRef = ref([]);
const level = ref([]);

const formRef = ref<FormInstance>();

interface RuleForm {
    name: string;
}

const rules = reactive<FormRules<RuleForm>>({
    name: [
        { required: true, message: transExport('requireName'), trigger: 'change' },
    ],
});

const cancel = () => {
    model.value = false;
};

const confirm = async (formEl: FormInstance) => {
    if (!props.type) {
        return;
    }

    const ok = await formEl.validate(v => v);
    if (!ok) {
        return;
    }

    state.req.type = props.type;
    state.loading = false;


    api.addExportTask(state.req)
    .then(resp => resp.response)
    .then(data => {
        const ok = alertResult(data.result, T('succ'), T('fail'));
        if (ok) {
            cancel();
        }
    })
    .catch(err => alertApiError(err))
    .finally(() => state.loading = false);
};

watch(() => model.value, (val) => {
    if (!val) {
        return;
    }

    state.req.name = '';
    state.req.params = {};
    state.req.type = '';

    level.value = [];
    timeRangeRef.value = [];

    listDomainOptions().then(opts => state.domainOptions = opts);
    formRef.value?.clearValidate();
});

watch(timeRangeRef, (value) => {
    if (!value) {
        delete state.req.params['end_tm'];
        delete state.req.params['start_tm'];
    } else if (value.length === 2) {
        state.req.params['start_tm'] = formatApiTime(value[0]);
        state.req.params['end_tm'] = formatApiTime(value[1]);
    } else {
        delete state.req.params['end_tm'];
        delete state.req.params['start_tm'];
    }
});

watch(domainRef, (value) => {
    if (!value || value.length === 0) {
        delete state.req.params['domain'];
    } else {
        state.req.params['domain'] = value.join(',');
    }
});

watch(level, (value) => {
    if (!value || value.length === 0) {
        delete state.req.params['level'];
    } else {
        state.req.params['level'] = value.join(',');
    }
});

</script>

<style lang="scss" scoped>
.explain {
    font-size: 16px;
}
</style>
