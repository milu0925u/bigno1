<template>
    <div>
        <ManagerNavbar :current-active="currentActive" @update:currentActive="updateCurrentActive" />
        <div class="container">
            <div class="ill">
                <span>1.選擇日期輸入數據</span>
                <span>2.若重複輸入會覆蓋原本資料</span>
            </div>
            <input type="date" v-model="newdate" />
            <div class="content">
                <div class="title">
                    <h4>名稱</h4>
                    <h4>昨日值</h4>
                    <h4>新值</h4>
                    <h4></h4>
                </div>
                <div class="data" v-for="user in printUser" :key="user?.id">
                    <div>{{ user.username }}</div>
                    <div>{{ user.value }}</div>
                    <input v-model="user.newValue" type="number" />
                    <button class="send-btn" @click="send(user.id, user.newValue)">送出</button>
                </div>
            </div>
        </div>


    </div>
</template>

<script setup>
import ManagerNavbar from '~/components/ManagerNavbar.vue';
import axios from "axios";
import { useToast } from 'vue-toastification';
const toast = useToast();


import { WatcherUser, fetchAllUsers } from '~/store/st_user.js';


const currentActive = ref("trialUser"); // 接收子層組件
const updateCurrentActive = (newValue) => {
    currentActive.value = newValue;
};


const inputData = ref({}) // 正常管理員輸入
const newdate = ref(""); // 可選日期

const printUser = ref([]);


// 送出代寫數值 
const send = async (id, value) => {
    try {
        const response = await axios.post("/api/trial", { ...inputData.value, id: id, value: value, newdate: newdate.value });
        if (response.data.success) {
            fetchAllUsers()
            toast.success(response.data.message);
        }
    } catch (error) {
        console.error('保存失敗', error);
    };
}

// 抓取資料並過濾
const fetchData = async () => {
    try {
        const response = await axios.get('/api/trial');
        if (response.data.success) {
            printUser.value = response.data.users.sort((a, b) => a.ranking - b.ranking);
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
            type: 'add',
            date: new Date().toISOString().split("T")[0],
        };
    }
});
onMounted(() => {
    fetchData();
});

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


.hide-btn {
    margin-left: auto;
    opacity: 0;
    pointer-events: auto;
    width: 50px;
    height: 20px;
    background: transparent;
    border: none;
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