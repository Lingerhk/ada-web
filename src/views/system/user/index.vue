<template>
	<div class="system-user-container layout-padding">
		<el-card shadow="hover" class="layout-padding-auto">
			<div class="system-user-search mb15">
				<el-input size="default" :placeholder="$t('message.system.user.searchPlaceholder')" style="max-width: 180px"> </el-input>
				<el-button size="default" type="primary" class="ml10">
					<el-icon>
						<ele-Search />
					</el-icon>
					{{ $t('message.system.user.search') }}
				</el-button>
				<el-button size="default" type="success" class="ml10" @click="onOpenAddUser('add')">
					<el-icon>
						<ele-FolderAdd />
					</el-icon>
					{{ $t('message.system.user.addUser') }}
				</el-button>
			</div>
			<el-table :data="state.tableData.data" v-loading="state.tableData.loading" style="width: 100%">
				<el-table-column type="index" :label="$t('message.system.user.serialNumber')" width="60" />
				<el-table-column prop="userName" :label="$t('message.system.user.userName')" show-overflow-tooltip></el-table-column>
				<el-table-column prop="userNickname" :label="$t('message.system.user.userNickname')" show-overflow-tooltip></el-table-column>
				<el-table-column prop="roleSign" :label="$t('message.system.user.roleSign')" show-overflow-tooltip></el-table-column>
				<el-table-column prop="department" :label="$t('message.system.user.department')" show-overflow-tooltip></el-table-column>
				<el-table-column prop="phone" :label="$t('message.system.user.phone')" show-overflow-tooltip></el-table-column>
				<el-table-column prop="email" :label="$t('message.system.user.email')" show-overflow-tooltip></el-table-column>
				<el-table-column prop="status" :label="$t('message.system.user.userStatus')" show-overflow-tooltip>
					<template #default="scope">
						<el-tag type="success" v-if="scope.row.status">{{ $t('message.system.user.enabled') }}</el-tag>
						<el-tag type="info" v-else>{{ $t('message.system.user.disabled') }}</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="describe" :label="$t('message.system.user.describe')" show-overflow-tooltip></el-table-column>
				<el-table-column prop="createTime" :label="$t('message.system.user.createTime')" show-overflow-tooltip></el-table-column>
				<el-table-column :label="$t('message.system.user.operation')" width="140" fixed="right" align="center">
					<template #default="scope">
						<el-button :disabled="scope.row.userName === 'admin'" size="small" @click="onOpenEditUser('edit', scope.row)"
							>{{ $t('message.system.user.edit') }}</el-button
						>
						<el-button :disabled="scope.row.userName === 'admin'" size="small" type="danger" @click="onRowDel(scope.row)">{{ $t('message.system.user.delete') }}</el-button>
					</template>
				</el-table-column>
			</el-table>
			<el-pagination
				@size-change="onHandleSizeChange"
				@current-change="onHandleCurrentChange"
				class="mt15"
				:pager-count="5"
				:page-sizes="[10, 20, 30]"
				v-model:current-page="state.tableData.param.pageNum"
				background
				v-model:page-size="state.tableData.param.pageSize"
				layout="total, sizes, prev, pager, next, jumper"
				:total="state.tableData.total"
			>
			</el-pagination>
		</el-card>
		<UserDialog ref="userDialogRef" @refresh="getTableData()" />
	</div>
</template>

<script setup lang="ts" name="systemUser">
import { defineAsyncComponent, reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';

const { t: $t } = useI18n();

// 引入组件
const UserDialog = defineAsyncComponent(() => import('/@/views/system/user/dialog.vue'));

// 定义变量内容
const userDialogRef = ref();
const state = reactive<SysUserState>({
	tableData: {
		data: [],
		total: 0,
		loading: false,
		param: {
			pageNum: 1,
			pageSize: 10,
		},
	},
});

// 初始化表格数据
const getTableData = () => {
	state.tableData.loading = true;
	const data = [];
	for (let i = 0; i < 2; i++) {
		data.push({
			userName: i === 0 ? 'admin' : 'test',
			userNickname: i === 0 ? '我是管理员' : '我是普通用户',
			roleSign: i === 0 ? 'admin' : 'common',
			department: i === 0 ? ['vueNextAdmin', 'IT外包服务'] : ['vueNextAdmin', '资本控股'],
			phone: '12345678910',
			email: 'vueNextAdmin@123.com',
			sex: '女',
			password: '123456',
			overdueTime: new Date(),
			status: true,
			describe: i === 0 ? '不可删除' : '测试用户',
			createTime: new Date().toLocaleString(),
		});
	}
	state.tableData.data = data;
	state.tableData.total = state.tableData.data.length;
	setTimeout(() => {
		state.tableData.loading = false;
	}, 500);
};
// 打开新增用户弹窗
const onOpenAddUser = (type: string) => {
	userDialogRef.value.openDialog(type);
};
// 打开修改用户弹窗
const onOpenEditUser = (type: string, row: RowUserType) => {
	userDialogRef.value.openDialog(type, row);
};
// 删除用户
const onRowDel = (row: RowUserType) => {
	ElMessageBox.confirm($t('message.system.user.deleteConfirm', [row.userName]), $t('message.system.user.deleteConfirmTitle'), {
		confirmButtonText: $t('message.system.user.confirm'),
		cancelButtonText: $t('message.system.user.cancel'),
		type: 'warning',
	})
		.then(() => {
			getTableData();
			ElMessage.success($t('message.system.user.deleteSuccess'));
		})
		.catch(() => {});
};
// 分页改变
const onHandleSizeChange = (val: number) => {
	state.tableData.param.pageSize = val;
	getTableData();
};
// 分页改变
const onHandleCurrentChange = (val: number) => {
	state.tableData.param.pageNum = val;
	getTableData();
};
// 页面加载时
onMounted(() => {
	getTableData();
});
</script>

<style scoped lang="scss">
.system-user-container {
	:deep(.el-card__body) {
		display: flex;
		flex-direction: column;
		flex: 1;
		overflow: auto;
		.el-table {
			flex: 1;
		}
	}
}
</style>
