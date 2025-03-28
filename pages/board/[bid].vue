<template>
    <div>
        <div class="container">
            <div class="content">
                <div v-if="loading" class="loading">
                    <Loading />
                </div>
                <div v-else>
                    <div class="title" v-if="!edit">
                        {{ title }}
                        <button v-if="user?.position === '管理員'" class="edit-button" @:click="openEdit">編輯</button>
                    </div>
                    <div class="title-group" v-else-if="edit">
                        <input type="text" v-model="title" />
                        <button class="btn" @click="sendEditor">送出</button>
                        <button class="btn" @click="closeEdit">返回</button>
                    </div>
                </div>
                <ClientOnly>
                    <Editer ref="deltaContent" :isViewing="isViewing" />
                </ClientOnly>
            </div>
            <div class="content-reply">
                <transition-group name="slide-up" tag="div" class="reply">
                    <div class="content-message" v-for="(m, index) in allmessage" :key="index">
                        <b>{{ m && getUserById(m.uid).username }}</b>
                        <p>{{ m && m.content }}</p>
                        <div class="createdate">{{ m && m.createdate }}</div>
                        <button v-if="user && user.id === m.uid" class="delete" @click="() => hiddenmessage(m.brid)"><i
                                class="fa-regular fa-rectangle-xmark"></i></button>
                    </div>
                </transition-group>
                <div class="text-btn">
                    <input type="text" v-model="message" />
                    <button class="btn" @click="sendMessage">傳送</button>
                </div>
            </div>
            <div class="btn-group">
                <button class="btn" @click="goToHome">返回</button>
            </div>
            <div v-if="sendLoading" class="send-loading">
                <Loading2 />
            </div>
        </div>
    </div>
</template>

<script setup>
import axios from "axios";
import Editer from '~/components/Editer.vue';
import Loading from "~/components/Loading.vue"
import Loading2 from "~/components/Loading2.vue"
import { useRoute } from 'vue-router';

const { $swal } = useNuxtApp();
const user = useState('user');
const users = useState('users');
const route = useRoute();
const loading = ref(true);
const bid = route.params.bid;
const title = ref('');
const deltaContent = ref(null); //  存放 Delta 格式內容
const isViewing = ref(true); // 編輯狀態

const defaultContent = ref();
const fetchData = async () => {
    try {
        const response = await axios.get(`/api/board/${bid}`);
        console.log(response, '123');

        if (response.data.success) {
            title.value = response.data.data.title;
            defaultContent.value = response.data.data.content;
            loading.value = false;
        }
    } catch (error) {
        console.log(error);
    }
}
const fetchReplyData = async () => {
    try {
        const response = await axios.get(`/api/boardreply/${bid}`);
        if (response.data.success) {
            const newdata = response.data.data.filter(v => !v.hiddendate)
            allmessage.value = newdata;
        }
    } catch (error) {
        console.log(error);

    }
}
// 回首頁
const goToHome = () => {
    navigateTo('/')
};

// 編輯文章
const edit = ref(false)
const openEdit = () => {
    isViewing.value = false;
    edit.value = true;
}

// 隱藏留言
const hiddenmessage = async (brid) => {
    try {
        const response = await axios.post(`/api/boardreply/${bid}`, { type: 'delete', uid: user.value.id, brid: brid });
        if (response.data.success) {
            allmessage.value = allmessage.value.filter(i => i.brid !== response.data.data.brid);
            $swal.fire({
                title: response.data.message,
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });
        }
    } catch (error) {
        $swal.fire({
            title: error.message,
            icon: "error",
            timer: 1500,
            showConfirmButton: false
        });
    };
}

const Reorganization = async (json) => {
    const imageUrlAndIndex = [];  // 用來儲存圖片的位置
    const newOps = [];        // 儲存修改後的 ops
    let imageCount = 1;

    for (let i = 0; i < json.ops.length; i++) {
        const op = json.ops[i];
        if (op.insert && op.insert.image) {
            const base64Image = op.insert.image;
            imageUrlAndIndex.push({ index: i, url: base64Image });
            newOps.push({ insert: { image: `img${imageCount}` } });
            imageCount++;
        } else { newOps.push(op) }
    }

    return { image: imageUrlAndIndex, ops: newOps }
}

// 傳送編輯器內文
const sendLoading = ref(false);
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
    const jsonContent = deltaContent.value.getEditorContent();
    const { image, ops } = await Reorganization(jsonContent)

    try {
        const boardApiRequest = await axios.post("/api/board", { type: 'updateboard', bid: bid, uid: user.value.id, title: title.value, jsondata: ops });
        const imageApiRequests = image && image.length > 0 ? image.map((v) => axios.post("/api/board", { type: 'updateboardimg', bid: bid, jsondata: v })) : [];
        const [response, ...imageResponses] = await Promise.all([boardApiRequest, ...imageApiRequests]);

        if (response.data.success) {
            $swal.fire({
                title: response.data.message,
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });
            closeEdit();
            sendLoading.value = false;
        }
    } catch (error) {
        $swal.fire({
            title: error.message,
            icon: "error",
            timer: 1500,
            showConfirmButton: false
        });
        sendLoading.value = false;
    };
}

// 回首頁
const closeEdit = () => {
    isViewing.value = true;
    edit.value = false;
};

// 留言
const message = ref('');
const allmessage = ref([]);
const sendMessage = async () => {
    // 假設未登入
    if (!user.value) {
        await $swal.fire({
            title: "您尚未登入，是否前往登入?",
            showCancelButton: true,
            confirmButtonText: "登入",
            cancelButtonText: "取消",
        }).then((result) => {
            if (result.isConfirmed) {
                navigateTo('/login')
            }
        });
        return
    }
    try {
        const response = await axios.post(`/api/boardreply/${bid}`, { type: 'add', uid: user.value.id, content: message.value });
        if (response.data.success) {
            allmessage.value = [response.data.data, ...allmessage.value];
            message.value = '';
        } else {
            $swal.fire({
                title: response.data.message,
                icon: "error",
                timer: 1500,
                showConfirmButton: false
            });
        }
    } catch (error) {
        console.log(error)

    };

}

// 取得名稱
const getUserById = (uid) => {
    return users?.value?.find(user => user.id === uid) || {};
};

// 監聽路由變更
watch(() => defaultContent.value, async () => {
    deltaContent.value?.setEditorContent(defaultContent.value)
});


onMounted(() => {
    fetchData()
    fetchReplyData()
});
</script>

<style lang="scss" scoped>
.container {
    // --background: rgba(161, 132, 119, 1);
    // --title: rgba(105, 82, 72, 1);
    // --text: rgba(253, 233, 224, 1);
    // --border: rgba(86, 38, 16, 1);
    --background: #DFFF9E;
    --title: rgb(15, 10, 8);
    --text: white;
    --border: rgb(15, 10, 8);
    margin-inline: auto;
    background: var(--background);
    display: flex;
    padding: 12px 5%;
    position: relative;

    .content {
        width: 75%;
        background: #FCFCFC;
        background: var(--text);

        >div {
            border-style: solid;
            border-color: var(--border);

            &:first-child {
                border-width: 2px 2px 0 2px;
            }

            &:last-child {
                border-width: 0 2px 2px 2px;

            }
        }
    }

    .content-reply {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding-left: 16px;
        height: calc(100vh - 25px - 16px);

        input[type="text"] {
            width: 100%;
            padding: 8px 8px;
            margin-block: 4px;
            border: 1px solid var(--border);

            &:focus {
                outline: var(--title);
            }
        }

        .reply {
            display: flex;
            flex-direction: column;
            gap: 6px;
            font-size: 12px;
            margin-top: 60px;
            overflow-y: auto;
            padding-right: 8px;
            animation: slide-up 0.3s forwards;
            transition: all 0.3s ease-in-out;

            &::-webkit-scrollbar {
                width: 2px;
                height: 8px;
                margin: 10px;
            }

            &::-webkit-scrollbar-thumb {
                background-color: var(--border);
                border-radius: 10px;
            }

            &::-webkit-scrollbar-thumb:hover {
                background-color: #555;
            }

            &::-webkit-scrollbar-track {
                background-color: #f1f1f1;
                border-radius: 10px;
            }

            >div {
                border: 1px solid var(--border);
                border-radius: 8px;
                width: 100%;
                padding: 12px 16px;
                background: #FCFCFC;
            }
        }

        .text-btn {
            margin-top: auto;
        }

    }

    .title {
        display: flex;
        justify-content: space-between;
        padding: 36px 12px;
        height: 50px;
        color: white;
        align-items: center;
        background: var(--title);
    }

    .btn-group {
        position: absolute;
        display: flex;
        gap: 16px;

        button {
            width: 80px;
            height: 25px;
        }

        top:24px;
        right:24px;
    }

    .title-group {
        display: flex;
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

    .delete {
        position: absolute;
        top: 8px;
        right: 16px;
    }
}


.edit-button {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    padding: 2px 4px;
    font-size: 12px;
    background: rgb(92, 88, 83);
}

.content-message {
    position: relative;
    display: flex;
    flex-direction: column;
    opacity: 0;
    animation: fade-in 0.5s forwards;

    div {
        margin-left: auto;
    }
}


@keyframes slide-up {
    from {
        transform: translateY(10px);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.message-fade-enter-active,
.message-fade-leave-active {
    transition: opacity 1s;
}

.message-fade-enter,
.message-fade-leave-to {
    opacity: 0;
}




@keyframes fade-in {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@media screen and (max-width: 768px) {
    .container {
        width: 100%;
        margin: 0;
        padding-top: 4rem;
        flex-direction: column;

        .content {
            width: 100%;
            margin-bottom: 16px;
        }

        .content-reply {
            padding: 0;

            .reply {
                padding: 0;
                height: auto;
            }
        }

        .btn-group {
            height: 50px;
            top: 16px;
            right: 26px;

            button {
                font-size: 12px;
                width: 50px;
                height: 24px;
            }
        }
    }
}
</style>