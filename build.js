import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { parse } from '@vue/compiler-sfc';
import { build } from 'vite';
import vue from '@vitejs/plugin-vue';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const puzzlesDir = path.resolve(__dirname, 'src/puzzles');
const outputDir = path.resolve(__dirname, 'dist/puzzles');

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// 获取所有谜题文件
const puzzleFiles = fs.readdirSync(puzzlesDir)
    .filter(file => file.endsWith('.vue'));

// 处理单个Vue文件
async function processPuzzle(file) {
    const name = file.replace('.vue', '');
    const filePath = path.join(puzzlesDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // 解析Vue文件
    const { descriptor } = parse(content);
    
    // 提取template, script和style
    const template = descriptor.template ? descriptor.template.content : '';
    const script = descriptor.script ? descriptor.script.content : '';
    const style = descriptor.styles.length > 0 ? descriptor.styles[0].content : '';
    
    // 创建临时JS文件用于编译
    const tempJsPath = path.join(puzzlesDir, `${name}.temp.js`);
    
    // 写入临时JS文件
    fs.writeFileSync(tempJsPath, script);
    
    try {
        // 使用Vite编译JS
        await build({
            configFile: false,
            plugins: [vue()],
            define: {
                'process.env.NODE_ENV': JSON.stringify('production'),
                'process.env': '{}'
            },
            build: {
                write: true,
                emptyOutDir: false,
                lib: {
                    entry: tempJsPath,
                    name: `__vue_puzzle_component__`,
                    formats: ['iife'],
                    fileName: () => `${name}.js`,
                },
                rollupOptions: {
                    external: ['vue'],
                    output: {
                        globals: {
                            vue: 'Vue'
                        }
                    }
                },
                outDir: outputDir,
                minify: 'terser',
            },
        });
        
        // 读取编译后的JS
        const compiledJsPath = path.join(outputDir, `${name}.js`);
        let compiledJs = '';
        
        if (fs.existsSync(compiledJsPath)) {
            compiledJs = fs.readFileSync(compiledJsPath, 'utf-8');
            
            // 删除编译后的独立JS文件，因为我们要将其内嵌到HTML中
            fs.unlinkSync(compiledJsPath);
        }
        
        // 创建最终的HTML文件
        const htmlContent = `
<!-- ${name} Puzzle -->
<template>
${template}
</template>

<style>
${style}
</style>

<!-- 请将以上部分复制到后台“题目HTML”中，以下部分复制到后台“题目脚本”中，不要包含<script>标签 -->

<script>
${compiledJs}

export default __vue_puzzle_component__;
</script>
`;
        
        const outputHtmlPath = path.join(outputDir, `${name}.vue`);
        fs.writeFileSync(outputHtmlPath, htmlContent);
        
        console.log(`构建 ${name} 成功！输出到: ${outputHtmlPath}`);
    } catch (error) {
        console.error(`构建 ${name} 失败:`, error);
    } finally {
        // 清理临时文件
        if (fs.existsSync(tempJsPath)) {
            fs.unlinkSync(tempJsPath);
        }
    }
}

// 处理所有谜题
async function buildPuzzles() {
    console.log(`开始构建 ${puzzleFiles.length} 个谜题文件...`);
    
    // 确保输出目录干净
    fs.readdirSync(outputDir)
        .forEach(file => {
            fs.unlinkSync(path.join(outputDir, file));
        });
    
    for (const file of puzzleFiles) {
        console.log(`处理 ${file}...`);
        await processPuzzle(file);
    }
    
    console.log('所有谜题构建完成！');
}

buildPuzzles().catch(err => {
    console.error('构建过程中发生错误:', err);
    process.exit(1);
}); 