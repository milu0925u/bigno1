<template>
    <div>
        <ManagerNavbar :current-active="currentActive" @update:currentActive="updateCurrentActive" />
        <div v-if="currentActive === 'trialUser'" class="container">
            <div class="border">僅新增今日內容</div>
            <div class="content">
                <div class="title">
                    <h4>名稱</h4>
                    <h4>目前值</h4>
                    <h4>新值</h4>
                    <h4></h4>
                </div>
                <div class="data" v-for="user in printUser" :key="user?.id">
                    <div>{{ user.username }}</div>
                    <div>{{ user.trialTotal }}</div>
                    <input v-model="user.newValue" type="number" />
                    <button class="send-btn" @click="send(user.id, user.newValue)">送出</button>
                </div>
            </div>
        </div>

        <div v-else-if="currentActive === 'notrialUser'" class="container">
            <div class="border">僅新增今日內容</div>
            <div class="content">
                <div class="title">
                    <h4>名稱</h4>
                    <h4>目前值</h4>
                    <h4>新值</h4>
                    <h4></h4>
                </div>
                <div class="data" v-for="user in printNoUser" :key="user?.id">
                    <div>{{ user.username }}</div>
                    <div>{{ user.trialTotal }}</div>
                    <input v-model="user.newValue" type="number" />
                    <button class="edit-btn" @click="send(user.id, user.newValue)">送出</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import ManagerNavbar from '~/components/ManagerNavbar.vue';
import axios from "axios";
import { useToast } from 'vue-toastification';
import { WatcherUser, fetchAllUsers } from '~/store/st_user.js';
const toast = useToast();
const user = useState("user")
const users = useState("users")

const currentActive = ref("trialUser"); // 接收子層組件
const updateCurrentActive = (newValue) => {
    currentActive.value = newValue;
};


const inputData = ref({})
// 送出代寫數值 
const send = async (id, value) => {
    try {
        const response = await axios.post("/api/trial", { ...inputData.value, id: id, value: value, });
        if (response.data.success) {
            fetchAllUsers()
            toast.success(response.data.message);
        }
    } catch (error) {
        console.error('保存失敗', error);
    };
}

// 抓取資料並過濾
const battle = ref([]);
const fetchData = async () => {
    try {
        const response = await axios.post('/api/trial', { type: 'get', date: new Date().toISOString().split("T")[0] });
        if (response.data.success) {
            battle.value = response.data.users;
        } else {
            toast.error(response.data.message);
        }
    } catch (error) {
        console.error('資料抓取錯誤', error);
    }
};

// 監聽
WatcherUser((newUser) => {
    if (newUser) {
        inputData.value = {
            mid: newUser.id,
            date: new Date().toISOString().split("T")[0],
        };
    }
});
const printUser = ref();
const printNoUser = ref();

watch(currentActive, async () => {
    await fetchData();
    if (currentActive.value === 'trialUser') {
        printUser.value = users.value.filter(user => user.leaveDate === null && user.verify === true);
    } else if (currentActive.value === 'notrialUser') {
        printNoUser.value = users.value.filter(user => user.leaveDate === null && user.verify === true && battle.value.every(b => b.id !== user.id));
    }
}, { immediate: true }); 
</script>



<style lang="scss" scoped>
.container {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .content {
        margin: 18px auto;
        white-space: nowrap;

        .title {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            text-align: center;
            text-decoration: underline;
        }

        .data {
            height: 50px;
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            text-align: center;

            div {
                display: flex;
                align-items: center;
                justify-content: center;
            }

            input {
                height: 30px;
                margin-block: auto;
            }

            button {
                margin-block: auto;
                height: 20px;
            }
        }
    }
}

.send-btn {
    border: 1px solid black;
    padding: 2px 4px;
    width: 45px;

    &:active {
        transform: translateY(2px);
    }
}

.border {
    border: 1px solid black;
    padding: 2px 4px;
}

@media screen and (max-width: 768px) {
    .container {

        .content {
            width: 100%;
            margin: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;


            .title {
                display: grid;
                grid-template-columns: 80px auto 80px 70px;
                gap: 0;
            }

            .data {
                display: grid;
                grid-template-columns: 80px auto 100px 50px;
                gap: 0;
                text-align: start;

                div {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                input {
                    width: 80px;
                    margin-left: 2px;
                }

                button {
                    width: 30px;
                }
            }
        }
    }
}
</style>