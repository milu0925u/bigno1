<template>
    <div>
        <ManagerNavbar :current-active="currentActive" @update:currentActive="updateCurrentActive" />
        <div class="container" v-if="currentActive === 'allboard'">
            <div class="grid-content title-color">
                <div class="grid-content-center">標題</div>
                <div>創建日期</div>
                <div>作者</div>
                <div>狀態</div>
                <div>操作</div>
            </div>
            <div class="grid-content" v-for="t in title" :key="t.bid">
                <div class="content-title">{{ t.title }}</div>
                <div>{{ t.createdate }}</div>
                <div>{{ getUserById(t.uid)?.username }}</div>
                <div v-if="t.hiddendate" @click="getboardstate(t.bid, false)">
                    <i class="fa-solid fa-lock"></i>

                </div>
                <div v-else @click="getboardstate(t.bid, true)">
                    <i class="fa-solid fa-lock-open"></i>
                </div>
                <div> <button @click="goToBoardDetail(t.bid)">查看</button></div>
            </div>
        </div>

        <div class="container" v-else-if="currentActive === 'addboard'">
            <editer />
        </div>
    </div>

</template>

<script setup>
import ManagerNavbar from '~/components/ManagerNavbar.vue';
import axios from "axios";
import editer from '~/components/editer.vue';
import { useToast } from 'vue-toastification';
const toast = useToast();
const users = useState("users")
const currentActive = ref("allboard"); // 接收子層組件
const updateCurrentActive = (newValue) => {
    currentActive.value = newValue;
};

const title = ref(null);

// 抓取公告
const fetchboard = async () => {
    try {
        const response = await axios.get('/api/board')
        if (response.data.success) {
            title.value = response.data.data
        }
    } catch (error) {
        toast.error(response.data.message);
    }
}
// 開啟/隱藏公告
const getboardstate = async (bid, state) => {
    try {
        const response = await axios.post('/api/board', { type: 'statechange', bid: bid, state: state })
        if (response.data.success) {
            toast.success(response.data.message);
            fetchboard();
        }
    } catch (error) {
        toast.error(response.data.message);
    }
}
// 前往內文
const goToBoardDetail = (bid) => {
    navigateTo(`/board/${bid}`);
};
// 取得名稱
const getUserById = (uid) => {
    return users.value.find(user => user.id === uid);
};


onMounted(() => {
    fetchboard();
});

watch(currentActive, (newValue) => {
    if (newValue === 'allboard') {
        fetchboard();
    }
});
</script>

<style lang="scss" scoped>
.container {
    width: 75%;
    margin-inline: auto;
}

.grid-content {
    display: grid;
    grid-template-columns: auto 100px 100px 100px 100px;
    align-items: center;
    gap: 4px;
    padding: 2px 6px;

    >div {
        width: 100%;
        height: 100%;
        padding: 8px;
        border: 1px solid black;
        overflow: hidden;
    }

    >*:nth-child(n+2) {
        text-align: center;
        justify-self: center;
    }

    .grid-content-center {
        text-align: center;
    }
}

.title-color {
    >div {
        background: rgba(20, 17, 17, 0.788);
        color: white;
    }
}

@media screen and (max-width: 768px) {
    .container {
        width: 95%;
        margin-inline: auto;
    }

    .title-color {
        display: none;
    }

    .grid-content {
        grid-template-columns: repeat(4, 1fr);
        grid-template-areas:
            'title title title title'
            '. . . .';

        .content-title {
            grid-area: title;
            background: black;
            text-align: center;
            color: white;
        }

        >div {
            padding: 4px 2px;
        }
    }

}
</style>