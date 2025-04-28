<template>
    <el-drawer size="40%" v-model="state.open" :close-on-click-modal="false">
        <template #header>
            <h3>{{ state.title }}</h3>
        </template>
        <template #default>
            <div style="padding-top: 20px">
                <el-steps :active="state.active + 1" align-center>
                    <el-step :title="$t('message.adDomain.addStep1')" />
                    <el-step :title="$t('message.adDomain.addStep2')" />
                </el-steps>
            </div>
            <div style="padding: 20px;">
                <h3>{{ $t('message.adDomain.addDesc1') }}</h3>
                <p style="margin-top: 10px;">{{ $t('message.adDomain.addDesc2') }}</p>
                <el-form class="drawer-form" label-position="left" label-width="120px" ref="ruleFormRef" :rules="rules"
                    :model="state.data">
                    <el-row class="mb20">
                        <el-col :span="20">
                            <el-form-item prop="name">
                                <template #label>
                                    <el-tooltip class="box-item" effect="dark"
                                        :content="$t('message.adDomain.addTooltip')" placement="top">
                                        {{ $t('message.adDomain.dcHostname') }}
                                    </el-tooltip>
                                    :</template>
                                <el-input v-model="state.data.name" :clearable="true" :disabled="state.ro">
                                    <template #prepend>FQDN:</template>
                                    <template #append>:</template>
                                </el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="4">
                            <el-select v-model="state.data.port" :clearable="false" :disabled="state.ro">
                                <el-option label="389" value="389"></el-option>
                                <el-option label="1234" value="1234"></el-option>
                            </el-select>
                        </el-col>
                    </el-row>
                    <el-row :gutter="35">
                        <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
                            <el-form-item :label="$t('message.adDomain.dns') + ':'" prop="dns">
                                <el-input v-model="state.data.dns" :disabled="state.ro">
                                </el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row :gutter="35">
                        <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
                            <el-form-item :label="$t('message.adDomain.user') + ':'" prop="username">
                                <el-input v-model="state.data.username" :disabled="state.ro">
                                </el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row :gutter="35">
                        <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
                            <el-form-item :label="$t('message.adDomain.password') + ':'" prop="password">
                                <el-input v-model="state.data.password" show-password :disabled="state.ro">
                                </el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row :gutter="35">
                        <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
                            <el-form-item>
                                <el-button type="primary"
                                    @click="testDomain">{{ $t('message.adDomain.test') }}</el-button>
                            </el-form-item>
                        </el-col>
                    </el-row>
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
                        $t("message.tableCommon.nextStep") : $t("message.tableCommon.submit") }}</el-button>
            </div>
        </template>
    </el-drawer>
</template>

<script setup lang="ts">

import { reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { AddDomainReply, AddDomainReq, ListDomainReply_Details, UpdateDomainReply, UpdateDomainReq } from '/@/api/grpc/ada';
import { ElMessage, FormInstance, FormRules } from 'element-plus';
import api from '/@/api/grpc';
import { alertApiError, alertResult } from '/@/utils/error';

const { t } = useI18n();

interface RuleForm {
  name: string,
  dns: string,
  username: string,
  password: string,
  port: number,
}

const ruleFormRef = ref<FormInstance>();

const rules = reactive<FormRules<RuleForm>>({
    name: [
        { required: true, message: t('message.adDomain.requireDomainMsg'), trigger: 'change' },
        // {
        //     required: true,
        //     type: 'string',
        //     message: t('message.adDomain.formatDomainMsg'),
        //     trigger: 'change',
        //     // pattern: /^[\d\w]+\.[\d\w]{2,}[\d\w\.]+$/,
        //     pattern: /^[\d\w\.-]+\.[\w\.]{2,6}$/,
        // },
    ],
    username: [
        { required: true, trigger: 'blur', message: t('message.adDomain.requireUsernameMsg'), },
        // {
        //     required: true,
        //     type: 'string',
        //     trigger: 'change',
        //     message: t('message.adDomain.formatUsernameMsg') + 'user@domain',
        //     pattern: /^[\d\w]+[\\@][\d\w]+$/,
        // },
    ],
    dns: [
        { required: true, trigger: 'blur', message: t('message.adDomain.requireDnsMsg'), },
    ],
    password: [
        { required: true, trigger: 'blur', message: t('message.adDomain.requirePasswordMsg'), },
    ],
});

const initForm: RuleForm = {
    name: '',
    dns: '',
    username: '',
    password: '',
    port: 389,
};

type OnCloseFunc = () => void;

const state = reactive({
    open: false,
    title: '',
    id: '',
    data: initForm,
    active: 0,
    type: 'add',
    ro: false,
    onClose: null as OnCloseFunc | null,
});

const open = (title: string, type: string, row: ListDomainReply_Details | null, onClose: OnCloseFunc | null) => {
    ruleFormRef.value?.clearValidate();

    state.title = title;
    state.open = true;
    state.active = 0;
    state.type = type;
    state.ro = false;
    state.onClose = onClose;

    if (type === 'add') {
        state.data = initForm;
        state.id = '';
    } else if (row) {
        state.data = {
			name: row.domainInfo.server.replace(/^ldap:\/\//, ''),
			dns: row.domainInfo.dns,
			username: row.domainInfo.user,
			password: '', // row.domainInfo.password,
			port: 389,
        };
        state.id = row.iD;
    }
}

const doModify = () => {
    const req: UpdateDomainReq = {
        iD: state.id,
        ldapAddr: `ldap://${state.data.name}`, //:${state.data.port}`,
        username: state.data.username,
        password: state.data.password,
        dNS: state.data.dns
    };

    console.log('updateDomain', req);

    api.updateDomain(req)
    .then(resp => resp.response)
    .then((data: UpdateDomainReply) => {
        if (data.result === 'success') {
            ElMessage.success(t('message.adDomain.updateSucc'));
            state.open = false;
            if (state.onClose) {
                state.onClose();
            }
        } else {
            ElMessage.warning(t('message.adDomain.updateFail'))
        }
    })
    .catch(err => alertApiError(err));
};

const doAdd = () => {

    const req: AddDomainReq = {
        ldapAddr: `ldap://${state.data.name}`, //:${state.data.port}`,
        username: state.data.username,
        password: state.data.password,
        dNS: state.data.dns
    };

    console.log("addAdDomain", { ...req, ['password']: '******' });

    api.addDomain(req)
    .then(resp => resp.response)
    .then((data: AddDomainReply) => {
        if (data.result === 'success') {
            ElMessage.success(t('message.adDomain.addSucc'));
            state.open = false;
            if (state.onClose) {
                state.onClose();
            }
        } else {
            ElMessage.warning(t('message.adDomain.addFail'))
        }
    })
    .catch(err => alertApiError(err));
};

const testDomain = () => {

    ruleFormRef.value?.validate(ok => {

        if (!ok) {
            return;
        }

        const req = {
            ldapAddr: `ldap://${state.data.name}`, //:${state.data.port}`,
            username: state.data.username,
            password: state.data.password,
            dNS: state.data.dns
        };

        // console.log('testDomain', req);

        api.testDomain(req)
            .then(resp => resp.response)
            .then((data: AddDomainReply) => {
                alertResult(data.result, t('message.adDomain.testSucc'), t('message.adDomain.testFail'));
            })
            .catch(err => alertApiError(err));
    });
};

const nextStep = async (formEl: FormInstance | undefined) => {
    if (!formEl) return;

    if (state.active === 0) {
        await formEl.validate((valid, fields) => {
            if (valid) {
                state.active++;
            } else {
                console.log('error submit!', fields);
            }
        });
    } else {
        state.active++;
    }

    if (state.active === 1) {
        state.ro = true;
    }

    if (state.active === 2) {
        if (state.type === 'add') {
            doAdd();
        } else {
            doModify();
        }
    }
};

const prevStep = () => {
    if (state.active > 0) {
        state.active --;
    }
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

