<template>
  <div class="bg-main">
    <div v-if="state === TerminalStateEnum.INIT" class="modal">
      <div class="modal-content">
        <el-form :inline="true">
          <el-form-item :label="t('message.system.webssh.inviteCodeLabel')">
            <el-input v-model="inviteCode" :placeholder="t('message.system.webssh.inviteCodePlaceholder')" size="default" />
          </el-form-item>
          <el-form-item>
            <el-button @click="verifyCode" size="default" type="primary">{{ t('message.system.webssh.submit') }}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div v-if="state !== TerminalStateEnum.INIT" ref="terminal" v-loading="state === TerminalStateEnum.LOADING"
      class="terminal" :element-loading-text="t('message.system.webssh.connecting')"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { debounce } from 'lodash';
import { ElMessageBox } from 'element-plus';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { AttachAddon } from 'xterm-addon-attach';
import { useI18n } from 'vue-i18n';
import { Local } from '/@/utils/storage';

enum TerminalStateEnum {
  INIT = 'Init',
  LOADING = 'Loading',
  READY = 'Ready',
}

const terminal = ref(null);
const fitAddon = new FitAddon();
const inviteCode = ref('') // Verification code entered by the user
const { t } = useI18n();

const state = ref(TerminalStateEnum.INIT);

let terminalSocket = ref(null)
let term = ref(null)

// Validate the user-entered verification code
const verifyCode = () => {
    state.value = TerminalStateEnum.LOADING;
    initWS();
};

// Initialize the WebSocket
const initWS = () => {
  if (!terminalSocket.value) {
    createWS()
  }

  if (terminalSocket.value && terminalSocket.value.readyState > 1) {
    terminalSocket.value.close()
    createWS()
  }
}

// Create the WebSocket
const createWS = () => {
  const token = Local.get('token');
  terminalSocket.value = new WebSocket(
    `ws://${window.location.host}/webssh/stream?code=${inviteCode.value}&token=${token}`
    // , enableProtocols.value ? [token] : undefined
  );

  terminalSocket.value.onopen = runRealTerminal; // WebSocket connection established
  terminalSocket.value.onclose = closeRealTerminal; // WebSocket connection closed
};

// WebSocket connection established
const runRealTerminal = () => {
  state.value = TerminalStateEnum.READY;
  initTerm();
};

// WebSocket connection closed
const closeRealTerminal = (e) => {
  state.value = TerminalStateEnum.INIT;
  ElMessageBox.alert(t('message.system.webssh.connectionClosed', [e.code]), t('message.system.webssh.connectionClosedTitle'));
  console.log(e);
  if (term.value) {
    // No explicit close needed here. Error reference: `Could not dispose an addon that has not been loaded`
    // term.value.dispose();
    term.value = null;
  }
};

// Initialize the terminal
const initTerm = () => {
  term.value = new Terminal({
    // lineHeight: 1.2,
    fontSize: 14,
    fontFamily: "Monaco, Menlo, Consolas, 'Courier New', monospace",
    theme: {
      background: '#181d28',
    },
    // Blinking cursor
    cursorBlink: true,
    cursorStyle: 'underline',
    // scrollback: 100,
    // tabStopWidth: 4,
  });
  const attachAddon = new AttachAddon(terminalSocket.value);

  term.value.open(terminal.value); // Mount to the DOM container
  term.value.loadAddon(fitAddon); // Fit to the container size
  term.value.loadAddon(attachAddon);
  fitAddon.fit();
};

// Adapt to browser-size changes
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
