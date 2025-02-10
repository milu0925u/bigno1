<template>
    <div class="editor-container" ref="editor"></div>
</template>

<script setup>
import Quill from "quill";
import "quill/dist/quill.snow.css";

const editor = ref(null); // 用來初始化編輯器
const options = [
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    ['link', 'image', 'video', 'formula'],

    [{ 'header': 1 }, { 'header': 2 }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
    [{ 'script': 'sub' }, { 'script': 'super' }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],
    [{ 'direction': 'rtl' }],

    [{ 'size': ['small', false, 'large', 'huge'] }],
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

    [{ 'color': [] }, { 'background': [] }],
    [{ 'font': [] }],
    [{ 'align': [] }],
    ['clean']
];
const formats = [
    'bold', 'italic', 'underline', 'strike',
    'blockquote', 'code-block',
    'link', 'image', 'video', 'formula',
    'header', 'list', 'script', 'indent', 'direction',
    'size', 'color', 'background', 'font', 'align'
];

let quill;

// 取得 JSON 內容
const setEditorContent = (deltaData) => {
    return quill.setContents(deltaData);
};

// 取得 JSON 內容
const getEditorContent = () => {
    return quill.getContents();
};

// 清除編輯器內文
const clearEditor = () => {
    quill.deleteText(0, quill.getLength());
};
// 接收父層
const props = defineProps({
    isViewing: Boolean  // 接收父層傳遞的編輯模式
});
// 傳遞給父層
defineExpose({
    clearEditor,
    getEditorContent,
    setEditorContent
});

// 初始 Quill 編輯器設定
const initializeQuill = () => {
    quill = new Quill(editor.value, {
        debug: 'info',
        modules: {
            toolbar: options
        },
        bounds: editor.value,  // 限制編輯範圍
        theme: 'snow',
        formats: formats,
        readOnly: props.isViewing
    });
};

// 監聽 isViewing 的變化
watch(() => props.isViewing, () => {
    if (quill) {
        // 根據 isViewing 更新工具列顯示與否
        const toolbar = quill.getModule('toolbar');
        if (toolbar) {
            toolbar.container.style.display = props.isViewing ? 'none' : 'block';
        }

        // 根據 isViewing 更新編輯器的只讀狀態
        quill.enable(!props.isViewing);
    }
});

// 初始載入時設置 Quill 編輯器
onMounted(() => {
    initializeQuill();
    // 初始時設置工具列顯示狀態
    if (quill) {
        const toolbar = quill.getModule('toolbar');
        if (toolbar) {
            toolbar.container.style.display = props.isViewing ? 'none' : 'block';
        }
    }
});


// // 監聽 isViewing 的變化
// watch(() => props.isViewing, async () => {

//     initializeQuill();
// });


// // 初始載入時設置 Quill 編輯器
// onMounted(() => {
//     initializeQuill();
// });

</script>


<style lang="scss" scoped>
.editor-container {
    position: relative;
    top: 0;
    left: 0;
    width: 100%;
    height: calc(100vh - 20px - 50px - 28px);
    resize: none;
    padding: 10px;
    font-size: 16px;
}
</style>
