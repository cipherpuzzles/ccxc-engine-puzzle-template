import request from "./request";

function callPuzzleBackend(key, data, stores, nonce) {
    return request({
        url: "/v1/play/call-puzzle-backend",
        method: "post",
        data: {
            key,
            data,
            stores,
            nonce
        }
    })
}

function getPuzzleBackendStatus(key) {
    const storageKey = `puzzleBackend_${key}`;
    try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.warn('Failed to parse puzzle backend status from localStorage:', error);
    }
    
    // 返回默认值
    return { status: null, nonce: null };
}

function setPuzzleBackendStatus(key, status, nonce) {
    const storageKey = `puzzleBackend_${key}`;
    const data = { status, nonce };
    
    try {
        localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
        console.error('Failed to save puzzle backend status to localStorage:', error);
    }
}

export async function puzzleBackend(key, data) {
    let dataString = JSON.stringify(data);

    //get store and nonce
    let { status, nonce } = getPuzzleBackendStatus(key);
    const response = await callPuzzleBackend(key, dataString, status, nonce);

    //update store and nonce
    setPuzzleBackendStatus(key, response.stores, response.nonce);

    return JSON.parse(response.data);
}