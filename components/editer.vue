<template>
    <div>
        <div class="title-group">
            <span>標題：</span>
            <input type="text" v-model="title" />
            <button class="btn" @click="clearEditor">清除內容</button>
            <button class="btn" @click="sendEditor">送出</button>
        </div>
        <div class="editor-container" ref="editor" id="editor"></div>
    </div>

</template>

<script setup>
import Quill from "quill";
import "quill/dist/quill.snow.css";
import axios from "axios";
import { useToast } from 'vue-toastification';
const user = useState("user");
const toast = useToast();
const title = ref('');
const editor = ref(null);
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
let quill;
const clearEditor = () => {
    quill.deleteText(0, quill.getLength());
};
const sendEditor = async () => {
    if (!title.value) {
        toast.error("請輸入標題")
        return
    }
    const jsonContent = quill.getContents(); // JSON 內容
    try {
        const response = await axios.post("/api/board", { type: 'addboard', uid: user.value.id, title: title.value, jsondata: jsonContent });
        if (response.data.success) {
            toast.success(response.data.message)
            clearEditor();
        }
    } catch (error) {
        toast.error(response.data.message)
    };
}

onMounted(() => {
    quill = new Quill(editor.value, {
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
.editor-container {
    width: 100%;
    height: 400px;
    margin-bottom: 2rem;
}

.title-group {
    display: flex;
    justify-content: space-between;
    padding: 0px 12px;
    align-items: center;
    border-width: 1px 1px 0 1px;
    border-style: solid;
    border-color: rgb(209, 198, 198);

    span {
        white-space: nowrap;
    }

    input {
        border: none;
        outline: none;
        width: 60%;
        height: 30px;
        border: 1px solid black;
        padding-inline: 8px;

        &:focus {
            // border: none;
            outline: none;
        }
    }

    button {
        font-size: 12px;
        margin: 8px;
        width: 80px;
        height: 25px;
    }
}
</style>
