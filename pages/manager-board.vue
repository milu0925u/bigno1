<template>
    <div>
        <ManagerNavbar :current-active="currentActive" @update:currentActive="updateCurrentActive" />
        <div class="container" v-if="currentActive === 'allboard'">

        </div>

        <div class="container" v-else-if="currentActive === 'addboard'">
            <CKediter />
        </div>
    </div>

</template>

<script setup>
import ManagerNavbar from '~/components/ManagerNavbar.vue';
import axios from "axios";
import CKediter from '~/components/CKediter.vue';
import { useToast } from 'vue-toastification';
const toast = useToast();
const user = useState("user");

const currentActive = ref("allboard"); // 接收子層組件
const updateCurrentActive = (newValue) => {
    currentActive.value = newValue;
};

// 新增公告
const content = ref();
const addboard = async () => {
    try {
        const response = await axios.post('/api/board', { content })
    } catch (error) {

    }
}

</script>

<style lang="scss" scoped></style>