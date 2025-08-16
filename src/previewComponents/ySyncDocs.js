import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { reactive } from 'vue';

class YSyncDocs {
    yDoc = null;
    wsProvider = null;
    awareness = null;
    awareFunc = {};
    userToken = null;
    reconnecting = false;
    status = reactive({
        connected: false,
        synced: false,
        retries: 0,
        errorMessage: ''
    });
    constructor() {
        this.yDoc = new Y.Doc();
        this.awareFunc = {};
    }
    registerAwarenessFunc(key, func) {
        this.awareFunc[key] = func;
    }
    unregisterAwarenessFunc(key) {
        delete this.awareFunc[key];
    }
    setAwarenessState(key, awareness) {
        let uid = parseInt(localStorage.getItem("uid"));
        let color = localStorage.getItem("color");
        let username = localStorage.getItem("username");

        if (this.awareness) {
            awareness.id = uid;
            awareness.color = color;
            awareness.name = username;

            this.awareness.setLocalStateField(key, awareness);
        }
    }
    removeAwarenessState(key) {
        if (this.awareness) {
            this.awareness.setLocalStateField(key, undefined);
        }
    }
    isConnect() {
        return this.wsProvider !== undefined;
    }
    async connect(userToken) {
        this.userToken = userToken;
        if (this.wsProvider) {
            console.warn("WebSocket provider already exists. Disconnecting first.");
            await this.disconnect();
        }
        this.status.connected = false;
        this.status.synced = false;

        // 获取ws连接路径
        const backendRoot = import.meta.env.VITE_BACKEND_ROOT;
        const response = await fetch(`${backendRoot}/v1/get-sso-prefix`);
        const result = await response.json();

        const params = {
            sessionId: userToken
        };

        this.wsProvider = new WebsocketProvider(result.ws_prefix, 'sync', this.yDoc, {
            params: params
        });
        this.wsProvider.shouldConnect = true;
        this.wsProvider.on('status', (event) => {
            if (event.status === 'connected') {
                this.status.connected = true;
                console.log('同步服务器已连接');
            } else if (event.status === 'disconnected') {
                this.status.connected = false;
                console.log('同步服务器已断开连接');
            } else if (event.status === 'connecting') {
                console.log('同步服务器正在连接...');
            } else if (event.status === 'closed') {
                this.status.connected = false;
                console.log('同步服务器连接已关闭');
            }
        });
        this.wsProvider.on('sync', (isSynced) => {
            this.status.synced = this.wsProvider.synced;
            if (this.wsProvider.synced) {
                this.status.retries = 0;
                this.status.errorMessage = ''; // 清除错误信息
                console.log('同步服务器已同步');
            }
        });
        this.wsProvider.on("connection-close", (event) => {
            console.log("WebSocket connection closed:", event);
            this.status.connected = false;
            this.status.synced = false;
            this.status.errorMessage = '同步服务器连接失败。' + (event.reason ? `原因为： ${event.reason}` : '');
            this.reconnect();
        });
        this.wsProvider.on("connection-error", (event) => {
            console.error("WebSocket connection error:", event);
            this.status.connected = false;
            this.status.synced = false;
            this.status.errorMessage = '同步服务器连接错误。' + (event.reason ? ` 原因为：${event.reason}` : '');
            this.reconnect();
        });
        this.awareness = this.wsProvider.awareness;
        this.awareness.on('change', (_changes) => {
            let awarenessInfo = Array.from(this.awareness.getStates().values());

            //所有不同应用的awareness建立不同的array
            let awareData = {};
            for (let key in this.awareFunc) {
                awareData[key] = [];
            }
            awarenessInfo.forEach((info) => {
                for (let key in this.awareFunc) {
                    if (info[key]) {
                        awareData[key].push(info[key]);
                    }
                }
            });
            //将awareness信息传递给各个应用
            for (let key in this.awareFunc) {
                this.awareFunc[key](awareData[key]);
            }
        });
    }
    async reconnect() {
        if (this.reconnecting) {
            console.warn("Already attempting to reconnect. Skipping this call.");
            return;
        }

        this.reconnecting = true;
        
        try {
            await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒再尝试重连
            
            if (!this.userToken) {
                console.error("User token is not set. Cannot reconnect.");
                this.reconnecting = false;
                return;
            }

            if (!this.status) {
                this.status = reactive({
                    connected: false,
                    synced: false,
                    retries: 0,
                    errorMessage: ''
                });
            }

            this.status.retries += 1;
            if (this.status.retries > 100) {
                this.status.errorMessage = "超过最大重连次数";
                console.error("Maximum reconnection attempts reached. Stopping reconnection.");
                this.disconnect();
                this.reconnecting = false;
                return;
            }

            await this.disconnect();
            await this.connect(this.userToken);
            console.log("Reconnected to WebSocket with user token:", this.userToken);
        } catch (error) {
            console.error("Error during reconnection:", error);
            this.status.errorMessage = `重连过程中发生错误: ${error.message}`;
        } finally {
            this.reconnecting = false;
        }
    }
    async disconnect() {
        this.status.connected = false;
        this.status.synced = false;

        if (this.wsProvider) {
            this.wsProvider?.disconnect();
            this.wsProvider?.destroy();
            this.wsProvider = undefined;
        }
    }
}

const ySyncDocs = new YSyncDocs();
export default ySyncDocs;