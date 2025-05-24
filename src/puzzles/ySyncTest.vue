<template>
    <div v-for="(text, index) in d.text">
        <input v-model="d.text[index]" class="yt-input"
            :class="{'yt-focus': getAwareBorderColor(index) != null}"
            :style="{outlineColor: getAwareBorderColor(index)}"
            @input="(e) => updateInput(e, 't-' + index)"
            @focus="setCursor(index)"
            @blur="unsetCursor()"
        >
    </div>


</template>

<style>
.yt-input {
    height: 40px;
    line-height: 40px;
    width: 800px;
    font-size: 16px;
    border: 1px solid #999999;
    margin-top: 10px;
    margin-left: 10px;
}
.yt-focus {
    outline: 2.5px solid;
}

</style>

<script>
import { ref, reactive, inject, onMounted, onBeforeUnmount } from 'vue'

// 这个题目将用作YSync的例子
const YSYNC_KEY = "c16-ysync-example"; // 对于每一个进行状态同步的项目，都需要有一个不同的KEY；对于CCBC-16的项目，请以 c16- 作为前缀。

export default {
    setup() {
        //加载ySync对象
        const ySync = inject('ysync');

        //这是页面上使用的数据源。
        //数据源分为两部分：数据部分和感知部分。
        //数据部分就是实际的文档数据，也是真正被同步的内容。按照同步的单位将每一个需要同步的东西都放置在一个对象（或数组）中。
        //   我这里在页面上显示10行文本，同步的颗粒度就是“行”。
        //感知部分是标记哪个用户正在执行操作的，它的目的是让正在协作的其他用户可以感知到其他用户也在编辑这个文档。感知数据只按事件广播，不保证同步。
        //在系统中，数据部分和感知部分都可以包含任意的对象。但是感知部分的数据对象将会被追加 {id, color, name} 三个字段。
        const d = reactive({
            text: [...new Array(10)].map(i => ""),
            aware: []
        });

        //初始化同步
        const yDoc = ySync.yDoc;
        const yMap = yDoc.getMap(YSYNC_KEY); //yMap是同步的主体。它是一个key-value的map，其中每个key是同步最小单位。每个key的改变都会向其他终端发布同步广播，并保证数据的最终一致性。
  
        //在取得yMap对象后，我们需要用它来还原我们的数据源d。
        //对于数据源中的每一行，我们都以“t-{行号}”这样的key存在yMap里。所以这里我们遍历每一行，检查yMap中是否存在相同的key。
        for (let k = 0; k < d.text.length; k++) {
            let yMapKey = `t-${k}`;
            if (yMap.has(yMapKey)) {
                d.text[k] = yMap.get(yMapKey);
            }
        }

        //初始化感知，我们放置在onMounted钩子里。在收到感知后，我们简单的替换整个感知结果数组。
        onMounted(() => {
            ySync.registerAwarenessFunc(YSYNC_KEY, (aware) => {
                d.aware = aware;
            });
        });

        //请记住一定要注册onBeforeUnmount钩子，并在其中释放感知。
        onBeforeUnmount(() => {
            ySync.removeAwarenessState(YSYNC_KEY);
            ySync.unregisterAwarenessFunc(YSYNC_KEY);
        })
          
        //监听yMap修改并同步数据。yMap有修改后，会将修改结果通过event广播。我们可以知道哪些key被修改了。我们按照重建数据源相同的逻辑，将对应的key更新到数据源上。
        yMap.observe((event, trans) => {
            if (event.keysChanged) {
                event.keysChanged.forEach((key) => {
                    let value = yMap.get(key); //这是同步过来的新值
                    let k = parseInt(key.split('-')[1]); //因为我们是存的t-x形式的key，取减号后面的部分就是目标的数组索引了。
                    if (value === undefined) value = '';
                    d.text[k] = value;
                });
            }
        });

        //将本页中的更新同步给yMap。
        const updateInput = (event, key) => {
            if (event?.target?.value !== undefined)   {
                let content = event.target.value;
                yMap.set(key, content);
            }
        }

        //将感知结果设置在页面上
        const getAwareBorderColor = (index) => {
            for (let ai in d.aware) {
                let awareItem = d.aware[ai];
                if (awareItem.ci == index) {
                    return awareItem.color;
                }
            }
            return null;
        }

        //将用户激活输入框的操作传递给感知
        const setCursor = (index) => {
            ySync.setAwarenessState(YSYNC_KEY, {
                ci: index
            });
        }

        //用户取消输入状态，也需要取消感知
        const unsetCursor = () => {
            ySync.removeAwarenessState(YSYNC_KEY);
        }

        return {
            d,
            updateInput,
            getAwareBorderColor,
            setCursor,
            unsetCursor
        };
    }
}
</script>