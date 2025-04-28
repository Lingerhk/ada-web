<template>
    <div class="layout-pd">
        <el-card shadow="hover">
            <el-row>
                <div>
                    <el-upload class="avatar-uploader"
                        action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15" :show-file-list="false"
                        :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
                        <img v-if="state.avatar" :src="state.avatar" class="avatar" />
                        <el-icon v-else class="avatar-uploader-icon">
                            <Plus />
                        </el-icon>
                    </el-upload>
                </div>
                <div class="user-info">
                    <h3>{{ T('title') }}</h3>
                    <el-form size="default" :label-position="labelPosition" label-width="100px"
                        style="display: flex; flex-direction: row; margin-top: 10px;">
                        <div>
                            <el-form-item>
                                <template #label><span class="form-label">{{ T('username') }}:</span></template>
                                {{ state.me?.username }}
                            </el-form-item>
                            <el-form-item>
                                <template #label><span class="form-label">{{ T('role') }}:</span></template>
                                {{ T("role_" + state.me?.role) }}
                            </el-form-item>
                        </div>
                        <div style="margin-left: 200px;">
                            <el-form-item>
                                <template #label><span class="form-label">{{ T('createTm') }}:</span></template>
                                {{ formatApiTime(state.me?.createTm) }}
                            </el-form-item>
                            <el-form-item>
                                <template #label><span class="form-label">{{ T('passwordStrength') }}:</span></template>
                                <span :class="'password-strength-'+state.me?.passStrength">{{ T('passwordStrength_'+state.me?.passStrength) }}</span>
                            </el-form-item>
                        </div>
                    </el-form>
                </div>
            </el-row>
        </el-card>
        <el-tabs type="border-card" style="margin-top: 20px;">
            <!-- MFA -->
            <el-tab-pane :label="T('mfa')">
                <el-space direction="vertical" size="default" style="width: 100%;" alignment="normal">
                    <el-alert :title="T('mfaHelp')" type="warning" show-icon :closable="false"/>
                    <span style="font-size: 16px; font-weight: bold;">{{ T('enableMfaText') }}</span>
                    <el-switch v-model="state.enableMfa" :before-change="beforeMfaSwitch"></el-switch>
                </el-space>

                <el-divider />
                <el-form v-if="state.enableMfa" size="default" :label-position="labelPosition" label-width="100px"
                    style="margin-top: 10px;" ref="mfaFormRef" :rules="mfaRules" :model="state.mfa" class="mfa-form">
                    <el-form-item>
                        <template #label><span class="form-label">{{ T('username') }}:</span></template>
                        {{ state.me?.username }}
                    </el-form-item>
                    <el-form-item>
                        <template #label><span class="form-label">{{ T('secret') }}:</span></template>
                        <el-input v-model="state.mfa.secret" style="width: 400px;"></el-input>
                        <el-button style="margin-left: 10px;" type="primary" @click="refreshQrCode">{{ T('refresh') }}</el-button>
                    </el-form-item>
                    <el-form-item>
                        <template #label><span class="form-label">{{ T('issuer') }}:</span></template>
                        {{ state.issuer }}
                    </el-form-item>
                    <el-form-item>
                        <template #label><span class="form-label">{{ T('qrCode') }}:</span></template>
                            <el-row>
                                <el-col><el-alert :title="T('qrCodeHelp')" type="warning" show-icon style="width: 500px;"/></el-col>
                                <!-- <QRCodeVue3 :height="160" :width="160" :value="state.totp" /> -->
                                <qrcode-vue :value="state.totp" :size="132" level="H" style="margin-top: 10px;"/>
                            </el-row>
                    </el-form-item>
                    <el-form-item prop="mfaCode">
                        <template #label><span class="form-label">{{ T('mfaCode') }}:</span></template>
                        <el-input v-model="state.mfa.mfaCode" style="width: 400px;"></el-input>
                    </el-form-item>
                    <el-form-item prop="password">
                        <template #label><span class="form-label">{{ T('password') }}:</span></template>
                        <el-input v-model="state.mfa.password" style="width: 400px;" show-password></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="enableMfa(mfaFormRef)">{{ T('save')}}</el-button>
                    </el-form-item>
                </el-form>
            </el-tab-pane>

            <!-- Profile -->
            <el-tab-pane :label="T('profile')">
                <el-form size="default" :label-position="labelPosition" label-width="auto" style="margin-top: 10px;" ref="formRef" :rules="rules" :model="state.form">
                    <h3 style="margin-bottom: 20px;">{{ T('coreInfo') }}</h3>
                    <el-form-item :label="T('realName')" label-width="100px">
                        <el-input v-model="state.form.realName" clearable style="width: 400px" :placeholder="T('realNamePlaceholder')"></el-input>
                    </el-form-item>
                    <h3 style="margin-bottom: 20px;">{{ T('businessInfo') }}</h3>
                    <el-form-item :label="T('department')" label-width="100px">
                        <el-input v-model="state.form.department" clearable style="width: 400px" :placeholder="T('departmentPlaceholder')"></el-input>
                    </el-form-item>
                    <el-form-item :label="T('post')" label-width="100px">
                        <el-input v-model="state.form.post" clearable style="width: 400px" :placeholder="T('postPlaceholder')"></el-input>
                    </el-form-item>
                    <h3 style="margin-bottom: 20px;">{{ T('contactInfo') }}</h3>
                    <el-form-item :label="T('address')" label-width="100px">
                        <el-input v-model="state.form.address" clearable style="width: 400px" :placeholder="T('addressPlaceholder')"></el-input>
                    </el-form-item>
                    <el-form-item :label="T('email')" label-width="100px" prop="email">
                        <el-input v-model="state.form.email" clearable style="width: 400px" :placeholder="T('emailPlaceholder')"></el-input>
                    </el-form-item>
                    <el-form-item :label="T('mobile')" label-width="100px" prop="mobile">
                        <el-input v-model="state.form.mobile" clearable style="width: 400px" :placeholder="T('mobilePlaceholder')"></el-input>
                    </el-form-item>
                    <h3 style="margin-bottom: 20px;">{{ T('otherInfo') }}</h3>
                    <el-form-item :label="T('remark')" label-width="100px">
                        <el-input v-model="state.form.remark" clearable type="textarea" style="width: 400px" :placeholder="T('remarkPlaceholder')"></el-input>
                    </el-form-item>
                    <el-form-item label-width="100px">
                        <el-button type="primary" @click="saveUserInfo(formRef)">{{ T('save') }}</el-button>
                    </el-form-item>
                </el-form>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, watch } from 'vue';
import api from '/@/api/grpc/index';
import { DisableMfaReq, EnableMfaReq, ListUserReply_Details, ListUserReq, UpdateUserReq } from '/@/api/grpc/ada';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance, FormRules, UploadProps } from 'element-plus'
import { useI18n } from 'vue-i18n';
import { alertApiError, alertResult } from '/@/utils/error';
import { formatApiTime } from '/@/utils/formatTime';
import { generateSecret, generateTotp } from '/@/utils/security';
import QrcodeVue from 'qrcode.vue'
import { transAccount as T } from '/@/utils/translator';


const { t } = useI18n();

const formRef = ref<FormInstance>();
const rules = reactive<FormRules<UpdateUserReq>>({
    email: [
        // { required: true, message: T('requireEmail'), trigger: 'blur' },
        { pattern: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/, message: T('requireEmail'), trigger: ['blur', 'change'] }
    ],
});

const mfaFormRef = ref<FormInstance>();
const mfaRules = reactive<FormRules<EnableMfaReq>>({
    mfaCode: [
        { required: true, message: T('requireMfaCode'), trigger: 'blur' },
        { len: 6, message: T('requireMfaCode'), trigger: 'blur' },
    ],
    password: [
        {required: true, message: T('requirePassword'), trigger: 'blur' }
    ]
});

const labelPosition = ref("left");
const state = reactive({
    reloading: false,
    me: null as ListUserReply_Details | null,
    avatar: 'anonymous.png',
    enableMfa: false,
    issuer: 'ADA Web Manage',
    mfa: {
        username: '',
        password: '',
        secret: '',
        mfaCode: '',
    } as EnableMfaReq,
    totp: '',
    form: {
        username: '',
        mobile: '',
        email: '',
        remark: '',
        role: '',
        address: '',
        realName: '',
        department: '',
        post: '',
    } as UpdateUserReq,
});

const refreshQrCode = () => {
    state.mfa.secret = generateSecret();
    state.totp = generateTotp(state.mfa.secret, state.mfa.username);
};

const beforeMfaSwitch = async () => {
    if (state.enableMfa && state.me?.hasMfa) {
        // Before turns to false & current user enabled mfa, let user do double check.
        const result = await ElMessageBox.confirm(T('disableMfaPrompt'), t('message.dialog.prompt'), {
            confirmButtonText: t('message.dialog.confirm'),
            cancelButtonText: t('message.dialog.cancel'),
            type: 'warning',
        }).then(() => {
            api.disableMfa({username: state.me?.username} as DisableMfaReq)
            .then(resp => resp.response)
            .then(data => alertResult(data.result, T('disableMfaSucc'), T('disableMfaFail')))
            .catch(err => alertApiError(err))
            .finally(() => refresh());
            return true;
        }).catch(() => {
            return false;
        });

        return result;
    }

    return true;
};

const enableMfa = async (formEl: FormInstance) => {
    const valid = await formEl.validate(valid => valid);
    if (!valid) {
        return;
    }

    api.enableMfa(state.mfa)
    .then(resp => resp.response)
    .then(data => alertResult(data.result, T('enableMfaSucc'), T('enableMfaFail')))
    .catch(err => alertApiError(err))
    .finally(() => refresh());
};

const refresh = () => {
    state.reloading = true;

    const req: ListUserReq = {
        pageIdx: 1,
        pageSize: 1,
        search: '',
        isSelf: true,
        filterRole: [],
        filterMfaStatus: [], // 二次认证状态 开启enable|禁用disable|关闭stop
        filterPassStrength: [], // 密码强度 high/middle/low
        filterStartCreateTm: '', // 创建开始时间
        filterEndCreateTm: '', // 创建结束时间
        filterStartPassTm: '', // 密码最后修改开始时间
        filterEndPassTm: '', // 密码最后修改结束时间
        sort: -1, // 创建时间排序，1为升序，-1为降序| 密码修改时间 2为升序，-2为降序
    };

    api.listUser(req)
    .then(response => response.response)
    .then(data => {
        console.log(data);
        if (data.list.length > 0) {
            state.me = data.list[0];
            state.form = {
                realName: state.me.realName,
                mobile: state.me.mobile,
                email: state.me.email,
                remark: state.me.remark,
                address: state.me.address,
                department: state.me.department,
                post: state.me.post,
                username: state.me.username,
                role: state.me.role,
            };
            state.enableMfa = state.me.hasMfa;
            state.mfa.username = state.me.username;
            refreshQrCode()
        }
    })
    .catch(err => {
        const message = decodeURIComponent(err.message);
        ElMessage.error(message);
        console.log(err.code, message);
    })
    .finally(() => {
        state.reloading = false;
    })
};

const saveUserInfo = async (formEl: FormInstance) => {

    const valid = await formEl.validate((valid) => {
        return valid;
    });

    console.log(valid, state.form);
    if (!valid) {
        return;
    }

    await api.updateUser(state.form)
    .then(resp => resp.response)
    .then(data => alertResult(data.result, T('saveSucc'), T('saveFail')))
    .catch(err => alertApiError(err))
    .finally(() => refresh());
};

const handleAvatarSuccess: UploadProps['onSuccess'] = (
  response,
  uploadFile
) => {
  state.avatar = URL.createObjectURL(uploadFile.raw!)
};

const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (rawFile.type !== 'image/jpeg') {
    ElMessage.error('Avatar picture must be JPG format!')
    return false
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('Avatar picture size can not exceed 2MB!')
    return false
  }
  return true
}

onMounted(() => {
    refresh()
});

</script>

<style>
@import '../style.css';
</style>