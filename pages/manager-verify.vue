<template>
    <div>
        <ManagerNavbar :current-active="currentActive" @update:currentActive="updateCurrentActive" />
        <div v-if="currentActive === 'verifyJoin'" class="container">
            <div class="title">
                <div>名稱</div>
                <div>職業</div>
                <div>加入時間</div>
                <div>狀態</div>
            </div>
            <div v-for="user in printUser" :key="user.id" class="content">
                <div>{{ user.username }}</div>
                <div>{{ user.job }}</div>
                <div>{{ user.createDate }}</div>
                <div>
                    <button class="btn" @click="updateVerify(user.id)">通過</button>
                </div>
            </div>
        </div>

        <div v-else class="container">
            <div class="title">
                <div>加入時間</div>
                <div>請假人</div>
                <div>請假理由</div>
                <div>審核</div>
            </div>
            <div v-for="user in dayoffUser" :key="user?.id" class="content">
                <div>{{ user?.date }}</div>
                <div>{{ user.uid ? getUsernameByUid(user.uid) : "" }}</div>
                <div>{{ user?.reason }}</div>
                <div>
                    <button class="btn" @click="updateVerify2(user?.id)">通過</button>
                </div>

            </div>
        </div>
    </div>
</template>

<script setup>
import ManagerNavbar from '~/components/ManagerNavbar.vue';
import axios from "axios";

import { useToast } from 'vue-toastification';
import { fetchAllUsers } from '~/store/st_user.js';
const toast = useToast();

const currentActive = ref("verifyJoin"); // 接收子層組件
const updateCurrentActive = (newValue) => {
    currentActive.value = newValue;
};

const user = useState("user")
const users = useState("users")
const printUser = ref([])

// // 監控目前位置
watch(currentActive, async (newVal) => {
    if (newVal === "verifyJoin") {
        printUser.value = users.value?.filter((user) => user.verify === false);
    } else if (newVal === "verifyDate") {
        dayoffUser.value = dayoffUser.value?.filter((v) => v.verify === false);
    }
}, { immediate: true }); // 使用 immediate: true 使初次加載時就會運行一次


// 審核 入會
const updateVerify = async (newSelected) => {
    try {
        const response = await axios.post('/api/user', { id: newSelected, type: 'verifyuser' });
        if (response.data.success) {
            fetchAllUsers()
            printUser.value = users.value?.filter((user) => user.verify === false);
            toast.success(response.data.message)
        } else {
            errorMessage.value = response.data.message || '審核失敗';
        }
    } catch (error) {
        errorMessage.value = 'Please try again';
    }
};
// 審核 請假
const updateVerify2 = async (newSelected) => {
    try {
        const response = await axios.post('/api/dayoff', { id: newSelected, type: "verify", reviewer_id: user.value.id });
        if (response.data.success) {
            fetchAllDayoff();
            toast.success(response.data.message)
        } else {
            errorMessage.value = response.data.message || '審核失敗';
        }
    } catch (error) {
        errorMessage.value = 'Please try again';
    }
};

// 取得請假人
const dayoffUser = ref([]);
const fetchAllDayoff = async () => {
    try {
        const response = await axios.get("/api/dayoff");
        if (response.data.success) {
            dayoffUser.value = response.data.dayoff.filter((v) => v.verify === false);
        } else {
            console.log(response.data.message);
        }
    } catch (error) {
        console.log(error, "錯誤");
    }
};
onMounted(() => {
    fetchAllDayoff();
});

// 找到請假者名稱
const getUsernameByUid = computed(() => {
    return (uid) => {
        const matchedUser = users.value.find((u) => u.id === uid);
        return matchedUser ? matchedUser.username : '未知';
    };
});

</script>

<style lang="scss" scoped>
.container {
    width: 80%;
    margin: auto;

    >div {
        display: flex;
        justify-content: space-between;
        align-items: center;
        text-align: center;

        >div {
            flex: 1;
            padding: 10px
        }
    }
}
</style>