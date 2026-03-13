import type { App } from 'vue';
import { authDirective } from '/@/directive/authDirective';
import { wavesDirective, dragDirective } from '/@/directive/customDirective';

/**
 * Export directive helpers such as `v-xxx`
 * @methods authDirective User-permission directive, used as `v-auth`
 * @methods wavesDirective Button wave directive, used as `v-waves`
 * @methods dragDirective Custom drag directive, used as `v-drag`
 */
export function directive(app: App) {
	// User-permission directive
	authDirective(app);
	// Button wave directive
	wavesDirective(app);
	// Custom drag directive
	dragDirective(app);
}
