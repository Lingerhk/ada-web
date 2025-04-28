<template>
  <div class="bg-main">
    <div v-if="state === TerminalStateEnum.INIT" class="modal">
      <div class="modal-content">
        <el-form :inline="true">
          <el-form-item label="请输入验证码">
            <el-input v-model="inviteCode" placeholder="验证码" size="default" />
          </el-form-item>
          <!-- <el-form-item>
            <template #label>
              <span>使能子协议</span>
            </template>
            <el-tooltip class="box-item" placement="top-start"
              content="使能：new WebSocket(url, [token])；去使能：new WebSocket(url)">
              <el-switch v-model="enableProtocols" size="small"></el-switch>
            </el-tooltip>
          </el-form-item> -->
          <el-form-item>
            <el-button @click="verifyCode" size="default" type="primary">提交</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div v-if="state !== TerminalStateEnum.INIT" ref="terminal" v-loading="state === TerminalStateEnum.LOADING"
      class="terminal" element-loading-text="拼命连接中"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { debounce } from 'lodash';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { AttachAddon } from 'xterm-addon-attach';
import { Local } from '/@/utils/storage';

enum TerminalStateEnum {
  INIT = 'Init',
  LOADING = 'Loading',
  READY = 'Ready',
};

const terminal = ref(null);
const fitAddon = new FitAddon();
const inviteCode = ref('') // 用户输入的验证码
const enableProtocols = ref(false);

const state = ref(TerminalStateEnum.INIT);

let terminalSocket = ref(null)
let term = ref(null)

// 验证用户输入的验证码
const verifyCode = () => {
    state.value = TerminalStateEnum.LOADING;
    initWS();
};

// 初始化WS
const initWS = () => {
  if (!terminalSocket.value) {
    createWS()
  }

  if (terminalSocket.value && terminalSocket.value.readyState > 1) {
    terminalSocket.value.close()
    createWS()
  }
}

// 创建WS
const createWS = () => {
  const token = Local.get('token');
  terminalSocket.value = new WebSocket(
    `ws://${window.location.host}/webssh/stream?code=${inviteCode.value}&token=${token}`
    // , enableProtocols.value ? [token] : undefined
  );

  terminalSocket.value.onopen = runRealTerminal; //WebSocket 连接已建立
  terminalSocket.value.onclose = closeRealTerminal; //WebSocket 连接已关闭
};

//WebSocket 连接已建立
const runRealTerminal = () => {
  state.value = TerminalStateEnum.READY;
  initTerm();
};

//WebSocket 连接已关闭
const closeRealTerminal = (e) => {
  state.value = TerminalStateEnum.INIT;
  alert(`连接关闭，事件代码：${e.code}。`);
  console.log(e);
  if (term.value) {
    // 不需要关闭？Error: Could not dispose an addon that has not been loaded
    // term.value.dispose();
    term.value = null;
  }
};

// 初始化Terminal
const initTerm = () => {
  term.value = new Terminal({
    // lineHeight: 1.2,
    fontSize: 14,
    fontFamily: "Monaco, Menlo, Consolas, 'Courier New', monospace",
    theme: {
      background: '#181d28',
    },
    // 光标闪烁
    cursorBlink: true,
    cursorStyle: 'underline',
    // scrollback: 100,
    // tabStopWidth: 4,
  });
  const attachAddon = new AttachAddon(terminalSocket.value);

  term.value.open(terminal.value); //挂载dom窗口
  term.value.loadAddon(fitAddon); //自适应尺寸
  term.value.loadAddon(attachAddon);
  fitAddon.fit();
};

// 适应浏览器尺寸变化
const fitTerm = () => {
  fitAddon.fit();
};

const onResize = debounce(() => fitTerm(), 500);

const onTerminalResize = () => {
  window.addEventListener('resize', onResize);
};

const removeResizeListener = () => {
  window.removeEventListener('resize', onResize);
};

onMounted(() => {
  onTerminalResize();
});

onBeforeUnmount(() => {
  removeResizeListener();
  terminalSocket.value && terminalSocket.value.close();
});
</script>

<style lang="scss" scoped>
.bg-main {
  padding: 10px;
  height: 800px;
  position: relative;
}

.terminal {
  width: 100%;
  height: calc(100% - 62px);
}

.modal {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 20px;
}

.modal-content {
  background: white;
  padding-top: 20px;
  padding-left: 20px;
  border-radius: 5px;
  text-align: center;
}

.close {
  float: right;
  font-size: 28px;
  cursor: pointer;
}

</style>