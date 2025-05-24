import dayjs from "dayjs";


export function dateFormat(timestamp, format = "YYYY-MM-DD HH:mm:ss") {
    return dayjs(timestamp).format(format);
}


// 根据传入的 color，确定一种最佳的显示文本的颜色（黑色或白色）
export function adjustTextColor(color) {
    let r = parseInt(color.slice(1, 3), 16);
    let g = parseInt(color.slice(3, 5), 16);
    let b = parseInt(color.slice(5, 7), 16);

    let brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 110 ? "#000000" : "#ffffff";
}

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}