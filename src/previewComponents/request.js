import axios from 'axios';
import CryptoJS from 'crypto-js';
import message from './message.js';

// 生成签名
function generateSign(token, sk, ts, data) {
    const dataBody = JSON.stringify(data);
    const unsignedString = `token=${token}&ts=${ts}&bodyString=${dataBody}`;
    return CryptoJS.HmacSHA1(unsignedString, sk).toString(CryptoJS.enc.Base64);
}

// 处理响应
export function handleResponseStatus(data) {
    const { status, message: msg, location } = data;

    switch (status) {
        case 0:
        case 1:
            return data;
        case 2:
            message.error(msg);
            return Promise.reject(new Error(msg));
        case 3:
            message.warning(msg);
            window.location.href = location;
            return Promise.reject(new Error(msg));
        case 4:
        case 13:
            localStorage.clear();
            message.error(msg);
            return Promise.reject(new Error(msg));
        default:
            message.error(msg || '未知错误');
            return Promise.reject(new Error(msg || '未知错误'));
    }
}

const request = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_ROOT,
    timeout: 15000
});

request.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('userToken');
        const sk = localStorage.getItem('sk');
        const ts = Date.now();
        const sign = generateSign(token, sk, ts, config.data || {});

        config.headers['User-Token'] = token;
        config.headers['X-Auth-Token'] = `Ccxc-Auth ${ts} ${sign}`;

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

request.interceptors.response.use(
    (response) => {
        return handleResponseStatus(response.data);
    },
    (error) => {
        if (error.response) {
            const { data } = error.response;
            // 服务器返回了错误状态码的响应
            if (data) {
                return handleResponseStatus(data);
            } else {
                message.error(`服务器错误 (${error.response.status})`);
                return Promise.reject(new Error(`服务器错误 (${error.response.status})`));
            }
        } else if (error.request) {
            // 请求已发出，但没有收到响应
            message.error('服务器无响应');
            return Promise.reject(new Error('服务器无响应'));
        } else {
            // 请求配置出错
            message.error('请求配置错误');
            return Promise.reject(new Error('请求配置错误'));
        }
    }
);

export async function fetchPostWithSign(url, data, type = "normal") {
    if (type !== "normal") {
        message.error("type 的其他取值仅供 CCBC 13/14 特殊功能使用，目前已经弃用。在新项目中请不要再使用了。");
        return;
    }

    return request.request({
        url,
        method: "POST",
        data
    });
}

export default request;