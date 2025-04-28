
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from 'highlight.js';

const marked = new Marked(
    markedHighlight({
        highlight(code, lang, info) {
            console.log(code);
            const language = hljs.getLanguage(lang) ? lang : '';
            return hljs.highlight(code, { language }).value;
        }
    })
);

export const md2html = (md: string) => {
    return marked.parse(md);
};