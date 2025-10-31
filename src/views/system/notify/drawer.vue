<template>
    <el-drawer v-model="model" :size="800">
        <template #header>
            <h3>{{ props.ro ? T('templateTitle') : T('templateEditTitle') }}</h3>
        </template>
        <template #default>
            <div style="padding-top: 20px" v-if="!props.ro">
                <el-steps :active="state.active + 1" align-center>
                    <el-step :title="T('step1')" />
                    <el-step :title="T('step2')" />
                </el-steps>
            </div>
            <el-row style="padding: 20px">
                <el-space direction="vertical" style="width: 100%" alignment="normal">
                    <el-alert type="warning" :title="T(`templateAlert_${props.data.notifyType}`)" show-icon
                        :closable="false" />
                    <el-form :model="form" label-position="left" :label-width="150">
                        <!-- item 1 -->
                        <el-form-item>
                            <template #label>
                                <span class="form-item-label">{{ T('moduleName') }}</span>
                            </template>
                            <span>{{ T(`module_${props.data.moduleName}`) }}</span>
                        </el-form-item>
                        <!-- item 2 -->
                        <el-form-item>
                            <template #label>
                                <span class="form-item-label">{{ T('notifyType') }}</span>
                            </template>
                            <span>{{ formatNotifyTypeFromUpdateReq(props.data.notifyType,
                                form.metadata.application_type) }}</span>
                        </el-form-item>
                        <!-- item 3 enable -->
                        <el-form-item>
                            <template #label>
                                <span class="form-item-label">{{ T('enable') }}</span>
                            </template>
                            <el-switch v-model="form.enable" active-value="enable" inactive-value="disable"
                                :disalbe="ro" />
                        </el-form-item>
                        <!-- item 4 level -->
                        <el-form-item v-if="props.data.moduleName !== 'system'">
                            <template #label>
                                <span class="form-item-label">{{ T('rule') }}</span>
                            </template>
                            <LevelCheckbox v-model="form.level" text check-all :disabled="ro" />
                        </el-form-item>
                        <!-- item 5 endpoint -->
                        <!-- <el-form-item>
                            <template #label>
                                <span class="form-item-label">{{ T('endpoint') }}</span>
                            </template>
                            <el-input v-model="form.endpoint" :disabled="ro" />
                        </el-form-item> -->
                    </el-form>
                    <el-row style="margin-top: 10px;">
                        <EmailEditor v-if="props.data.notifyType === 'email'" v-model="form.metadata" :ro="ro"
                            :test-loading="testLoading" @test="testNotifyConf" ref="editorRef" />
                        <SyslogEditor v-if="props.data.notifyType === 'syslog'" v-model="form.metadata" :ro="ro"
                            :test-loading="testLoading" :endpoint="form.endpoint" @test="testNotifyConf"
                            ref="editorRef" />
                        <Webhook v-if="props.data.notifyType === 'webhook'" v-model="form.metadata" :ro="ro"
                            :test-loading="testLoading" @test="testNotifyConf" ref="editorRef"
                            :endpoint="form.endpoint" />
                    </el-row>
                </el-space>
            </el-row>
        </template>
        <template #footer>
            <div style="display: flex; justify-content: space-between; padding: 20px;">
                <el-button v-if="state.active === 0" @click="model = false">{{ $t('message.drawer.close')
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
import './style.scss';

import { computed, reactive, ref, watch } from 'vue';
import { transNotify as T } from '/@/utils/translator';
import { ListNotifyConfReply_Details, TestNotifyConfReq, UpdateNotifyConfReq } from '/@/api/grpc/ada';
import api from '/@/api/grpc';
import LevelCheckbox from '/@/components/level/checkbox.vue';
import EmailEditor from './editor/emailEditor.vue';
import SyslogEditor from './editor/syslogEditor.vue';
import Webhook from './editor/webhook.vue';

import { alertApiError, alertResult } from '/@/utils/error';
import { formatNotifyTypeFromUpdateReq } from './constant';


const model = defineModel({
    required: true,
    type: Boolean,
    default: false
});

const props = defineProps<{
    ro: boolean;
    data: ListNotifyConfReply_Details;
}>();

const state = reactive({
    active: 0,
});

const form = ref<UpdateNotifyConfReq>({
    id: '',
    enable: '',
    endpoint: '',
    level: [],
    metadata: {},
});
const editorRef = ref();

const testLoading = ref(false);
const ro = computed(() => props.ro || state.active !== 0);

watch(() => model.value, (val) => {
    if (!val) {
        return 0;
    }

    state.active = 0;
    form.value = {
        id: props.data.id, // [(validator.field) = {string_not_empty: true}];
        enable: props.data.enable, // [(validator.field) = {regex: "enable|disable"}]; //启用状态， 开启enable 关闭disable
        endpoint: props.data.endpoint,
        level: [],
        metadata: { ...props.data.metadata }, // 都有: alert_interval: 20(str), 可选: email类型: server(str),port(str),username,password,receiver; syslog类型; webhook类型: application_type(weixin/feishu/dingtalk/common)
    }
});

const testNotifyConf = () => {

    testLoading.value = true;

    const { endpoint, ...rest } = form.value.metadata;

    const req: TestNotifyConfReq = {
        moduleName: props.data.moduleName,
        notifyType: props.data.notifyType,
        endpoint,
        metadata: rest,
    };

    console.log('testNotifyConf', req);

    api.testNotifyConf(req)
    .then(resp => resp.response)
    .then(data => {
        console.log("testNotifyConf return", data);
        alertResult(data.result, data.msg, data.msg);
    })
    .catch(err => alertApiError(err))
    .finally(() => testLoading.value = false);
};

const prevStep = () => {
    if (state.active > 0) {
        state.active --;
    }
};

const nextStep = async () => {
    if (state.active >= 2) {
        return;
    }

    if (state.active === 0) {
        // validate
        const valid = await editorRef.value.validate();
        if (!valid) {
            return;
        }
    } else if (state.active === 1) {
        const { endpoint, ...metadata} = form.value.metadata;
        const req: UpdateNotifyConfReq = {
            id: form.value.id,
            enable: form.value.enable,
            endpoint,
            level: form.value.level,
            metadata, // 都有: alert_interval: 20(str), 可选: email类型: server(str),port(str),username,password,receiver; syslog类型; webhook类型: application_type(weixin/feishu/dingtalk/common)
        };
        console.log('updateNotifyConf', req);

        api.updateNotifyConf(req)
        .then(resp => resp.response)
        .then(data => {
            alertResult(data.result, T('updateNotifyConfSucc'), T('updateNotifyConfFail'));
            model.value = false;
        })
        .catch(err => alertApiError(err));
    }


    state.active += 1;
};

</script>