<template>
    <div class="layout-pd">
        <el-card shadow="hover">
            <el-row>
                <div>
                    <el-upload action="#" :show-file-list="false"
                        :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
                        <template #trigger>
                            <div class="avatar-container">
                                <img v-if="state.avatar" :src="state.avatar" class="avatar-img" />
                                <el-icon v-else class="avatar-placeholder">
                                    <Plus />
                                </el-icon>
                                <div class="avatar-overlay">
                                    <el-icon :size="24"><Edit /></el-icon>
                                    <span>{{ $t('message.tableCommon.edit') }}</span>
                                </div>
                            </div>
                        </template>
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
                                <template #label><span class="form-label">{{ T('activeTm') }}:</span></template>
                                {{ state.me?.activeTm ? formatApiTime(state.me?.activeTm) : '-' }}
                            </el-form-item>
                            <el-form-item class="password-strength-item" label-width="150px">
                                <template #label><span class="form-label">{{ T('passwordStrength') }}:</span></template>
                                <el-tooltip :content="T('passwordStrength_'+state.me?.passStrength)" placement="top">
                                    <div class="password-strength-bars">
                                        <span :class="['strength-bar', getStrengthBarClass(1, state.me?.passStrength || 'low')]"></span>
                                        <span :class="['strength-bar', getStrengthBarClass(2, state.me?.passStrength || 'middle')]"></span>
                                        <span :class="['strength-bar', getStrengthBarClass(3, state.me?.passStrength || 'high')]"></span>
                                    </div>
                                </el-tooltip>
                            </el-form-item>
                        </div>
                    </el-form>
                </div>
            </el-row>
        </el-card>
        <el-tabs type="border-card" style="margin-top: 20px;">
            <!-- Profile -->
            <el-tab-pane :label="T('profile')">
                <el-form size="default" :label-position="labelPosition" label-width="auto" style="margin-top: 10px;" ref="formRef" :rules="rules" :model="state.form">
                    <h3 style="margin-bottom: 20px;">{{ T('businessInfo') }}</h3>
                    <el-form-item :label="T('department')" label-width="100px">
                        <el-input v-model="state.form.department" clearable style="width: 400px" :placeholder="T('departmentPlaceholder')"></el-input>
                    </el-form-item>
                    <h3 style="margin-bottom: 20px;">{{ T('contactInfo') }}</h3>
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

            <!-- API Key -->
            <el-tab-pane :label="T('apiKey')">
                <el-row style="margin-bottom: 15px;">
                    <el-button type="primary" @click="handleGenerateKey">
                        <el-icon><Plus /></el-icon>
                        {{ T('generateKey') }}
                    </el-button>
                </el-row>
                <el-table :data="state.accessKeys" v-loading="state.keysLoading" border style="width: 100%;">
                    <el-table-column type="index" :label="$t('message.tableCommon.index')" width="70" />
                    <el-table-column prop="secretKey" :label="T('secretKey')" min-width="200" show-overflow-tooltip />
                    <el-table-column prop="remark" :label="T('remark')" min-width="150" show-overflow-tooltip />
                    <el-table-column prop="status" :label="T('status')" width="100">
                        <template #default="scope">
                            <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'">
                                {{ T('status_' + scope.row.status) }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="createTm" :label="T('createTm')" width="180">
                        <template #default="scope">
                            {{ formatApiTime(scope.row.createTm) }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="updateTm" :label="T('updateTm')" width="180">
                        <template #default="scope">
                            {{ formatApiTime(scope.row.updateTm) }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="activeTm" :label="T('activeTm')" width="180">
                        <template #default="scope">
                            {{ formatApiTime(scope.row.activeTm) || '-' }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('message.tableCommon.operation')" width="100" fixed="right" align="center">
                        <template #default="scope">
                            <el-button
                                size="small"
                                type="danger"
                                :disabled="scope.row.status === 'disabled'"
                                @click="handleDeleteKey(scope.row)">
                                {{ T('disable') }}
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, watch } from 'vue';
import api from '/@/api/grpc/index';
import { DisableMfaReq, EnableMfaReq, ListUserReply_Details, ListUserReq, UpdateUserReq, AccessKeyDetails, ListAccessKeyReq, GenerateAccessKeyReq, DeleteAccessKeyReq } from '/@/api/grpc/ada';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance, FormRules, UploadProps } from 'element-plus'
import { Plus, Edit } from '@element-plus/icons-vue';
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
        department: '',
    } as UpdateUserReq,
    accessKeys: [] as AccessKeyDetails[],
    keysLoading: false,
});

const getStrengthBarClass = (barIndex: number, strength: string) => {
    const strengthLevels: { [key: string]: number } = {
        'low': 1,
        'middle': 2,
        'high': 3
    };

    const level = strengthLevels[strength] || 0;

    if (barIndex > level) {
        return 'strength-bar-inactive';
    }

    // Return color class based on strength level
    if (strength === 'low') {
        return 'strength-bar-red';
    } else if (strength === 'middle') {
        return 'strength-bar-yellow';
    } else if (strength === 'high') {
        return 'strength-bar-blue';
    }

    return 'strength-bar-inactive';
};

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
        filterMfaStatus: [], // MFA status: enable|disable|stop
        filterPassStrength: [], // Password strength: high/middle/low
        filterStartCreateTm: '', // Creation start time
        filterEndCreateTm: '', // Creation end time
        filterStartPassTm: '', // Password update start time
        filterEndPassTm: '', // Password update end time
        sort: -1, // Sort by creation time (`1` asc, `-1` desc) or password update time (`2` asc, `-2` desc)
    };

    api.listUser(req)
    .then(response => response.response)
    .then(data => {
        console.log(data);
        if (data.list.length > 0) {
            state.me = data.list[0];
            state.form = {
                mobile: state.me.mobile,
                email: state.me.email,
                remark: state.me.remark,
                department: state.me.department,
                username: state.me.username,
                role: state.me.role,
            };
            state.enableMfa = state.me.hasMfa;
            state.mfa.username = state.me.username;
            refreshQrCode();
            // Load access keys after user data is loaded
            loadAccessKeys();
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

// AccessKey Management Functions
const loadAccessKeys = async () => {
    if (!state.me?.username) return;

    state.keysLoading = true;
    const req: ListAccessKeyReq = {
        username: state.me.username,
    };

    try {
        const resp = await api.listAccessKey(req);
        state.accessKeys = resp.response.list || [];
    } catch (err) {
        alertApiError(err);
    } finally {
        state.keysLoading = false;
    }
};

const handleGenerateKey = async () => {
    if (!state.me?.username) return;

    ElMessageBox.prompt(T('remarkPlaceholder'), T('generateKey'), {
        confirmButtonText: T('confirm'),
        cancelButtonText: T('cancel'),
        inputPattern: /.{0,100}/,
        inputErrorMessage: T('invalidRemark'),
    }).then(async ({ value }) => {
        const req: GenerateAccessKeyReq = {
            username: state.me!.username,
            remark: value || '',
        };

        try {
            const resp = await api.generateAccessKey(req);
            const data = resp.response;

            if (data.result === 'success') {
                // Create a unique ID for this message box
                const copyBtnId = `copySecretKeyBtn_${Date.now()}`;

                const messageBox = ElMessageBox.alert(
                    `<div style="padding: 12px 0;">
                        <div style="margin-bottom: 20px;">
                            <div style="font-size: 14px; color: #606266; margin-bottom: 8px; font-weight: 500;">
                                <svg viewBox="0 0 1024 1024" width="16" height="16" style="vertical-align: middle; margin-right: 4px;">
                                    <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm-32 232c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v272c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V296zm32 440a48.01 48.01 0 0 1 0-96 48.01 48.01 0 0 1 0 96z" fill="#e6a23c"></path>
                                </svg>
                                Secret Key
                            </div>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <div style="flex: 1; padding: 12px 16px; background: #f5f7fa; border: 1px solid #dcdfe6; border-radius: 4px; font-family: 'Monaco', 'Courier New', monospace; font-size: 13px; color: #303133; word-break: break-all; line-height: 1.6;">
                                    ${data.secretKey}
                                </div>
                                <button id="${copyBtnId}" style="flex-shrink: 0; height: 40px; padding: 0 15px; cursor: pointer; border: 1px solid #409eff; background: #409eff; color: #fff; border-radius: 4px; font-size: 14px; transition: all 0.3s; display: flex; align-items: center; gap: 6px;">
                                    <svg viewBox="0 0 1024 1024" width="16" height="16" style="vertical-align: middle; fill: currentColor;">
                                        <path d="M768 832a64 64 0 0 1-64 64H192a64 64 0 0 1-64-64V320a64 64 0 0 1 64-64h512a64 64 0 0 1 64 64v512z m64-640v576a64 64 0 0 0 64-64V192a64 64 0 0 0-64-64H320a64 64 0 0 0-64 64h512a64 64 0 0 1 64 64z"></path>
                                    </svg>
                                    <span>Copy</span>
                                </button>
                            </div>
                        </div>
                        <div style="padding: 12px 16px; background: #fef0f0; border: 1px solid #fde2e2; border-radius: 4px; display: flex; gap: 8px;">
                            <svg viewBox="0 0 1024 1024" width="16" height="16" style="flex-shrink: 0; margin-top: 2px;">
                                <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm-32 232c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v272c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V296zm32 440a48.01 48.01 0 0 1 0-96 48.01 48.01 0 0 1 0 96z" fill="#f56c6c"></path>
                            </svg>
                            <div style="flex: 1; font-size: 13px; color: #f56c6c; line-height: 1.6;">
                                ${T('secretKeyWarning')}
                            </div>
                        </div>
                    </div>`,
                    T('keyGenerated'),
                    {
                        dangerouslyUseHTMLString: true,
                        confirmButtonText: T('confirm'),
                        customClass: 'secret-key-message-box',
                    }
                );

                // Add click handler after the message box is rendered
                setTimeout(() => {
                    const copyBtn = document.getElementById(copyBtnId);
                    if (copyBtn) {
                        // Add hover effect
                        copyBtn.onmouseenter = () => {
                            copyBtn.style.background = '#66b1ff';
                            copyBtn.style.borderColor = '#66b1ff';
                        };
                        copyBtn.onmouseleave = () => {
                            if (!copyBtn.classList.contains('copied')) {
                                copyBtn.style.background = '#409eff';
                                copyBtn.style.borderColor = '#409eff';
                            }
                        };

                        copyBtn.onclick = () => {
                            const key = data.secretKey;

                            // Function to copy text with fallback
                            const copyToClipboard = (text: string) => {
                                // Try modern clipboard API first
                                if (navigator.clipboard && navigator.clipboard.writeText) {
                                    return navigator.clipboard.writeText(text);
                                }

                                // Fallback to execCommand
                                return new Promise<void>((resolve, reject) => {
                                    const textArea = document.createElement('textarea');
                                    textArea.value = text;
                                    textArea.style.position = 'fixed';
                                    textArea.style.left = '-999999px';
                                    textArea.style.top = '-999999px';
                                    document.body.appendChild(textArea);
                                    textArea.focus();
                                    textArea.select();

                                    try {
                                        const successful = document.execCommand('copy');
                                        document.body.removeChild(textArea);
                                        if (successful) {
                                            resolve();
                                        } else {
                                            reject(new Error('Copy command failed'));
                                        }
                                    } catch (err) {
                                        document.body.removeChild(textArea);
                                        reject(err);
                                    }
                                });
                            };

                            copyToClipboard(key).then(() => {
                                const originalHtml = copyBtn.innerHTML;
                                copyBtn.classList.add('copied');
                                copyBtn.style.background = '#67c23a';
                                copyBtn.style.borderColor = '#67c23a';
                                copyBtn.innerHTML = `<svg viewBox="0 0 1024 1024" width="16" height="16" style="vertical-align: middle; fill: currentColor;">
                                    <path d="M912 190h-69.9c-9.8 0-19.1 4.5-25.1 12.2L404.7 724.5 207 474a32 32 0 0 0-25.1-12.2H112c-6.7 0-10.4 7.7-6.3 12.9l273.9 347c12.8 16.2 37.4 16.2 50.3 0l488.4-618.9c4.1-5.1 0.4-12.8-6.3-12.8z"></path>
                                </svg>
                                <span>Copied!</span>`;
                                setTimeout(() => {
                                    copyBtn.classList.remove('copied');
                                    copyBtn.style.background = '#409eff';
                                    copyBtn.style.borderColor = '#409eff';
                                    copyBtn.innerHTML = originalHtml;
                                }, 2000);
                            }).catch((err) => {
                                console.error('Failed to copy:', err);
                                ElMessage.error('Failed to copy to clipboard');
                            });
                        };
                    }
                }, 100);

                await loadAccessKeys();
            } else {
                ElMessage.error(data.message || T('operationFailed'));
            }
        } catch (err) {
            alertApiError(err);
        }
    }).catch(() => {
        // User cancelled
    });
};

const handleDeleteKey = (key: AccessKeyDetails) => {
    ElMessageBox.confirm(
        T('confirmDisableKey') || 'Are you sure you want to disable this access key?',
        T('warning'),
        {
            confirmButtonText: T('confirm'),
            cancelButtonText: T('cancel'),
            type: 'warning',
        }
    ).then(async () => {
        const req: DeleteAccessKeyReq = {
            iD: key.iD,
        };

        try {
            const resp = await api.deleteAccessKey(req);
            const data = resp.response;

            if (data.result === 'success') {
                ElMessage.success(T('disableSucc') || 'Access key disabled successfully');
                await loadAccessKeys();
            } else {
                ElMessage.error(data.message || T('disableFail') || 'Failed to disable access key');
            }
        } catch (err) {
            alertApiError(err);
        }
    }).catch(() => {
        // User cancelled
    });
};

onMounted(() => {
    refresh();
});

</script>

<style>
@import '../style.css';
</style>
