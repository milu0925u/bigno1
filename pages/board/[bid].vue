<template>
    <div class="container">
        <div class="content">
            <div class="title">{{ title }}</div>
            <Editer ref="deltaContent" :isViewing="isViewing" />
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
</template>

<script setup>
import axios from "axios";
import Editer from '~/components/Editer.vue';
import { useToast } from 'vue-toastification'
import { useRoute } from 'vue-router';
const { $swal } = useNuxtApp();
const user = useState('user');
const users = useState('users');
const route = useRoute();
const toast = useToast();

const title = ref('');
const deltaContent = ref(null); //  存放 Delta 格式內容
const isViewing = ref(true); // 編輯狀態

const fetchData = async (bid) => {
    try {
        const response = await axios.get(`/api/board/${bid}`);
        if (response.data.success) {
            title.value = response.data.data.title;
            deltaContent.value?.setEditorContent(response.data.data.content)
        }
    } catch (error) {
        toast.error(response.data.message)
    };
}
const fetchReplyData = async (bid) => {
    try {
        const response = await axios.get(`/api/boardreply/${bid}`);
        if (response.data.success) {
            allmessage.value = response.data.data
        }
    } catch (error) {
        toast.error(error)
    };
}
// 回首頁
const goToHome = () => {
    navigateTo('/')
};

// 留言
const message = ref('');
const allmessage = ref([]);
const sendMessage = async () => {
    const bid = route.params.bid; // 文章編號
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
watch(() => [route.params.bid], async (newBid) => {
    if (newBid) {
        await fetchData(newBid)
        await fetchReplyData(newBid)
    };
}, { immediate: true });



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
            height: calc(100vh - 20px - 50px - 28px);
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