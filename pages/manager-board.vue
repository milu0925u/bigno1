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
            <div class="grid-content" v-for="t in alltitle" :key="t.bid">
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

            <div>
                <div class="title-group">
                    <span>標題：</span>
                    <input type="text" v-model="title" />
                    <button class="btn" @click="clearEditor">清除內容</button>
                    <button class="btn" @click="sendEditor">送出</button>
                </div>
                <Editer ref="quillRef" :isViewing="isViewing" />
            </div>
        </div>
    </div>

</template>

<script setup>
import ManagerNavbar from '~/components/ManagerNavbar.vue';
import axios from "axios";
import Editer from '~/components/EEditer.vue';
import { useToast } from 'vue-toastification';
const toast = useToast();
const user = useState("user");
const users = useState("users")
const currentActive = ref("allboard"); // 接收子層組件
const updateCurrentActive = (newValue) => {
    currentActive.value = newValue;
};
const title = ref('');
const alltitle = ref(null);
const isViewing = ref(false); // 編輯狀態

const quillRef = ref(null); // 取得編輯器內文
const clearEditor = () => {
    quillRef.value?.clearEditor();
};

// 傳送編輯器內文
const sendEditor = async () => {
    if (!title.value) {
        toast.error("請輸入標題")
        return
    }
    const jsonContent = quillRef.value.getEditorContent(); // JSON 內容
    try {
        const response = await axios.post("/api/board", { type: 'addboard', uid: user.value.id, title: title.value, jsondata: jsonContent });
        if (response.data.success) {
            toast.success(response.data.message)
            title.value = ""
            clearEditor();
        }
    } catch (error) {
        toast.error(response.data.message)
    };
}
// 抓取公告
const fetchboard = async () => {
    try {
        const response = await axios.get('/api/board')
        if (response.data.success) {
            alltitle.value = response.data.data
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
    if (newValue == 'allboard') {
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