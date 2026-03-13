<template>
	<el-form ref="loginFormRef" :model="state.ruleForm" :rules="state.rules" size="large" class="login-content-form" @keyup.enter="onSignIn">
		<el-form-item class="login-animation1" prop="userName">
			<el-input text :placeholder="$t('message.login.usernamePlaceholder')" v-model="state.ruleForm.userName" clearable autocomplete="off" name="username">
				<template #prefix>
					<el-icon class="el-input__icon"><ele-User /></el-icon>
				</template>
			</el-input>
		</el-form-item>
		<el-form-item class="login-animation2" prop="password">
			<el-input
				:type="state.isShowPassword ? 'text' : 'password'"
				:placeholder="$t('message.login.passwordPlaceholder')"
				v-model="state.ruleForm.password"
				autocomplete="off"
				name="password"
			>
				<template #prefix>
					<el-icon class="el-input__icon"><ele-Unlock /></el-icon>
				</template>
				<template #suffix>
					<i
						class="iconfont el-input__icon login-content-password"
						:class="state.isShowPassword ? 'icon-yincangmima' : 'icon-xianshimima'"
						@click="state.isShowPassword = !state.isShowPassword"
					>
					</i>
				</template>
			</el-input>
		</el-form-item>
		<el-form-item class="login-animation3">
			<el-col :span="24">
				<el-input
					text
					maxlength="6"
					:placeholder="$t('message.login.mfaPlaceholder')"
					v-model="state.ruleForm.code"
					clearable
					autocomplete="off"
				>
					<template #prefix>
						<el-icon class="el-input__icon"><ele-Position /></el-icon>
					</template>
				</el-input>
			</el-col>
			<!-- <el-col :span="1"></el-col>
			<el-col :span="8">
				<el-button class="login-content-code" v-waves>1234</el-button>
			</el-col> -->
		</el-form-item>
		<el-form-item class="login-animation4">
			<el-button class="login-content-submit" round v-waves @click="onSignIn" :loading="state.loading.signIn">
				<span>{{ $t('message.account.accountBtnText') }}</span>
			</el-button>
		</el-form-item>
	</el-form>
</template>

<script setup lang="ts" name="loginAccount">
import { reactive, computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { useI18n } from 'vue-i18n';
import Cookies from 'js-cookie';
import { storeToRefs } from 'pinia';
import { useThemeConfig } from '/@/stores/themeConfig';
import { initFrontEndControlRoutes } from '/@/router/frontEnd';
import { initBackEndControlRoutes } from '/@/router/backEnd';
import { Session, Local } from '/@/utils/storage';
import { formatAxis } from '/@/utils/formatTime';
import { NextLoading } from '/@/utils/loading';
import api from '/@/api/grpc/index';
import * as proto from '/@/api/grpc/ada';
import { alertApiError } from '/@/utils/error';

// Define reactive state and refs
const { t } = useI18n();
const storesThemeConfig = useThemeConfig();
const { themeConfig } = storeToRefs(storesThemeConfig);
const route = useRoute();
const router = useRouter();
const loginFormRef = ref<FormInstance>();

const state = reactive({
	isShowPassword: false,
	ruleForm: {
		userName: '',
		password: '',
		code: '',
	},
	rules: {
		userName: [
			{ required: true, message: t('message.login.usernameRequired'), trigger: 'blur' }
		],
		password: [
			{ required: true, message: t('message.login.passwordRequired'), trigger: 'blur' }
		],
	} as FormRules,
	loading: {
		signIn: false,
	},
});

// Get the current time
const currentTime = computed(() => {
	return formatAxis(new Date());
});

const loginAda = async () => {
	const req: proto.LoginReq = {
		username: state.ruleForm.userName,
		password: state.ruleForm.password,
		totpCode: state.ruleForm.code,
	};

	state.loading.signIn = true;
	try {
		const { response } = await api.login(req);	
		// Store the token in browser storage
		Session.set('token', response.token);
		Cookies.set('userName', response.username);
		
		Local.set('userName', response.username);
		Local.set('user', response);
		Local.set('token', response.token);
		Local.set('needChangePassword', response.needChangePwd)

		const isNoPower = await initFrontEndControlRoutes();
		signInSuccess(isNoPower);
	} catch (err: any) {
		alertApiError(err);
		state.loading.signIn = false;
	}
}

// Login
const onSignIn = async () => {
	if (!loginFormRef.value) return;

	// Validate the form
	await loginFormRef.value.validate(async (valid) => {
		if (valid) {
			await loginAda();
		} else {
			return false;
		}
	});
};
// Handle the post-login redirect
const signInSuccess = (isNoPower: boolean | undefined) => {
	if (isNoPower) {
		ElMessage.warning('抱歉，您没有登录权限');
		Session.clear();
	} else {
		// Initialize the greeting shown after login
		let currentTimeInfo = currentTime.value;
		// After login, navigate to the default landing page
		// If the user pasted a non-home, non-login path, redirect back to that path after login
		if (route.query?.redirect) {
			router.push({
				path: <string>route.query?.redirect,
				query: Object.keys(<string>route.query?.params).length > 0 ? JSON.parse(<string>route.query?.params) : '',
			});
		} else {
			router.push('/');
		}
		// Show the login success message
		const signInText = t('message.signInText');
		ElMessage.success(`${currentTimeInfo}，${signInText}`);
		// Show the loading animation to avoid a brief blank screen on first load
		NextLoading.start();
	}
	state.loading.signIn = false;
};

// On mount
onMounted(async () => {
	const errmsg = Local.get("errmsg");
	const msg = Local.get("msg");

	if (errmsg) {
		ElMessage.error(errmsg);
		Local.remove("errmsg");
	}

	if (msg) {
		ElMessage.info(msg);
		Local.remove("msg");
	}
});
</script>

<style scoped lang="scss">
.login-content-form {
	margin-top: 20px;
	@for $i from 1 through 4 {
		.login-animation#{$i} {
			opacity: 0;
			animation-name: error-num;
			animation-duration: 0.5s;
			animation-fill-mode: forwards;
			animation-delay: calc($i/10) + s;
		}
	}
	.login-content-password {
		display: inline-block;
		width: 20px;
		cursor: pointer;
		&:hover {
			color: #909399;
		}
	}
	.login-content-code {
		width: 100%;
		padding: 0;
		font-weight: bold;
		letter-spacing: 5px;
	}
	.login-content-submit {
		width: 100%;
		letter-spacing: 2px;
		font-weight: 300;
		margin-top: 15px;
		background-color: rgb(245, 192, 96);
		color: #333;
		border-color: rgb(245, 192, 96);
		height: 50px;
		font-size: 24px;
		transition: all 0.3s ease;
		
		&:hover {
			background-color: rgb(250, 200, 107);
			border-color: rgb(250, 200, 107);
			transform: scale(1.02);
			box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		}
	}
}
</style>
