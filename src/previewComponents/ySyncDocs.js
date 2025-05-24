import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

class YSyncDocs {
    yDoc = null;
    wsProvider = null;
    awareness = null;
    awareFunc = {};
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
        if (this.wsProvider) {
            return;
        }

        // 获取ws连接路径
        const backendRoot = import.meta.env.VITE_BACKEND_ROOT;
        const response = await fetch(`${backendRoot}/v1/get-sso-prefix`);
        const result = await response.json();

        this.wsProvider = new WebsocketProvider(result.ws_prefix, 'sync', this.yDoc, {
            params: {
                sessionId: userToken
            }
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
    async disconnect() {
        if (this.wsProvider) {
            this.wsProvider.disconnect();
            this.wsProvider.destroy();
            this.wsProvider = undefined;
        }
    }
}

const ySyncDocs = new YSyncDocs();
export default ySyncDocs;