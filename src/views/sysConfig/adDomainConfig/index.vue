<template>
	<div class="domain-config-container layout-pd">
		<el-card shadow="hover">
			<div class="domain-config-filter mb15">
				<el-form label-width="auto" :inline="true">
					<el-form-item>
						<el-button size="default" type="primary" @click="handleAdd">
							{{ $t('message.tableCommon.new') }}
						</el-button>
					</el-form-item>
					<el-form-item>
						<template #label>{{ $t('message.tableCommon.domain') }}</template>
						<MultiSelector v-model:selected="domainSelected" :options="domainOptions"></MultiSelector>
					</el-form-item>
					<el-form-item>
						<template #label>{{ $t('message.adDomain.status') }}</template>
						<MultiSelector v-model:selected="stateSelected" :options="stateOptions"></MultiSelector>
					</el-form-item>
					<el-form-item>
						<el-input v-model="kwInput" size="default" style="width: 350px"
							:placeholder="$t('message.adDomain.kwInput')" :suffix-icon="Search" clearable />
					</el-form-item>
				</el-form>
			</div>
			<el-table :data="state.data" v-loading="state.loading" style="width: 100%">
				<el-table-column type="index" width="50" />
				<el-table-column prop="dcHostname" :label="$t('message.adDomain.dcHostname')">
				</el-table-column>
				<el-table-column prop="name" :label="$t('message.adDomain.name')"></el-table-column>
				<el-table-column prop="domainInfo.user" :label="$t('message.adDomain.user')">
				</el-table-column>
				<el-table-column prop="status" :label="$t('message.adDomain.status')">
					<template #default="scope">
						<span
							:class="scope.row.status === 'run' ? 'success-color' : scope.row.status === 'error' ? 'failed-color' : ''">{{
							$t('message.adDomain.state.' + scope.row.status) }}</span>

						<el-tooltip class="box-item" effect="dark" :content="scope.row.errMsg" placement="right-start"
							v-if="scope.row.errMsg !== ''">
							<el-icon style="margin-left: 5px;">
								<QuestionFilled />
							</el-icon>
						</el-tooltip>
					</template>
				</el-table-column>
				<el-table-column :label="$t('message.tableCommon.operation')" width="240">
					<template #default="scope">
						<el-button size="large" text type="primary" @click="onOpenDetailDialog(scope.row)">{{
							$t('message.tableCommon.detail') }}</el-button>
						<el-button size="large" text type="primary" @click="handleEdit(scope.row)">{{
							$t('message.tableCommon.edit') }}</el-button>
						<el-button size="large" text type="danger" @click="onTabelRowDel(scope.row)">{{
							$t('message.tableCommon.delete') }}</el-button>
					</template>
				</el-table-column>
			</el-table>
			<!-- 分页 -->
			<el-row style="margin-top: 10px" justify="space-between">
				<div></div>
				<el-pagination v-model:current-page="state.req.pageIdx" v-model:page-size="state.req.pageSize"
					:page-sizes="[10, 20, 30, 40, 50]" layout='sizes, prev, pager, next, jumper' :total="state.total"
					@size-change="handleSizeChange" @current-change="handleCurrentChange" />
			</el-row>
		</el-card>
		<AddDrawer ref="addDrawerRef" />
		<DetailDrawer ref="detailDrawerRef" />
	</div>
</template>

<script setup lang="ts" name="systemMenu">
import { defineAsyncComponent, ref, onMounted, reactive, watch } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import api from '/@/api/grpc/index';
import * as proto from '/@/api/grpc/ada';
import { alertApiError } from '/@/utils/error';
import { useI18n } from 'vue-i18n';
import { QuestionFilled } from '@element-plus/icons-vue'

const { t } = useI18n();

// 引入组件
const AddDrawer = defineAsyncComponent(() => import('./addAdDomainDrawer.vue'));
const DetailDrawer = defineAsyncComponent(() => import('./detailAdDomainDrawer.vue'));
const MultiSelector = defineAsyncComponent(() => import('/@/components/form/multiSelector.vue'));

// 定义变量内容
const addDrawerRef = ref();
const detailDrawerRef = ref();
const state = reactive({
	req: {
        pageIdx: 1,
        pageSize: 10,
        filterDomain: '',
        filterStatus: '',
        filterKeyword: '',
	} as proto.ListDomainReq,
	loading: false,
	data: [] as proto.ListDomainReply_Details[],
	exhausted: false,
	total: 0,
});

const domainSelected = ref([]);
const domainOptions = ref([] as { value: string, label: string }[]);

const stateSelected = ref([]);
const stateOptions = ['run', 'error', 'init', 'remove'].map(value => ({ value, label: t('message.adDomain.state.' + value) }));

const kwInput = ref('');

const getListDomain = async (updateOption: boolean | undefined = false) => {
	state.loading = true;

	console.log("listDomain", JSON.stringify(state.req));

    await api.listDomain(state.req)
    .then(response => response.response)
	.then((data: proto.ListDomainReply) => {
		console.log("ListDomainReply", data);
		state.total = data.page?.total ?? data.list.length;
		state.data = data.list;
		state.exhausted = data.exhausted;
		if (updateOption) {
			domainOptions.value = data.list.map((_) => ({ label: _.name, value: _.name }));
		}
	})
    .catch(err => alertApiError(err))
	.finally(() => state.loading = false);
}

const onOpenDetailDialog = (row: proto.ListDomainReply_Details) => {
	// detailDialogRef.value?.open(row);
	detailDrawerRef.value.open(row)
}

// 打开新增菜单弹窗
const handleAdd = () => {
	addDrawerRef.value.open(t('message.adDomain.addTitle'), 'add', null, getListDomain);
}

// 打开编辑菜单弹窗
const handleEdit = (row: proto.ListDomainReply_Details) => {
	addDrawerRef.value.open(t('message.adDomain.editTitle'), 'edit', row, getListDomain);
};

// 删除当前行
const onTabelRowDel = (row: proto.ListDomainReply_Details) => {
	ElMessageBox.confirm(t('message.adDomain.delDomainConfirmTitle'), t('message.dialog.prompt'), {
		confirmButtonText: t('message.dialog.delete'),
		cancelButtonText: t('message.dialog.cancel'),
		type: 'warning',
	})
	.then(() => {
		const req: proto.DeleteDomainReq = { iD: row.iD, name: row.name };
		console.log('deleteDomain', req);
		api.deleteDomain(req)
		.then(resp => resp.response)
		.then((data: proto.DeleteDomainReply) => {
			if (data.result === 'success') {
				ElMessage.success(t('message.dialog.deleteSucc'));
			} else {
				ElMessage.success(t('message.dialog.deleteFail'));
			}
		})
	})
	.catch(() => { })
	.finally(() => getListDomain());
};

const handleSizeChange = (val: number) => {
    state.req.pageSize = val;
    getListDomain();
};

const handleCurrentChange = (val: number) => {
	state.req.pageIdx = val;
    getListDomain();
};

watch(domainSelected, (val) => {
	if (val.length === 0) {
		state.req.filterDomain = '';
	} else {
		state.req.filterDomain = val.join(',');
	}

	getListDomain();
});

watch(stateSelected, (val) => {
	if (val.length === 0) {
		state.req.filterStatus = '';
	} else {
		state.req.filterStatus = val.join(',');
	}

	getListDomain();
});

watch(kwInput, (val) => {
	state.req.filterKeyword = val;

	getListDomain();
});

// 页面加载时
onMounted(() => {
	getListDomain(true);
});
</script>
