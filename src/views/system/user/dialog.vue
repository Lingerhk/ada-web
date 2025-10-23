<template>
	<div class="system-user-dialog-container">
		<el-dialog :title="state.dialog.title" v-model="state.dialog.isShowDialog" width="769px">
			<el-form ref="userDialogFormRef" :model="state.ruleForm" size="default" label-width="90px">
				<el-row :gutter="35">
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item :label="$t('message.system.user.userName')">
							<el-input v-model="state.ruleForm.userName" :placeholder="$t('message.system.user.userNamePlaceholder')" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item :label="$t('message.system.user.userNickname')">
							<el-input v-model="state.ruleForm.userNickname" :placeholder="$t('message.system.user.userNicknamePlaceholder')" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item :label="$t('message.system.user.roleSign')">
							<el-select v-model="state.ruleForm.roleSign" :placeholder="$t('message.system.user.roleSignPlaceholder')" clearable class="w100">
								<el-option :label="$t('message.system.user.roleAdmin')" value="admin"></el-option>
								<el-option :label="$t('message.system.user.roleCommon')" value="common"></el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item :label="$t('message.system.user.department')">
							<el-cascader
								:options="state.deptData"
								:props="{ checkStrictly: true, value: 'deptName', label: 'deptName' }"
								:placeholder="$t('message.system.user.departmentPlaceholder')"
								clearable
								class="w100"
								v-model="state.ruleForm.department"
							>
								<template #default="{ node, data }">
									<span>{{ data.deptName }}</span>
									<span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
								</template>
							</el-cascader>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item :label="$t('message.system.user.phone')">
							<el-input v-model="state.ruleForm.phone" :placeholder="$t('message.system.user.phonePlaceholder')" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item :label="$t('message.system.user.email')">
							<el-input v-model="state.ruleForm.email" :placeholder="$t('message.system.user.emailPlaceholder')" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item :label="$t('message.system.user.sex')">
							<el-select v-model="state.ruleForm.sex" :placeholder="$t('message.system.user.sexPlaceholder')" clearable class="w100">
								<el-option :label="$t('message.system.user.sexMale')" value="男"></el-option>
								<el-option :label="$t('message.system.user.sexFemale')" value="女"></el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item :label="$t('message.system.user.password')">
							<el-input v-model="state.ruleForm.password" :placeholder="$t('message.system.user.passwordPlaceholder')" type="password" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item :label="$t('message.system.user.overdueTime')">
							<el-date-picker v-model="state.ruleForm.overdueTime" type="date" :placeholder="$t('message.system.user.overdueTimePlaceholder')" class="w100"> </el-date-picker>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item :label="$t('message.system.user.userStatus')">
							<el-switch v-model="state.ruleForm.status" inline-prompt :active-text="$t('message.system.user.statusActive')" :inactive-text="$t('message.system.user.statusInactive')"></el-switch>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item :label="$t('message.system.user.describe')">
							<el-input v-model="state.ruleForm.describe" type="textarea" :placeholder="$t('message.system.user.describePlaceholder')" maxlength="150"></el-input>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="onCancel" size="default">{{ $t('message.system.user.cancel') }}</el-button>
					<el-button type="primary" @click="onSubmit" size="default">{{ state.dialog.submitTxt }}</el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="systemUserDialog">
import { reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t: $t } = useI18n();

// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);

// 定义变量内容
const userDialogFormRef = ref();
const state = reactive({
	ruleForm: {
		userName: '', // 账户名称
		userNickname: '', // 用户昵称
		roleSign: '', // 关联角色
		department: [] as string[], // 部门
		phone: '', // 手机号
		email: '', // 邮箱
		sex: '', // 性别
		password: '', // 账户密码
		overdueTime: '', // 账户过期
		status: true, // 用户状态
		describe: '', // 用户描述
	},
	deptData: [] as DeptTreeType[], // 部门数据
	dialog: {
		isShowDialog: false,
		type: '',
		title: '',
		submitTxt: '',
	},
});

// 打开弹窗
const openDialog = (type: string, row: RowUserType) => {
	if (type === 'edit') {
		state.ruleForm = row;
		state.dialog.title = $t('message.system.user.editUserTitle');
		state.dialog.submitTxt = $t('message.system.user.update');
	} else {
		state.dialog.title = $t('message.system.user.addUserTitle');
		state.dialog.submitTxt = $t('message.system.user.submit');
		// 清空表单，此项需加表单验证才能使用
		// nextTick(() => {
		// 	userDialogFormRef.value.resetFields();
		// });
	}
	state.dialog.isShowDialog = true;
	getMenuData();
};
// 关闭弹窗
const closeDialog = () => {
	state.dialog.isShowDialog = false;
};
// 取消
const onCancel = () => {
	closeDialog();
};
// 提交
const onSubmit = () => {
	closeDialog();
	emit('refresh');
	// if (state.dialog.type === 'add') { }
};
// 初始化部门数据
const getMenuData = () => {
	state.deptData.push({
		deptName: 'vueNextAdmin',
		createTime: new Date().toLocaleString(),
		status: true,
		sort: Math.random(),
		describe: '顶级部门',
		id: Math.random(),
		children: [
			{
				deptName: 'IT外包服务',
				createTime: new Date().toLocaleString(),
				status: true,
				sort: Math.random(),
				describe: '总部',
				id: Math.random(),
			},
			{
				deptName: '资本控股',
				createTime: new Date().toLocaleString(),
				status: true,
				sort: Math.random(),
				describe: '分部',
				id: Math.random(),
			},
		],
	});
};

// 暴露变量
defineExpose({
	openDialog,
});
</script>
