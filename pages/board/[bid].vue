<template>
    <div>
        <div id="editor"></div>
        {{bid && bid}}



    </div>
</template>

<script setup>
import axios from "axios";
import { useToast } from 'vue-toastification';
import { useRoute } from 'vue-router';
import Quill from "quill";
import "quill/dist/quill.snow.css";
const route = useRoute();
const toast = useToast();
const users = useState("users");

const title = ref('');
const content = ref();
let quill;

const fetchData = async () => {
    const bid = route.params.bid;
        try {
            const response = await axios.get(`/api/board/${bid}`);
            if (response.data.success) {
                console.log(response.data.data,'資料格式')
                title.value = response.data.data.title;
                content.value = response.data.data.content;
                toast.success(response.data.message)
            }
        } catch (error) {
            toast.error(response.data.message)
        };
    }

onMounted(() => {
    fetchData();
    quill = new Quill(content.value, {theme: "snow",readOnly: true});
    quill.root.innerHTML = content.value;
});

// watch(content.value ,() => {
//     quill.setContents(content.value)
//     },
//     { immediate: true, deep: true }
// );

</script>

<style lang="scss" scoped>

@media screen and (max-width: 768px) {

}
</style>