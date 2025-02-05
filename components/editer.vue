<template>
    <div class="container">
        <!-- 只在 瀏覽器端 渲染 -->

        <div class="editor-container" ref="editor"></div>

        <div class="btn-group">
            <button class="btn" @click="clearEditor">清除內容</button>
            <button class="btn" @click="sendEditor">送出</button>
        </div>
    </div>
</template>

<script setup>
import Quill from "quill";
import "quill/dist/quill.snow.css";
import axios from "axios";
import { useToast } from 'vue-toastification';
const user = useState("user");
const toast = useToast();

const editor = ref(null);
const quillInstance = ref(null);
const toolbarOptions = [
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

const clearEditor = () => {
    if (quillInstance.value) {
        // 清除內容
        quillInstance.value.root.innerHTML = ''; // 直接清空內容
        quillInstance.value.setSelection(0, 0); // 移動光標到最開頭
        quillInstance.value.root.blur(); // 讓編輯器失去焦點，避免某些內部操作錯誤
    }
};
const sendEditor = async () => {
    if (quillInstance.value) {
        const jsonContent = quillInstance.value.getContents(); // JSON 內容
        try {
            const response = await axios.post("/api/board", { uid: user.value.id, jsondata: jsonContent });
            if (response.data.success) {
                toast.success(response.data.message)
            }
        } catch (error) {
            toast.error(response.data.message)
        };


    }
}

onMounted(() => {
    quillInstance.value = new Quill(editor.value, {
        debug: 'info',
        modules: {
            toolbar: toolbarOptions
        },
        bounds: editor.value,
        theme: "snow",
    });
});
</script>

<style lang="scss" scoped>
.container {
    margin-inline: auto;
    width: 75%;
}

.editor-container {
    height: 450px;
}

.btn-group {
    display: flex;
    justify-content: space-between;
    margin: 16px 32px;

    button {
        width: 150px;
    }
}
</style>
