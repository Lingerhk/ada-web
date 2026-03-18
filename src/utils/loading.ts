import { nextTick } from 'vue';
import '/@/theme/loading.scss';

/**
 * Global page loading helper
 * @method start Create the loading overlay
 * @method done Remove the loading overlay
 */
export const NextLoading = {
	// Create the loading overlay
	start: () => {
		const bodys: Element = document.body;
		const div = <HTMLElement>document.createElement('div');
		div.setAttribute('class', 'loading-next');
		const htmls = `
			<div class="loading-next-box">
				<div class="loading-next-logo">
					<img src="/logo.svg" alt="Loading..." class="loading-logo-img" />
					<div class="loading-shine-effect"></div>
				</div>
			</div>
		`;
		div.innerHTML = htmls;
		bodys.insertBefore(div, bodys.childNodes[0]);
		window.nextLoading = true;
	},
	// Remove the loading overlay
	done: (time: number = 0) => {
		nextTick(() => {
			setTimeout(() => {
				window.nextLoading = false;
				const el = <HTMLElement>document.querySelector('.loading-next');
				el?.parentNode?.removeChild(el);
			}, time);
		});
	},
};
