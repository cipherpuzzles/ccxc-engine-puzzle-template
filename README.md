# CCXC引擎谜题模板

这是一个用于创建CCXC引擎谜题的项目模板。使用这个模板，你可以使用现代前端工具开发谜题组件，然后将它们编译成可以在CCXC引擎中使用的单文件JS组件。

## 功能特性

- 支持Vue 3单文件组件开发
- 将.vue文件编译为独立的谜题文件
- 便于引入第三方库

## 使用方法

你可以直接 Clone 本项目进行开发，但是我们建议你复制一份作为你的模板。

```bash
npx degit cipherpuzzles/ccxc-engine-puzzle-template your-project-name
cd your-project-name
npm install
```

### 开发谜题

运行 dev-server 开发服务器

```bash
npm run dev
```

1. 在`src/puzzles`目录中创建新的`.vue`文件
2. 每个`.vue`文件代表一个独立的谜题组件
3. 使用Vue 3语法编写组件

你可以在打开的开发预览页面中实时预览谜题组件的渲染效果，但是请注意：预览的渲染环境和实际渲染器环境不完全一致。

对于Vue语法，仅能使用**只有setup函数的options语法**，例子如下：

```vue
<script>
import { ref } from 'vue';

export default {
  setup() {
    // ...所有的逻辑写在这里...
    const everything = ref(0);

    return {
      everything // 把页面上用到的所有东西都return出去
    }
  }
}

</script>
```

你可以在开发时使用第三方库，但是要使用 `npm install {库名称} --save` 安装。

在构建时，所有用到的第三方库均会打包到一个文件中。

### 构建谜题

```bash
npm run build
```

这将会把`src/puzzles`目录中的每个`.vue`文件编译成一个独立的文件，输出到`dist/puzzles`目录。

例如 `src/puzzles/ExamplePuzzle.vue` 编译后会出现在 `dist/puzzles/ExamplePuzzles.vue` 中。但是导入的所有内部和外部库都已经打包到单一文件中。

接下来，你需要将 `<template>` 和 `<style>` 两个部分复制到后台管理的“题目HTML”中，将 `<script>` 部分（注意不含`<script>`标签本身）复制到“题目代码”中。
