import { marked } from "marked";

export function markdownToHtml(markdown) {
    if (markdown == "" || markdown == null) return "";
    return marked(markdown, {
        mangle: false,
        headerIds: false,
    });
}
