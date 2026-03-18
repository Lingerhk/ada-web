// Icon-font URL
const cssCdnUrlList: Array<string> = [
	// '//at.alicdn.com/t/c/font_2298093_rnp72ifj3ba.css',
	// '//netdna.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css',

];
// Third-party JS URL
const jsCdnUrlList: Array<string> = [];

// Dynamically register icon-font stylesheets
export function setCssCdn() {
	if (cssCdnUrlList.length <= 0) return false;
	cssCdnUrlList.map((v) => {
		let link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = v;
		link.crossOrigin = 'anonymous';
		document.getElementsByTagName('head')[0].appendChild(link);
	});
}

// Dynamically register third-party scripts
export function setJsCdn() {
	if (jsCdnUrlList.length <= 0) return false;
	jsCdnUrlList.map((v) => {
		let link = document.createElement('script');
		link.src = v;
		document.body.appendChild(link);
	});
}

/**
 * Bulk registration for icon fonts and dynamic scripts
 * @method cssCdn Dynamically register icon-font stylesheets
 * @method jsCdn Dynamically register third-party scripts
 */
const setIntroduction = {
	// Register CSS
	cssCdn: () => {
		setCssCdn();
	},
	// Register JS
	jsCdn: () => {
		setJsCdn();
	},
};

// Export the helpers
export default setIntroduction;
