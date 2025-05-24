import request from './request.js';
import { fetchPostWithSign } from './request.js';
import ySyncDocs from './ySyncDocs.js';
import { adjustTextColor, dateFormat, sleep } from './utils.js';
import { markdownToHtml } from './markdown.js';
import { puzzleBackend } from './puzzleBackend.js';


const puzzleVuePlugin = {
    install(app) {
        app.provide("service", request);
        app.provide('api', fetchPostWithSign);
        app.provide('ysync', ySyncDocs);
        app.provide("adjustTextColor", adjustTextColor);
        app.provide("formatTimestamp", dateFormat);
        app.provide("markdownToHtml", markdownToHtml);
        app.provide("sleep", sleep);
        app.provide("backend", puzzleBackend);
    }
};

export default puzzleVuePlugin;