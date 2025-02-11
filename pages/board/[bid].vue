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
                    <div class="content-message" v-for="m in allmessage">
                        <b>{{ m && getUserById(m.uid).username }}</b>
                        <p>{{ m && m.content }}</p>
                        <div class="createdate">{{ m && m.createdate }}</div>
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
        </div>
    </div>
</template>

<script setup>
import axios from "axios";
import Editer from '~/components/Editer.vue';
import Loading from "~/components/Loading.vue"
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
    console.log(bid, '公佈欄編號');
    try {
        const response = await axios.get(`/api/board/${bid}`);
        if (response.data.success) {
            title.value = response.data.data.title;
            defaultContent.value = response.data.data.content;
            loading.value = false;
        }
    } catch (error) {
        console.log(error, "抓取所有成員試煉排行失敗，請重新抓取！");
        if (error.response && error.response.status === 503) {
            console.log(`正在重試... 剩餘次數: ${retries}`);
            if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, delay)); // 延遲一段時間
                return fetchData(retries - 1, delay); // 重新調用函數，減少重試次數
            } else {
                console.log("重試次數已達上限，請稍後再試！");
            }
        }
    }
}
const fetchReplyData = async () => {
    try {
        const response = await axios.get(`/api/boardreply/${bid}`);
        if (response.data.success) {
            allmessage.value = response.data.data
        }
    } catch (error) {
        console.log(error, "抓取所有成員試煉排行失敗，請重新抓取！");
        if (error.response && error.response.status === 503) {
            console.log(`正在重試... 剩餘次數: ${retries}`);
            if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, delay)); // 延遲一段時間
                return fetchReplyData(retries - 1, delay); // 重新調用函數，減少重試次數
            } else {
                console.log("重試次數已達上限，請稍後再試！");
            }
        }
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

const packedData = ref(null);
if (process.client) {
    import('msgpack-lite').then((msgpack) => {
        // 這裡使用 msgpack 進行編碼或解碼
        packedData.value = msgpack.encode(deltaContent.value.getEditorContent());
    });
};

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
    // const jsonContent = deltaContent.value.getEditorContent(); // JSON 內容
    // const packedData = msgpack.encode(jsonContent);

    try {
        const response = await axios.post("/api/board", { type: 'updateboard', uid: user.value.id, title: title.value, jsondata: packedData });
        if (response.data.success) {
            $swal.fire({
                title: response.data.message,
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });
            closeEdit();
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
    return users.value.find(user => user.id === uid);
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
    padding: 24px;
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

        .text-btn {
            margin-top: auto;
        }
    }

    .content-reply {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding-left: 16px;

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
            min-height: 300px;
            max-width: calc(100vh - 150px);
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
    display: flex;
    flex-direction: column;
    opacity: 0;
    animation: fade-in 0.5s forwards;

    div {
        margin-left: auto;
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