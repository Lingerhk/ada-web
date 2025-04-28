<template>
    <el-drawer size="40%" v-model="state.open" :close-on-click-modal="false">
        <template #header>
            <h3>{{ state.title }}</h3>
        </template>
        <template #default>
            <div style="padding-top: 20px">
                <el-steps :active="state.active + 1" align-center>
                    <el-step :title="T('step1')" />
                    <el-step :title="T('step2')" />
                </el-steps>
            </div>
            <div style="padding: 20px;">
                <el-form class="drawer-form" label-position="left" label-width="120px" ref="ruleFormRef" :rules="rules"
                    :model="state.form" :disabled="state.active !== 0">
                    <h3>{{ T('drawerHeader') }}</h3>
                    <p style="margin-top: 10px;">{{ T('drawerSubHeader') }}</p>
                    <el-form-item style="margin-top: 10px;" prop="name" :label="T('name')">
                        <el-input v-model="state.form.name" :placeholder="T('namePlaceholder')" />
                    </el-form-item>
                    <el-form-item prop="domain" :label="T('domain')">
                        <el-select v-model="state.form.domain" :placeholder="T('domainPlaceholder')"
                            style="width: 100%;">
                            <el-option v-for="item in state.domainOptions" :key="item.value" :label="item.label"
                                :value="item.value" />
                        </el-select>
                    </el-form-item>
                    <!-- 阻断用户 -->
                    <el-form-item prop="userBlock" :label="T('userBlock')">
                        <el-switch v-model="state.form.userBlock" />
                    </el-form-item>
                    <!-- 阻断用户列表 -->
                    <template v-if="state.form.userBlock">
                        <el-form-item v-for="(_, idx) in state.form.userList" :key="idx"
                            :rules="[{ required: true, message: T('addBlockUserPlaceholder') }]">
                            <el-space>
                                <el-autocomplete v-model="state.form.userList[idx]"
                                    :fetch-suggestions="(s, cb) => search('user', s, cb)" style="width: 300px;"
                                    :placeholder="T('addBlockUserPlaceholder')"></el-autocomplete>
                                <el-button type="danger" @click="state.form.userList.splice(idx, 1)">{{ T("delete")
                                    }}</el-button>
                            </el-space>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="state.form.userList.push('')">{{ T("addBlockUser")
                                }}</el-button>
                        </el-form-item>
                    </template>
                    <!-- 阻断IP -->
                    <el-form-item prop="ipBlock" :label="T('ipBlock')">
                        <el-switch v-model="state.form.ipBlock" />
                    </el-form-item>
                    <!-- 阻断IP列表 -->
                    <template v-if="state.form.ipBlock">
                        <el-form-item v-for="(_, idx) in state.form.ipList" :key="idx"
                            :rules="[{ required: true, validator: validateIp, message: T('addBlockIpPlaceholder') }]">
                            <el-space>
                                <el-input v-model="state.form.ipList[idx]" style="width: 300px;"
                                    :placeholder="T('addBlockIpPlaceholder')"></el-input>
                                <el-button type="danger" @click="state.form.ipList.splice(idx, 1)">{{ T("delete")
                                    }}</el-button>
                            </el-space>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="state.form.ipList.push('')">{{ T("addBlockIp")
                                }}</el-button>
                        </el-form-item>
                    </template>
                    <el-form-item prop="remark" :label="T('remark')">
                        <el-input v-model="state.form.remark" type="textarea" :rows="3" />
                    </el-form-item>
                </el-form>
            </div>
        </template>
        <template #footer>
            <div style="display: flex; justify-content: space-between; padding: 20px;">
                <el-button v-if="state.active === 0" @click="state.open = false">{{ $t('message.tableCommon.close')
                    }}</el-button>
                <el-button v-if="state.active !== 0" @click="prevStep()" type="primary">{{
                    $t('message.tableCommon.prevStep') }}</el-button>
                <el-button @click="nextStep(ruleFormRef)" type="primary"> {{ state.active < 1 ?
                        $t('message.tableCommon.nextStep') : $t('message.tableCommon.complete') }}</el-button>
            </div>
        </template>
    </el-drawer>
</template>

<script setup lang="ts">

import { reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { ListDomainEntryReq, ListThreatBlockReply_Details } from '/@/api/grpc/ada';
import { FormInstance, FormRules } from 'element-plus';
import api from '/@/api/grpc';
import { alertApiError, alertResult } from '/@/utils/error';
import { OptionType } from '/@/utils/constant';
import { listDomainOptions } from '/@/api/grpc/method';
import { transThreatBlock as T } from '/@/utils/translator';
import { validateIp } from '/@/utils/validator';

const { t } = useI18n();

const ruleFormRef = ref<FormInstance>();

const initForm = {
    name: '', // 名称
    domain: '', // 所在域
    userBlock: false, // 是否阻断用户 如果为false, userList为空
    ipBlock: false, // 是否阻断IP 如果为false, ipList为空
    userList: [] as string[], // 阻断用户
    ipList: [] as string[], // 阻断IP
    remark: '', // 备注
};

const rules = reactive<FormRules<typeof initForm>>({
    domain: [{ required: true, message: T('requireDomain'), trigger: 'blur' }],
    name: [{ required: true, message: T("requireName"), trigger: 'change', }],
});

const state = reactive({

    open: false,
    title: '',
    isNew: true,

    id: '',
    form: { ...initForm },

    active: 0,
    domainOptions: [] as OptionType[],
    onClose: () => { },
});

const open = (data: ListThreatBlockReply_Details | null, onClose: () => void) => {
    ruleFormRef.value?.clearValidate();

    state.open = true;
    state.active = 0;

    state.title = data ? T('modTitle') : T('addTitle');
    state.isNew = data === null;

    if (state.isNew) {
        state.form = { ...initForm };
    } else {
        const { iD, ...form } = data;
        state.form = { ...form }
        state.form.userList = [...form.userList];
        console.log('form', form.userList)
    }

    state.onClose = onClose;

    listDomainOptions().then(o => state.domainOptions = o);
}

const submit = () => {
    let promise = null;

    if (state.isNew) {
        promise = api.addThreatBlock(state.form).then(resp => resp.response);
    } else {
        promise = api.updateThreatBlock({ iD: state.id, ...state.form }).then(resp => resp.response);
    }

    promise.then(data => {
        const ok = alertResult(data.result, T('submitSuccess'), T('submitFailed'));
        if (ok) {
            state.open = false;
            state.onClose();
        }
    })
    .catch(err => alertApiError(err));
};

const nextStep = async (formEl: FormInstance | undefined) => {
    if (!formEl) return;

    if (state.active == 1) {
        // doAddSensitiveEntry();
        submit();
        return;
    }

    if (state.active === 0) {
        await formEl.validate((valid, fields) => {
            if (valid) {
                state.active++;
                console.log('form', state.form);
            } else {
                console.log('error submit!', fields);
            }
        });
    } else {
        state.active++;
    }

};

const prevStep = () => {
    if (state.active > 0) {
        state.active--;
    }
}

watch(() => state.form.userBlock, (val) => {

    if (!val) {
        return;
    }

    if (state.form.userList.length === 0) {
        return;
    }

    state.form.userList = [''];
});

const search = (type: string, queryString: string, cb: any) => {
    if (!state.form.domain) {
        cb([]);
        return;
    }

    // fetch names from server
    const req: ListDomainEntryReq = {
        type,
        domain: state.form.domain,
        search: queryString,
    };

    console.log('listDomainEntry request', req);
    api.listDomainEntry(req)
    .then(resp => resp.response)
    .then(data => {
        const suggestions = data.entries.map(value => ({ value }));
        cb(suggestions);
    })
    .catch(err => {
        // alertApiError(err);
        cb([]);
    });
}

defineExpose({
    open,
});
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
