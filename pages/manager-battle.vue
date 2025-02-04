<template>
    <div>
        <ManagerNavbar :current-active="currentActive" @update:currentActive="updateCurrentActive" />
        <div class="container">
            <div class="ill">
                <span>1.請先選新增名單(選擇好日期按「新增名單」，會加入此次所有成員。)</span>
                <span>2.選擇好日期按「勾選出席者」，會出現此日期內的所有會員名單</span>
                <span>3.若有勾選錯誤再點取消按鈕</span>
            </div>
            <div class="btn-group">
                <input v-model="newDataDate.date" type="date" />
                <button class="edit-btn" @click="newData">新增名單</button>
                <button class="edit-btn" @click="getData">勾選出席者</button>
                <button class="edit-btn" @click="noData">取消</button>
            </div>

            <div v-if="changebtn === 'now' || changebtn === 'no' && newDataDate.date" class="content">
                <div>
                    <div>名稱 </div>
                    <div>是否出席</div>
                </div>
                <div v-for="user in getdata" :key="user.id">
                    <div>{{ getUserById(user.uid)?.username }}</div>
                    <input type="checkbox" :value="user.uid" v-model="ids" />
                </div>
                <button v-if="changebtn === 'now'" class="btn" @click="chosenData">送出</button>
                <button v-else-if="changebtn === 'no'" class="btn" @click="chosenDeleteData">送出</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import ManagerNavbar from '~/components/ManagerNavbar.vue';
import axios from "axios";

import { useToast } from 'vue-toastification';
const toast = useToast();

const users = useState("users")

const currentActive = ref("check"); // 接收子層組件
const updateCurrentActive = (newValue) => {
    currentActive.value = newValue;
};

// 新增清單
const newDataDate = ref({ date: '' });
const newData = async () => {
    const selectedDate = new Date(newDataDate.value.date);
    if (selectedDate.getDay() == 6) {
        try {
            const response = await axios.post('/api/battlefield', { ...newDataDate.value, type: 'addin' });
            if (response.data.success) {
                toast.success(response.data.message);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error, "執行錯誤，請前往修改代碼");
        }
    } else {
        toast.error('請選擇禮拜六的時間')
    }
};
// 切換成選擇按鈕
const changebtn = ref("none");
// 讀取這天的出席者
const getdata = ref([])
const getData = async () => {
    changebtn.value = 'now';
    ids.value = []
    try {
        const response = await axios.post('/api/battlefield', { ...newDataDate.value, type: 'get' });
        if (response.data.success) {
            getdata.value = response.data.users;
            toast.success(response.data.message);
        } else {
            toast.error(response.data.message);
        }
    } catch (error) {
        console.log(error, "執行錯誤，請前往修改代碼");
    }
}
// 取得勾錯的人
const noData = async () => {
    changebtn.value = 'no';
    ids.value = []
    try {
        const response = await axios.post('/api/battlefield', { ...newDataDate.value, type: 'get' });
        if (response.data.success) {
            getdata.value = response.data.users;
            toast.success(response.data.message);
        } else {
            toast.error(response.data.message);
        }
    } catch (error) {
        console.log(error, "執行錯誤，請前往修改代碼");
    }
}
// 勾選出席者
const ids = ref([])
const chosenData = async () => {
    try {
        const response = await axios.post('/api/battlefield', { ...newDataDate.value, type: 'chosen', ids: ids.value });
        if (response.data.success) {
            toast.success(response.data.message);
        } else {
            toast.error(response.data.message);
        }
    } catch (error) {
        console.log(error, "執行錯誤，請前往修改代碼");
    }
}
const chosenDeleteData = async () => {
    try {
        const response = await axios.post('/api/battlefield', { ...newDataDate.value, type: 'delete', ids: ids.value });
        if (response.data.success) {
            toast.success(response.data.message);
        } else {
            toast.error(response.data.message);
        }
    } catch (error) {
        console.log(error, "執行錯誤，請前往修改代碼");
    }
}


// 取得名稱
const getUserById = (uid) => {
    return users.value.find(user => user.id === uid);
};

// 每次點擊日期清空項目
watch(() => newDataDate.value.date, () => {
    changebtn.value = 'none';
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

        >div {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            text-align: center;

            input {
                height: 40px;
            }

            div {
                display: flex;
                align-items: center;
                justify-content: center;
            }
        }

        &:last-child {
            border: 1px solid black;
            padding: 16px;
        }

        >button {
            margin-top: 2rem;
        }

    }
}

.search-date {
    width: 80%;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;

    input {
        width: 500px;
        height: 36px;
        padding: 24px;
        border-radius: 12px;
    }

}

.edit-btn {
    border: 1px solid black;
    padding: 4px 8px;

    &:active {
        transform: translateY(2px);
    }
}

.dateAdd {
    display: flex;
    gap: 12px;

    button:last-child {
        font-size: 10px;
        border: 1px solid black;
        padding: 4px 12px;
    }
}

.ill {
    display: flex;
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
    border: 1px dashed black;
    padding: 16px 32px;
    margin-bottom: 16px;

    i {
        color: rgb(34, 45, 150);
        font-size: 12px;
    }
}

.btn-group {
    display: flex;
    gap: 12px;
}

@media screen and (max-width: 768px) {
    .ill {
        margin-inline: 16px;
    }
}
</style>