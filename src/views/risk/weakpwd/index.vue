<template>
    <div class="layout-pd">
        <el-card shadow="hover">
            <el-row justify="space-between">
                <!-- 搜索 -->
                <el-form :inline="true">
                    <el-form-item>
                        <el-button size="default" type="primary" @click="handleAdd">{{ $t('message.risk.startScan')
                            }}</el-button>
                    </el-form-item>
                    <el-form-item :label="$t('message.tableCommon.domain')">
                        <el-select v-model="state.req.domain" multiple clearable collapse-tags collapse-tags-tooltip :max-collapse-tags="1" size="default" style="width: 200px" :placeholder="$t('message.risk.weakpwd.selectDomain')" popper-class="custom-header">
                            <template #header>
                                <el-checkbox v-model="domainCheckAll" :indeterminate="domainIndeterminate" @change="handleDomainCheckAll">
                                    {{ $t('message.tableCommon.checkAll') }}
                                </el-checkbox>
                            </template>
                            <el-option v-for="option in state.domainOptions" :key="option.value" :label="option.label" :value="option.value" />
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="$t('message.risk.weakpwd.locked')">
                        <el-select v-model="state.req.locked" multiple clearable collapse-tags collapse-tags-tooltip :max-collapse-tags="1" size="default" style="width: 200px" :placeholder="$t('message.risk.weakpwd.selectLocked')" popper-class="custom-header">
                            <template #header>
                                <el-checkbox v-model="lockedCheckAll" :indeterminate="lockedIndeterminate" @change="handleLockedCheckAll">
                                    {{ $t('message.tableCommon.checkAll') }}
                                </el-checkbox>
                            </template>
                            <el-option v-for="option in LockedOptions" :key="option.value" :label="option.label" :value="option.value" />
                        </el-select>
                    </el-form-item>
                </el-form>
                <!-- 右侧按钮 -->
                <el-space wrap size="default"
                    style="min-width: 450px; justify-content:right; align-items: flex-start; padding-top: 5px;">
                    <el-switch size="default" v-model="state.req.isPlain"
                        :active-text="$t('message.risk.weakpwd.isPlain')" />
                    <el-input size="default" v-model="state.req.search"
                        :placeholder="$t('message.risk.weakpwd.searchPlaceholder')" style="width: 290px;"
                        :suffix-icon="Search" clearable></el-input>
                    <ExportButton type="weakpwd" />
                </el-space>
            </el-row>
            <!-- 下方显示列表 -->
            <el-row style="margin-top: 10px">
                <el-table :data="state.data" v-loading="state.loading" :border="true" row-class-name="pointer-cursor"
                    style="width: 100%">
                    <el-table-column type="index" width="80" :label="$t('message.tableCommon.index')" />
                    <el-table-column prop="username" :label="$t('message.risk.weakpwd.username')" />
                    <el-table-column prop="samName" :label="$t('message.risk.weakpwd.samName')" />
                    <el-table-column prop="password" :label="$t('message.risk.weakpwd.password')" />
                    <el-table-column prop="expirationTm" :label="$t('message.risk.weakpwd.expirationTm')">
                        <template #default="props">
                            {{ formatApiTime(props.row.expirationTm) }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="lastUpdateTm" :label="$t('message.risk.weakpwd.lastUpdateTm')">
                        <template #default="props">
                            {{ formatApiTime(props.row.lastUpdateTm) }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="domain" :label="$t('message.tableCommon.domain')" />
                    <el-table-column prop="locked" :label="$t('message.risk.weakpwd.locked')">
                        <template #default="props">
                            {{ $t(`message.risk.weakpwd.locked_${props.row.locked}`)}}
                        </template>
                    </el-table-column>
                    <el-table-column prop="updateTm" :label="$t('message.risk.updateTm')">
                        <template #default="props">
                            {{ formatApiTime(props.row.updateTm) }}
                        </template>
                    </el-table-column>
                </el-table>
            </el-row>
            <!-- 分页 -->
            <el-row style="margin-top: 10px" justify="space-between">
                <div></div>
                <el-pagination v-model:current-page="state.req.pageIdx" v-model:page-size="state.req.pageSize"
                    :page-sizes="[10, 20, 30, 40, 50]"
                    :layout='state.exhausted ? "sizes, prev, jumper" : "sizes, prev, next, jumper"' :total="400"
                    @size-change="(val: number) => state.req.pageSize = val"
                    @current-change="(val: number) => state.req.pageIdx = val" />
            </el-row>
        </el-card>
        <AddDrawer ref="AddDrawerRef" />
    </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, reactive, ref, watch } from 'vue';
import { ListWeakPwdReq, ListWeakPwdReply, ListWeakPwdReply_Details } from '/@/api/grpc/ada';
import api from '/@/api/grpc';
import { alertApiError } from '/@/utils/error';
import { listDomainOptions } from '/@/api/grpc/method';
import { Search } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';
import { getWeakpwdLockedOptions } from '/@/utils/constant';
import { formatApiTime } from '/@/utils/formatTime';
import ExportButton from '/@/views/system/export/exportButton.vue';

const AddDrawer = defineAsyncComponent(() => import('./addDrawer.vue'));
const AddDrawerRef = ref();

const { t } = useI18n();

const LockedOptions = getWeakpwdLockedOptions(t);

// Checkbox states for "Check All"
const domainCheckAll = ref(false);
const domainIndeterminate = ref(false);
const lockedCheckAll = ref(false);
const lockedIndeterminate = ref(false);

const state = reactive({
    loading: false,
    req: {
        pageIdx: 1,
        pageSize: 10,
        domain: [] as string[],
        locked: [] as number[],
        isPlain: false, // 是否明文密码
        search: '',
        orderUpdateTm: -1,
    } as ListWeakPwdReq,
    data: [] as ListWeakPwdReply_Details[],
    exhausted: false,
    domainOptions: [] as any[],
});

const handleAdd = () => {
    AddDrawerRef.value.open();
};

const handleDetail = (data: ListWeakPwdReply_Details) => {
};

const handleScan = (data: ListWeakPwdReply_Details) => {
};

const refresh = () => {
    console.log('listWeakPwd', state.req);

    state.loading = true;

    api.listWeakPwd(state.req)
    .then(resp => resp.response)
    .then((data: ListWeakPwdReply) => {
        state.data = data.list;
        state.exhausted = data.exhausted;
        console.log(data);
    })
    .catch(err => alertApiError(err))
    .finally(() => state.loading = false);
};

// Handle domain Select All
const handleDomainCheckAll = (val: boolean) => {
    domainIndeterminate.value = false;
    if (val) {
        state.req.domain = state.domainOptions.map(opt => opt.value);
    } else {
        state.req.domain = [];
    }
};

// Handle locked Select All
const handleLockedCheckAll = (val: boolean) => {
    lockedIndeterminate.value = false;
    if (val) {
        state.req.locked = LockedOptions.map(opt => opt.value);
    } else {
        state.req.locked = [];
    }
};

// Watch individual filter properties
watch(() => state.req.domain, (val) => {
    domainIndeterminate.value = false;
    if (val.length === 0) {
        domainCheckAll.value = false;
    } else if (val.length === state.domainOptions.length) {
        domainCheckAll.value = true;
    } else {
        domainIndeterminate.value = true;
    }
    state.req.pageIdx = 1;
    refresh();
});

watch(() => state.req.locked, (val) => {
    lockedIndeterminate.value = false;
    if (val.length === 0) {
        lockedCheckAll.value = false;
    } else if (val.length === LockedOptions.length) {
        lockedCheckAll.value = true;
    } else {
        lockedIndeterminate.value = true;
    }
    state.req.pageIdx = 1;
    refresh();
});

watch(() => state.req.isPlain, () => {
    state.req.pageIdx = 1;
    refresh();
});

watch(() => state.req.search, () => {
    state.req.pageIdx = 1;
    refresh();
});

watch(() => state.req.pageIdx, () => {
    refresh();
});

watch(() => state.req.pageSize, () => {
    refresh();
});

onMounted(() => {
    refresh();
    listDomainOptions().then(v => state.domainOptions = v);
});
</script>
