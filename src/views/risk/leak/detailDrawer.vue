<template>
    <el-drawer :size="1276" v-model="state.open" :close-on-click-modal="true">
        <template #header>
            <h3>{{ $t('message.risk.leak.detailTitle') }}</h3>
        </template>
        <template #default>
            <!-- description -->
            <div style="padding: 20px;">
                <el-row :gutter="2" class="desc-row">
                    <el-col :span="4" class="desc-label">{{ $t('message.tableCommon.dcHostname') + ':' }}</el-col>
                    <el-col :span="20">
                        <div class="desc-value" v-html="md2html(state.data?.dcHostname ?? '')"></div>
                    </el-col>
                </el-row>
                <el-row :gutter="2" class="desc-row">
                    <el-col :span="4" class="desc-label">{{ $t('message.risk.ruleConfig.leakDetailTitle_type') + ':'
                        }}</el-col>
                    <el-col :span="20">
                        <div class="desc-value">
                            {{ $t(`message.risk.ruleConfig.leakDetailValue_${state.data?.subType}`) }}
                        </div>
                    </el-col>
                </el-row>
                <el-row :gutter="2" class="desc-row">
                    <el-col :span="4" class="desc-label">{{ $t('message.risk.ruleConfig.leakDetailTitle_level') + ':'
                        }}</el-col>
                    <el-col :span="20">
                        <div class="desc-value">
                            {{ $t(`message.tableCommon.level.${state.data?.level}`) }}
                        </div>
                    </el-col>
                </el-row>
                <el-row :gutter="2" class="desc-row">
                    <el-col :span="4" class="desc-label">{{ $t('message.risk.suggestion') + ':'
                        }}</el-col>
                    <el-col :span="20">
                        <div class="desc-value" v-html="md2html(state.data?.suggestion ?? '')" />
                    </el-col>
                </el-row>
                <el-row :gutter="2" class="desc-row">
                    <el-col :span="4" class="desc-label">{{ $t('message.risk.reference') + ':'
                        }}</el-col>
                    <el-col :span="20">
                        <div class="desc-value" v-html="md2html(state.data?.reference ?? '')" />
                    </el-col>
                </el-row>
            </div>
        </template>
        <template #footer>
            <div style="display: flex; justify-content: right; padding: 20px;">
                <el-button @click="() => state.open = false">{{ $t('message.tableCommon.close')
                    }}</el-button>
            </div>
        </template>
    </el-drawer>
</template>

<script setup lang="ts">

import { reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ListLeakReply_Details } from '/@/api/grpc/ada';
import { md2html } from '/@/utils/markdown';

const { t } = useI18n();

const state = reactive({
    open: false,
    data: null as ListLeakReply_Details | null,
});

const open = (data: ListLeakReply_Details) => {
    state.open = true;
    state.data = data;
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

.desc-row {
    margin-bottom: 20px;
}

.desc-label {
    font-size: 16px;
    font-weight: 600;
}

.desc-value {
    font-size: 16px;
}

code {
    color: #739ab3;
    background-color: rgba(27,31,35,.05);
}

</style>