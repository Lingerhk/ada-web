import { ElMessage } from 'element-plus';

/**
 * Color conversion helpers
 * @method hexToRgb Convert a hex color to RGB
 * @method rgbToHex Convert an RGB color to hex
 * @method getDarkColor Darken a color
 * @method getLightColor Lighten a color
 */
export function useChangeColor() {
	// Input color string
	const hexToRgb = (str: string): any => {
		let hexs: any = '';
		let reg = /^\#?[0-9A-Fa-f]{6}$/;
		if (!reg.test(str)) {
			ElMessage.warning('输入错误的hex');
			return '';
		}
		str = str.replace('#', '');
		hexs = str.match(/../g);
		for (let i = 0; i < 3; i++) hexs[i] = parseInt(hexs[i], 16);
		return hexs;
	};
	// `r`, `g`, and `b` represent red, green, and blue
	const rgbToHex = (r: any, g: any, b: any): string => {
		let reg = /^\d{1,3}$/;
		if (!reg.test(r) || !reg.test(g) || !reg.test(b)) {
			ElMessage.warning('输入错误的rgb颜色值');
			return '';
		}
		let hexs = [r.toString(16), g.toString(16), b.toString(16)];
		for (let i = 0; i < 3; i++) if (hexs[i].length == 1) hexs[i] = `0${hexs[i]}`;
		return `#${hexs.join('')}`;
	};
	// Input color string and lightening ratio from 0 to 1
	const getDarkColor = (color: string, level: number): string => {
		let reg = /^\#?[0-9A-Fa-f]{6}$/;
		if (!reg.test(color)) {
			ElMessage.warning('输入错误的hex颜色值');
			return '';
		}
		let rgb = useChangeColor().hexToRgb(color);
		for (let i = 0; i < 3; i++) rgb[i] = Math.floor(rgb[i] * (1 - level));
		return useChangeColor().rgbToHex(rgb[0], rgb[1], rgb[2]);
	};
	// Input color string and darkening ratio from 0 to 1
	const getLightColor = (color: string, level: number): string => {
		let reg = /^\#?[0-9A-Fa-f]{6}$/;
		if (!reg.test(color)) {
			ElMessage.warning('输入错误的hex颜色值');
			return '';
		}
		let rgb = useChangeColor().hexToRgb(color);
		for (let i = 0; i < 3; i++) rgb[i] = Math.floor((255 - rgb[i]) * level + rgb[i]);
		return useChangeColor().rgbToHex(rgb[0], rgb[1], rgb[2]);
	};
	return {
		hexToRgb,
		rgbToHex,
		getDarkColor,
		getLightColor,
	};
}
