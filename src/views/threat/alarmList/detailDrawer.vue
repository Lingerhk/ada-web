<template>
    <el-drawer v-model="state.open" size="90%">
        <template #header>
            <h3>{{ state.title }}</h3>
        </template>
        <template #default>
            <div class="threat-detail-container">
                <!-- 描述 -->
                <el-row justify="space-between">
                    <!-- 左侧 -->
                    <div>
                        <el-space wrap size="default">
                            <!-- 威胁名称 -->
                            <h3>{{ state.data?.title }}</h3>
                            <!-- 发生时间 -->
                            <span>{{ $t("message.time.from") }}{{ formatApiTime(state.data?.startTm) }}{{
                                $t("message.time.to")
                                }}{{ formatApiTime(state.data?.endTm) }}</span>
                            <!-- 标签 -->
                            <!-- <el-tag>{{ $t(`message.threat.status.${state.data?.status}`) }}</el-tag> -->
                            <el-tag :type="$t(`message.threat.status.type_${state.data?.eventStatus}`)">{{
                                $t(`message.threat.status.${state.data?.eventStatus}`) }}</el-tag>
                        </el-space>
                    </div>
                    <!-- 右侧操作 -->
                    <div>
                        <el-dropdown @command="handleOperation">
                            <el-button type="primary" size="default">
                                {{ $t("message.tableCommon.operation") }}
                                <el-icon class="el-icon--right"><arrow-down /></el-icon>
                            </el-button>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item command="close">{{ $t("message.tableCommon.close")
                                        }}</el-dropdown-item>
                                    <el-dropdown-item command="addWhite">{{ T('addWhiteTitle') }}</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </div>
                </el-row>
                <!-- 标签 -->
                <el-row>
                    <el-space wrap size="default">
                        <el-tag v-for="field in state.data?.attackFlow?.fields" size="small" :key="field">{{
                            field.item.value
                            }}</el-tag>
                    </el-space>
                </el-row>
                <!-- 说明 -->
                <el-row>
                    {{ $t("message.threat.detail.explanation") }}
                </el-row>
                <el-row>
                    <div v-html="formattedTmpl"></div>
                </el-row>
                <el-row justify="center">
                    <el-space wrap :size="200">
                        <el-col v-for="field in state.data?.attackFlow?.fields" :key="field">
                            <el-row justify="center">
                                <el-image style="width: 100px; height: 100px" :src="getImage(field.item.obj)"
                                    fit="fill" />
                            </el-row>
                            <el-row>{{ field.item.value }}</el-row>
                        </el-col>
                    </el-space>
                </el-row>
                <el-row justify="center">
                    <div v-for="(relate, idx) in state.data?.attackFlow?.relates"
                        :class="{ 'decorated-box': true, 'no-before': idx > 0 }" :key="idx">
                        {{ relate }}
                    </div>
                </el-row>
                <!-- 证据 -->
                <el-row>
                    {{ $t("message.threat.detail.evidence") }}
                </el-row>
                <!-- 证据列表 -->
                <el-row>
                    <el-table :data="state.activity.data" v-loading="state.activity.loading" :border="true"
                        row-class-name="pointer-cursor" style="width: 100%">
                        <el-table-column type="expand">
                            <template #default="props">
                                <JsonViewer :value="JSON.parse(props.row.rawLog)" copyable boxed sort></JsonViewer>
                            </template>
                        </el-table-column>
                        <el-table-column type="index" width="50" />
                        <el-table-column prop="title" :label="$t('message.threat.tableTitle.title')" />
                        <el-table-column :label="$t('message.threat.tableTitle.createTm')">
                            <template #default="scope">{{ formatApiTime(scope.row.createTm) }}</template>
                        </el-table-column>
                        <el-table-column :label="$t('message.threat.tableTitle.level')">
                            <template #default="scope">{{
                                $t(`message.threat.level.${scope.row.level}`)}}</template>
                        </el-table-column>
                        <el-table-column :label="$t('message.threat.tableTitle.tags')">
                            <template #default="scope">
                                <el-space wrap size="small">
                                    <el-tag v-for="tag in scope.row.tags" size="small">{{ tag }}</el-tag>
                                </el-space>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-row>
                <!-- 分页 -->
                <el-row style="margin-top: 10px" justify="space-between">
                    <div></div>
                    <el-pagination v-model:current-page="state.activity.pageIdx"
                        v-model:page-size="state.activity.pageSize" :page-sizes="[10, 20, 30, 40, 50]"
                        :layout='state.activity.exhausted ? "sizes, prev, jumper" : "sizes, prev, next, jumper"'
                        :total="400" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
                </el-row>
                <!-- 详细信息 -->
                <div style="padding: 10px;">
                    <el-row>
                        {{ $t("message.threat.detail.description") }}
                    </el-row>
                    <!-- 漏洞描述 -->
                    <el-row>
                        <Tickets style="width: 20px;" />
                        <span style="margin-left: 5px;">{{ T('threatDesc') }}</span>
                    </el-row>
                    <el-row>
                        <span style="margin-left: 25px;">{{ state.data?.desc }}</span>
                    </el-row>
                    <!-- 误报排查 -->
                    <el-row>
                        <Search style="width: 20px;" />
                        <span style="margin-left: 5px;">{{ T('verifyDesc') }}</span>
                    </el-row>
                    <el-row>
                        <span style="margin-left: 25px;">{{ state.data?.reference }}</span>
                    </el-row>
                    <!-- 修复建议 -->
                    <el-row>
                        <Warning style="width: 20px;" />
                        <span style="margin-left: 5px;">{{ T('suggestion') }}</span>
                    </el-row>
                    <el-row>
                        <span style="margin-left: 25px;">{{ state.data?.suggestion }}</span>
                    </el-row>
                    <!-- 备注 -->
                    <el-row>
                        <EditPen style="width: 20px;" />
                        <span style="margin-left: 5px;">{{ T('remark') }}</span>
                    </el-row>
                    <el-row>
                        <span style="margin-left: 25px;">{{ state.data?.remark }}</span>
                    </el-row>
                </div>
            </div>
        </template>
    </el-drawer>
    <AddWhiteDialog v-model="state.addWhite.visible" :fields="state.addWhite.fields" :title="state.addWhite.title"
        :domain="state.addWhite.domain" :flow-id="state.addWhite.flowId" />
</template>

<script setup lang="ts">

import { computed, reactive, watch } from 'vue';
import { ActivityDetails, AttackFlowReply_Field, GetThreatReply, GetThreatReq, ListActivityReply, ListActivityReq } from '/@/api/grpc/ada';
import api from '/@/api/grpc';
import { alertApiError } from '/@/utils/error';
import { formatApiTime } from '/@/utils/formatTime';
import { ArrowDown } from '@element-plus/icons-vue'
import { closeThreats } from './operation';
import { useI18n } from "vue-i18n";
import { JsonViewer } from "vue3-json-viewer";
import { transAlarmList as T } from '/@/utils/translator';
import AddWhiteDialog from './AddWhiteDialog.vue';
import { Tickets, Warning, Search, EditPen } from '@element-plus/icons-vue';
import DcImage from '/@/assets/dc.jpg';
import IpImage from '/@/assets/ip.jpg';
import UserImage from '/@/assets/user.jpg';
import ComputerImage from '/@/assets/computer.jpg';

const { t } = useI18n();

const state = reactive({
    open: false,
    loading: false,
    title: '',
    data: null as GetThreatReply | null,
    activity: {
        loading: false,
        pageIdx: 1,
        pageSize: 10,
        exhausted: false,
        data: [] as ActivityDetails[],
    },
    addWhite: {
        flowId: '',
        domain: '',
        visible: false,
        title: '',
        fields: [] as AttackFlowReply_Field[],
    },
});

const handleSizeChange = (val: number) => {
    state.activity.pageSize = val;
    refreshActivity();
}

const handleCurrentChange = (val: number) => {
    state.activity.pageIdx = val;
    refreshActivity();
}

const refreshActivity = () => {
    if (!state.data) {
        return;
    }

    state.activity.loading = true;

    const req: ListActivityReq = {
        pageIdx: state.activity.pageIdx,
        pageSize: state.activity.pageSize,
        // iD: state.data.uniqueId,
        iD: state.data.iD,
        orderCreateTm: -1,
        level: [],
        startTm: '',
        endTm: '',
        dcHostname: [],
        title: [],
    };

    console.log('listActiviy', req);

    api.listActivity(req)
        .then(resp => resp.response)
        .then((data: ListActivityReply) => {
            console.log(data);
        })
        .catch(err => alertApiError(err))
        .finally(() => state.activity.loading = false);
};

const getImage = (type: string) => {
    const m: Record<string, any> = {
        'dc': DcImage,
        'ip': IpImage,
        'user': UserImage,
        'computer': ComputerImage,
    };

    return m[type] ?? '';
};

const open = (title: string, id: string) => {
    state.open = true;
    state.title = title;
    state.addWhite.visible = false;

    const req: GetThreatReq = {
        iD: id
    };

    // 获取threat详情
    api.getThreat(req)
    .then(resp => resp.response)
    .then((data: GetThreatReply) => {
        console.log('threatDetail:', data);
        state.data = data;
        state.activity.data = data.activities;

        // 获取activity
        // refreshActivity();
    })
    .catch(err => alertApiError(err))
    .finally(() => state.loading = false );
}

const handleOperation = (command: string | number | object) => {
    if (!state.data) {
        return;
    }

    if (command === 'close') {
        closeThreats([state.data], t);
    } else if (command === 'addWhite') {
        state.addWhite.visible = true;
    }
};

watch(() => state.data, () => {
    if (!state.data) {
        return;
    }

    state.addWhite.domain = state.data.domain;
    state.addWhite.flowId = state.data.flowId;
    state.addWhite.title = state.data.title;
    state.addWhite.fields = state.data.attackFlow?.fields ?? [];
});

const formattedTmpl = computed(() => {
    // 使用正则表达式匹配并处理文本
    if (!state.data || !state.data.attackFlow?.desc) {
        return '';
    }

    const parts = state.data.attackFlow.desc.split(/(\[[^\]]+\])/);
    return parts.map(part => {
        if (part.startsWith('[') && part.endsWith(']')) {
            return `<span style="color: green;">${part}</span>`;
        }
        return part;
    }).join('');
});

defineExpose({
    open,
});

</script>

<style type="scss">
.threat-detail-container {
    padding: 0 10px;
    font-size: 16px;

    .el-row {
        margin-top: 20px;
    }
}
.decorated-box {
  position: relative;
  padding: 20px 0px;
  border-bottom: 1px solid #ccc;
  justify-content: center;
  display: flex;
  width: 400px;
}

.decorated-box::before {
  content: '';
  position: absolute;
  bottom: -8px; /* 圆圈底部略低于盒子底部 */
  left: 0px; /* 左圆圈的位置 */
  width: 12px;
  height: 12px;
  background-color: white;
  border: 1px solid #999;
  border-radius: 50%;
}

.decorated-box::after {
  content: '';
  position: absolute;
  bottom: -8px; /* 圆圈底部略低于盒子底部 */
  right: 0px; /* 右圆圈的位置 */
  width: 12px;
  height: 12px;
  background-color: white;
  border: 1px solid #999;
  border-radius: 50%;
}

.no-before::before {
  content: none; /* 禁用 ::after */
}
</style>