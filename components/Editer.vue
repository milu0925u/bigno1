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

onMounted(() => {
    quill = new Quill(editor.value, {  //會把 div 轉換成 Quill 編輯器
        debug: 'info',
        modules: {
            toolbar: props.isViewing ? false : options
        },
        bounds: editor.value, // 限制彈跳視窗範圍
        theme: "snow",
        formats: formats,
        readOnly: props.isViewing
    });
});
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
