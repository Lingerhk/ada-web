<template>
    <el-dialog v-model="isVisible" :title="T('addWhiteTitle')" :width="950" :before-close="handleClose"
        :close-on-click-modal="false" :close-on-press-escape="false">
        <template #footer>
            <el-button @click="cancel">{{ T('cancel') }}</el-button>
            <el-button type="primary" @click="confirm">{{ T('confirm') }}</el-button>
        </template>
        <el-alert type="warning" :title="T('addWhiteAlert')" show-icon />
        <el-space :size="20" direction="vertical" alignment="flex-start" style="margin-top: 20px; width: 100%;"
            :fill="true">
            <div style="font-weight: bold; font-size: 20px;">{{ T('addWhiteSubTitle') }}:</div>
            <el-form :label-width="100" style="font-size: 16px;" label-position="left" ref="formRef" :rules="rules" :model="input">
                <el-form-item :required="true" :label="T('domain') + ':'" prop="domainSelected">
                    <el-select v-model="input.domainSelected" style="width: 90%">
                        <el-option v-for="opt in domainOptions" :label="opt.label" :key="opt.value"
                            :value="opt.value"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item :required="true" :label="T('flowTitle') + ':'" prop="ruleSelected">
                    <MultiSelector v-model:selected="input.ruleSelected" :options="ruleOptions" width="90%" />
                </el-form-item>
                <el-form-item v-for="(rule, idx) in input.addReqRules" :key="idx" :label="T('ruleIndex', [idx + 1])"
                    style="width:100%" :required="true">
                    <el-space style="width: 100%;">
                        <el-select v-model="input.addReqRules[idx].info.field" size="default" style="width: 200px;"
                            @change="changeField(idx)">
                            <el-option v-for="opt in getCandicateField(input.addReqRules[idx].info.field)" :label="opt.label"
                                :key="opt.value" :value="opt.value"></el-option>
                        </el-select>
                        <el-select v-model="input.addReqRules[idx].info.op" size="default" style="width: 200px">
                            <el-option v-for="opt in operOptions" :label="opt.label" :key="opt.value"
                                :value="opt.value"></el-option>
                        </el-select>
                        <el-form :model="rule.info">
                            <el-form-item prop="value"
                                :rules="{ required: true, message: T('requireValue'), trigger: 'blur' }">
                                <el-input v-model="rule.info.value" size="default" style="width: 200px;"></el-input>
                            </el-form-item>
                        </el-form>
                        <el-button style="width: 32px; height: 32px;" @click="deleteRule(idx)" :icon="Delete"
                            circle></el-button>
                    </el-space>
                </el-form-item>
                <el-form-item prop="addReqRules">
                    <el-button style="height: 32px;" type="primary" :icon="Plus" @click="addNewRule"
                        :disabled="input.addReqRules.length === candicateFields.length">{{ T('addNewWhiteRule') }}</el-button>
                </el-form-item>
                <el-form-item :label="T('remark')">
                    <el-input style="width: 90%;" type="textarea" v-model="remark" :placeholder="T('remarkPlaceholder')"
                        :rows="4"></el-input>
                </el-form-item>
            </el-form>
        </el-space>
    </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { ElDialog, ElButton, FormInstance, FormRules, ElMessage } from 'element-plus'
import { transAlarmList as T } from '/@/utils/translator';
import { AddThreatWhitelistReq, AttackFlowReply_Field, AddThreatWhitelistReq_ruleInfo, GetThreatWhitelistFieldReq } from '/@/api/grpc/ada';
import { getAddWhiteOpeartionOptins, OptionType } from '/@/utils/constant';
import { Delete, Plus } from '@element-plus/icons-vue';
import api from '/@/api/grpc';
import { alertApiError, alertResult } from '/@/utils/error';
import { listDomainOptions, listThreatRuleOptions } from '/@/api/grpc/method';
import MultiSelector from '/@/components/form/multiSelector.vue';
import { getArraySizeValidator } from '/@/utils/validator';

// Props
const props = defineProps({
    modelValue: Boolean,
});

// Emits
const emit = defineEmits(['update:modelValue']);

// Reactive state
const isVisible = ref(props.modelValue);

// form
const formRef = ref<FormInstance>();

interface FormData {
    domainSelected: string;
    ruleSelected: string[];
    addReqRules: AddThreatWhitelistReq_ruleInfo[];
}

const rules = ref<FormRules<FormData>>({
    domainSelected: [{ required: true, message: T('requireDomain'), trigger: 'blur' }],
    ruleSelected: [{ required: true, validator: getArraySizeValidator(1, null), message: T('requireRule'), trigger: 'change' }],
    addReqRules: [{ required: true, validator: getArraySizeValidator(1, null), message: T('requireReqRule'), trigger: 'change' }],
});

const input = reactive<FormData>({
    domainSelected: '',
    ruleSelected: [] as string[],
    addReqRules: [] as AddThreatWhitelistReq_ruleInfo[],
});
const remark = ref('');


// options
const candicateFields = ref<Array<OptionType>>(['IpAddress',
    'Hostname',
    'TargetUserName',
    'SubjectDomainName',
    'SubjectUserName',
    'TargetDomainName',
].map(value => ({ label: value, value })));

const operOptions = getAddWhiteOpeartionOptins();
const ruleOptions = ref<Array<OptionType>>([]);
const domainOptions = ref<Array<OptionType>>([]); 

const getCandicateField = (name: null | string) => {
    const otherOptions = candicateFields.value.filter(f => -1 === input.addReqRules.findIndex(addRule => addRule.info.field === f.value));

    if (name === null) {
        return otherOptions;
    }

    return [{ label: name, value: name }, ...otherOptions];
};

const addNewRule = () => {
    const candList = getCandicateField(null);
    if (candList.length === 0) {
        return;
    }

    const cand = candList[0];
    const rule: AddThreatWhitelistReq_ruleInfo = {
        // {"field":"TargetUsername","op":"==","value":"admin"}
        info: {
            field: cand.value,
            op: "==",
            value: '',
        }
    }

    input.addReqRules = [...input.addReqRules, rule];
};

const deleteRule = (idx: number) => {
    input.addReqRules = input.addReqRules.filter((_, index) => index != idx);
};

const changeField = (idx: number) => {
    input.addReqRules[idx].info.value = '';
};

const initAddReqRules = () => {
    input.addReqRules = [];
    remark.value = '';
    input.domainSelected = '';
    input.ruleSelected = [];

    listThreatRuleOptions().then(list => {
        ruleOptions.value = list;
        input.ruleSelected = list.map(opt => opt.value);
    });
    listDomainOptions().then(list => {
        domainOptions.value = list;
        if (domainOptions.value.length > 0) {
            input.domainSelected = domainOptions.value[0].value;
        }
    });
};

// Watcher to sync internal state with external v-model
watch(() => props.modelValue, (newVal) => {
    isVisible.value = newVal;
    if (isVisible.value) {
        initAddReqRules();
    }
});

// Methods
function handleClose(done) {
    emit('update:modelValue', false)
    done()
}

function cancel() {
    emit('update:modelValue', false)
}

const confirm = async () => {

    if (!formRef.value) {
        return;
    }

    const ok = await formRef.value.validate(ok => ok);
    if (!ok) {
        return;
    }

    const found = input.addReqRules.findIndex(rule => rule.info.value === '');
    if (found !== -1) {
        console.log(found);
        return;
    }

    let promises = input.ruleSelected.map(async (ruleId: string) => {

        const req: AddThreatWhitelistReq = {
            ruleId: ruleId,
            domain: input.domainSelected,
            rules: input.addReqRules,// 规则信息
            remark: remark.value, // 备注
            origin: 2,
        };

        try {
            const result = await api.addThreatWhitelist(req).then(resp => resp.response);
            // if (result.result.toUpperCase() === 'SUCCESS') {
            //     succCount += 1;
            // }
            return result.result.toUpperCase() === 'SUCCESS';
        } catch (err) {
            console.log(err);
            return false;
        }
    });

    Promise.all(promises)
    .then(results => {
        const succCount = results.filter(r => r).length;
        ElMessage.info(T('addGlobalWhite', [succCount, input.ruleSelected.length - succCount]));
    })
    .finally(() => cancel());
}

// Watch internal state changes to emit updates
watch(isVisible, (newVal) => {
    emit('update:modelValue', newVal)
})
</script>

<style scoped>
/* Add styles here if necessary */
</style>
