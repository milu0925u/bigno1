<template>
    <div v-if="isClient">
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
            <div class="editer-content">
                <div class="title-group">
                    <span>標題：</span>
                    <input type="text" v-model="title" />
                    <button class="btn" @click="sendEditor">送出</button>
                </div>
                <ClientOnly>
                    <Editer ref="quillRef" :isViewing="isViewing" />
                </ClientOnly>
            </div>
            <div v-if="sendLoading" class="send-loading">
                <Loading2 />
            </div>
        </div>
    </div>

</template>

<script setup>
import ManagerNavbar from '~/components/ManagerNavbar.vue';
import axios from "axios";
import Editer from '~/components/Editer.vue';
import Loading2 from '~/components/Loading2.vue';

const { $swal } = useNuxtApp();
const sendLoading = ref(false);
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

const Reorganization = async (json) => {
    const imageUrlAndIndex = [];  // 用來儲存圖片的位置
    const newOps = [];        // 儲存修改後的 ops
    let imageCount = 1;

    for (let i = 0; i < json.ops.length; i++) {
        const op = json.ops[i];
        if (op.insert && op.insert.image) {
            const base64Image = op.insert.image;
            imageUrlAndIndex.push({ index: `img${imageCount}`, url: base64Image });
            newOps.push({ insert: { image: `img${imageCount}` } });
            imageCount++;
        } else { newOps.push(op) }
    }

    return { image: imageUrlAndIndex, ops: newOps }
}

// 傳送編輯器內文
const sendEditor = async () => {
    if (!title.value) {
        $swal.fire({
            title: "請輸入標題",
            icon: "error",
            timer: 1500,
            showConfirmButton: false
        });
        return
    }
    sendLoading.value = true;
    const jsonContent = quillRef.value.getEditorContent(); // JSON 內容
    const { image, ops } = await Reorganization(jsonContent)

    try {
        const boardApiRequest = await axios.post("/api/board", { type: 'addboard', uid: user.value.id, title: title.value, jsondata: ops });
        const imageApiRequests = image && image.length > 0 ? image.map((v) => axios.post("/api/board", { type: 'addboardimg', jsondata: v })) : [];
        const [response, ...imageResponses] = await Promise.all([boardApiRequest, ...imageApiRequests]);
        if (response.data.success) {
            $swal.fire({
                title: response.data.message,
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });
            sendLoading.value = false;
            title.value = ""
            quillRef.value?.clearEditor();
        } else {
            $swal.fire({
                title: "發布失敗",
                icon: "error",
                timer: 1500,
                showConfirmButton: false
            });
        }
    } catch (error) {
        $swal.fire({
            title: response.data.message,
            icon: "error",
            timer: 1500,
            showConfirmButton: false
        });
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
        $swal.fire({
            title: response.data.message,
            icon: "error",
            timer: 1500,
            showConfirmButton: false
        });
    }
}
// 開啟/隱藏公告
const getboardstate = async (bid, state) => {
    try {
        const response = await axios.patch('/api/board', { type: 'statechange', bid: bid, state: state })
        if (response.data.success) {
            $swal.fire({
                title: response.data.message,
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });
            fetchboard();
        }
    } catch (error) {
        $swal.fire({
            title: response.data.message,
            icon: "error",
            timer: 1500,
            showConfirmButton: false
        });
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

const isClient = ref(false);
onMounted(() => {
    fetchboard();
    isClient.value = true; // 客戶端渲染後顯示內容
});

watch(currentActive, (newValue) => {
    if (newValue == 'allboard') {
        fetchboard();
    }
});

definePageMeta({
    middleware: ['manager'],
});
</script>

<style lang="scss" scoped>
.container {
    width: 75%;
    margin-inline: auto;
    position: relative;
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

.editer-content {
    margin-bottom: 3rem;
}

.send-loading {
    position: absolute;
    z-index: 1;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    justify-content: center;
    align-items: center;
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