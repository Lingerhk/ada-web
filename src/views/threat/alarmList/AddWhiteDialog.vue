<template>
    <el-dialog v-model="isVisible" :title="T('addWhiteTitle')" :width="950" :before-close="handleClose"
        :close-on-click-modal="false" :close-on-press-escape="false">
        <template #footer>
            <el-button @click="cancel">{{ T('cancel') }}</el-button>
            <el-button type="primary" @click="confirm">{{ T('confirm') }}</el-button>
        </template>
        <el-alert type="warning" :title="T('addWhiteAlert')" show-icon />
        <el-space :size="20" direction="vertical" alignment="flex-start" style="margin-top: 20px;width: 100%;"
            :fill="true">
            <div style="font-weight: bold; font-size: 20px;">{{ T('addWhiteSubTitle') }}:</div>
            <el-form :label-width="100" style="font-size: 16px;" label-position="left">
                <el-form-item :required="true" :label="T('domain')+':'">{{ domain }}</el-form-item>
                <el-form-item :required="true" :label="T('flowTitle')+':'">{{ title }}</el-form-item>
                <el-form-item v-for="(rule, idx) in addReqRules" :key="idx" :label="T('ruleIndex', [idx + 1])"
                    style="width:100%" :required="true">
                    <el-space style="width: 100%;">
                        <el-select v-model="addReqRules[idx].info.field" size="default" style="width: 200px;"
                            @change="changeField(idx)">
                            <el-option v-for="opt in getCandicateField(addReqRules[idx].info.field)" :label="opt.label"
                                :key="opt.value" :value="opt.value"></el-option>
                        </el-select>
                        <el-select v-model="addReqRules[idx].info.op" size="default" style="width: 200px">
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
                <el-form-item>
                    <el-button style="height: 32px;" type="primary" :icon="Plus" @click="addNewRule"
                        :disabled="addReqRules.length === candicateFields.length">{{ T('addNewWhiteRule') }}</el-button>
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
import { ref, watch } from 'vue'
import { ElDialog, ElButton } from 'element-plus'
import { transAlarmList as T } from '/@/utils/translator';
import { AddThreatWhitelistReq, AttackFlowReply_Field, AddThreatWhitelistReq_ruleInfo, GetThreatWhitelistFieldReq } from '/@/api/grpc/ada';
import { getAddWhiteOperationOptions, OptionType } from '/@/utils/constant';
import { Delete, Plus } from '@element-plus/icons-vue';
import api from '/@/api/grpc';
import { alertApiError, alertResult } from '/@/utils/error';

// Props
const props = defineProps({
  modelValue: Boolean,
  fields: Array,
  domain: String,
  title: String,
  flowId: String,
});

// Emits
const emit = defineEmits(['update:modelValue']);

// Reactive state
const isVisible = ref(props.modelValue);

// form
const addReqRules = ref<Array<AddThreatWhitelistReq_ruleInfo>>([]);
const remark = ref('');

// options
const candicateFields = ref<Array<OptionType>>([]);
const operOptions = getAddWhiteOperationOptions();

const getCandicateField = (name: null | string) => {
    const otherOptions = candicateFields.value.filter(f => -1 === addReqRules.value.findIndex(addRule => addRule.info.field === f.value));

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

    addReqRules.value = [...addReqRules.value, rule];
};

const deleteRule = (idx: number) => {
    addReqRules.value = addReqRules.value.filter((_, index) => index != idx);
};

const changeField = (idx: number) => {
    addReqRules.value[idx].info.value = '';
};

const initAddReqRules = () => {
    if (props.fields === undefined || !props.flowId) {
        return;
    }

    addReqRules.value = [];
    candicateFields.value = [];
    remark.value = '';

    const req: GetThreatWhitelistFieldReq = {
        ruleId: props.flowId,
    };

    api.getThreatWhitelistField(req)
    .then(resp => resp.response)
        .then(data => candicateFields.value = data.fields.map(f => ({ label: f, value: f })))
    .catch(err => alertApiError(err));

    props.fields.filter((field: AttackFlowReply_Field) => {
        const value = field.item.key;
        return value !== undefined && value !== null;
    }).forEach((field: AttackFlowReply_Field) => {
        const item = field.item;
        const targetName = item.key;
        const value = item.value;

        // candicateFields.value = [...candicateFields.value, { label: targetName, value: targetName }];

        const rule: AddThreatWhitelistReq_ruleInfo = {
            // {"field":"TargetUsername","op":"==","value":"admin"}
            info: {
                field: targetName,
                op: "==",
                value,
            }
        }

        addReqRules.value = [...addReqRules.value, rule];
    });
};

// Watcher to sync internal state with external v-model
watch(() => props.modelValue, (newVal) => {
    isVisible.value = newVal
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

function confirm() {

    if (!props.flowId || !props.domain) {
        return;
    }

    const req: AddThreatWhitelistReq = {
        ruleId: props.flowId,
        domain: props.domain,
        rules: addReqRules.value,// Rule details
        remark: remark.value, // Remark
    }

    console.log("addThreatWhitelist:", req);
    api.addThreatWhitelist(req)
    .then(resp => resp.response)
    .then(data => {
        const ok = alertResult(data.result, T('addWhiteSucc'), T('addWhiteFail'))
        if (ok) {
            emit('update:modelValue', false)
        }
    })
    .catch(err => alertApiError(err))
}

// Watch internal state changes to emit updates
watch(isVisible, (newVal) => {
    emit('update:modelValue', newVal)
})
</script>

<style scoped>
/* Add styles here if necessary */
</style>
