<template>
    <!-- <ckeditor :editor="editor" v-model="editorData"></ckeditor> -->
</template>

<script setup>
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import CKEditor from "@ckeditor/ckeditor5-vue";

const editor = ClassicEditor;
const editorData = ref("<p>這是 CKEditor</p>");
</script>