// 消息类型枚举
const MESSAGE_TYPES = {
    PRIMARY: 'primary',
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
    SUCCESS: 'success'
};

// 全局消息容器ID
const CONTAINER_ID = 'ccxc-message-container';

// 创建消息容器
function createContainer() {
    let container = document.getElementById(CONTAINER_ID);
    if (!container) {
        container = document.createElement('div');
        container.id = CONTAINER_ID;
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }
    return container;
}

// 创建消息元素
function createMessage(content, type = MESSAGE_TYPES.INFO, duration = 3000) {
    const messageEl = document.createElement('div');
    
    // 根据类型设置不同的样式
    const typeStyles = {
        [MESSAGE_TYPES.PRIMARY]: {
            backgroundColor: '#722ed1',
            color: '#fff'
        },
        [MESSAGE_TYPES.INFO]: {
            backgroundColor: '#1890ff',
            color: '#fff'
        },
        [MESSAGE_TYPES.WARNING]: {
            backgroundColor: '#faad14',
            color: '#fff'
        },
        [MESSAGE_TYPES.ERROR]: {
            backgroundColor: '#f5222d',
            color: '#fff'
        },
        [MESSAGE_TYPES.SUCCESS]: {
            backgroundColor: '#52c41a',
            color: '#fff'
        }
    };

    const style = typeStyles[type] || typeStyles[MESSAGE_TYPES.INFO];
    
    messageEl.style.cssText = `
        background-color: ${style.backgroundColor};
        color: ${style.color};
        padding: 12px 20px;
        border-radius: 6px;
        margin-bottom: 10px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        font-size: 14px;
        line-height: 1.5;
        max-width: 300px;
        word-wrap: break-word;
        pointer-events: auto;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease-in-out;
    `;
    
    messageEl.textContent = content;
    
    const container = createContainer();
    container.appendChild(messageEl);
    
    // 触发动画显示
    setTimeout(() => {
        messageEl.style.opacity = '1';
        messageEl.style.transform = 'translateX(0)';
    }, 10);
    
    // 自动移除
    setTimeout(() => {
        messageEl.style.opacity = '0';
        messageEl.style.transform = 'translateX(100%)';
        
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
            
            // 如果容器为空，则移除容器
            if (container.children.length === 0) {
                container.parentNode && container.parentNode.removeChild(container);
            }
        }, 300);
    }, duration);
    
    return messageEl;
}

// 创建通知消息元素（带标题）
function createNotification(title, content, type = MESSAGE_TYPES.INFO, duration = 4000) {
    const messageEl = document.createElement('div');
    
    // 根据类型设置不同的样式
    const typeStyles = {
        [MESSAGE_TYPES.PRIMARY]: {
            backgroundColor: '#722ed1',
            color: '#fff'
        },
        [MESSAGE_TYPES.INFO]: {
            backgroundColor: '#1890ff',
            color: '#fff'
        },
        [MESSAGE_TYPES.WARNING]: {
            backgroundColor: '#faad14',
            color: '#fff'
        },
        [MESSAGE_TYPES.ERROR]: {
            backgroundColor: '#f5222d',
            color: '#fff'
        },
        [MESSAGE_TYPES.SUCCESS]: {
            backgroundColor: '#52c41a',
            color: '#fff'
        }
    };

    const style = typeStyles[type] || typeStyles[MESSAGE_TYPES.INFO];
    
    messageEl.style.cssText = `
        background-color: ${style.backgroundColor};
        color: ${style.color};
        padding: 16px 20px;
        border-radius: 6px;
        margin-bottom: 10px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        font-size: 14px;
        line-height: 1.5;
        max-width: 350px;
        word-wrap: break-word;
        pointer-events: auto;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease-in-out;
    `;
    
    // 创建标题和内容
    const titleEl = document.createElement('div');
    titleEl.style.cssText = `
        font-weight: bold;
        margin-bottom: 6px;
        font-size: 15px;
    `;
    titleEl.textContent = title;
    
    const contentEl = document.createElement('div');
    contentEl.textContent = content;
    
    messageEl.appendChild(titleEl);
    messageEl.appendChild(contentEl);
    
    const container = createContainer();
    container.appendChild(messageEl);
    
    // 触发动画显示
    setTimeout(() => {
        messageEl.style.opacity = '1';
        messageEl.style.transform = 'translateX(0)';
    }, 10);
    
    // 自动移除
    setTimeout(() => {
        messageEl.style.opacity = '0';
        messageEl.style.transform = 'translateX(100%)';
        
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
            
            // 如果容器为空，则移除容器
            if (container.children.length === 0) {
                container.parentNode && container.parentNode.removeChild(container);
            }
        }, 300);
    }, duration);
    
    return messageEl;
}

// 全局 message 对象
const message = {
    info(content, duration = 3000) {
        return createMessage(content, MESSAGE_TYPES.INFO, duration);
    },
    
    warning(content, duration = 4000) {
        return createMessage(content, MESSAGE_TYPES.WARNING, duration);
    },
    
    error(content, duration = 5000) {
        return createMessage(content, MESSAGE_TYPES.ERROR, duration);
    },
    
    success(content, duration = 3000) {
        return createMessage(content, MESSAGE_TYPES.SUCCESS, duration);
    },
    
    primary(content, duration = 3000) {
        return createMessage(content, MESSAGE_TYPES.PRIMARY, duration);
    },
    
    // toast API - 兼容其他库的接口
    toast(opt) {
        const { message: content, type = 'info', duration = 3000 } = opt;
        // 映射类型名称
        const typeMap = {
            'primary': MESSAGE_TYPES.PRIMARY,
            'info': MESSAGE_TYPES.INFO,
            'warning': MESSAGE_TYPES.WARNING,
            'error': MESSAGE_TYPES.ERROR,
            'success': MESSAGE_TYPES.SUCCESS
        };
        const mappedType = typeMap[type] || MESSAGE_TYPES.INFO;
        return createMessage(content, mappedType, duration);
    },
    
    // notify API - 带标题的通知
    notify(opt) {
        const { title, message: content, type = 'info', duration = 4000 } = opt;
        // 映射类型名称
        const typeMap = {
            'primary': MESSAGE_TYPES.PRIMARY,
            'info': MESSAGE_TYPES.INFO,
            'warning': MESSAGE_TYPES.WARNING,
            'error': MESSAGE_TYPES.ERROR,
            'success': MESSAGE_TYPES.SUCCESS
        };
        const mappedType = typeMap[type] || MESSAGE_TYPES.INFO;
        return createNotification(title, content, mappedType, duration);
    }
};

// 将 message 对象挂载到全局 window 对象上，方便全局使用
if (typeof window !== 'undefined') {
    window.message = message;
}

export default message; 