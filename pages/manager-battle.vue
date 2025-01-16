<template>
    <div>
        <ManagerNavbar :current-active="currentActive" @update:currentActive="updateCurrentActive" />
        <div class="container">
            <div v-if="changebtn" class="dateAdd">
                <button @click="endbtn"><i class="fa-solid fa-sun"></i></button>
                <input v-model="newDataDate.date" type="date" />
                <button @click="newData">新增名單</button>
            </div>
            <div v-else class="dateAdd">
                <button @click="startbtn"><i class="fa-regular fa-sun"></i></button>
                <input v-model="newDataDate.date" type="date" />
                <button @click="getData">勾選出席者</button>
            </div>

            <div v-if="!changebtn && newDataDate.date" class="content">
                <div>
                    <div>名稱 </div>
                    <div>是否出席</div>
                </div>
                <div v-for="user in getdata" :key="user.id">
                    <div>{{ getUserById(user.uid)?.username }}</div>
                    <input type="checkbox" :value="user.uid" v-model="ids" />
                </div>
                <button class="btn" @click="chosenData">送出</button>
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
            console.log(error);
            toast.error(`Please try again, ${error}`);
        }
    } else {
        toast.error('請選擇禮拜六的時間')
    }
};
// 切換成選擇按鈕
const changebtn = ref(false);
const startbtn = () => { changebtn.value = true }
const endbtn = () => { changebtn.value = false }
// 讀取這天的出席者
const getdata = ref([])
const getData = async () => {
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
        console.log(error);
        toast.error(`Please try again, ${error}`);
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
        console.log(error);
        toast.error(`Please try again, ${error}`);
    }
}


// 取得名稱
const getUserById = (uid) => {
    return users.value.find(user => user.id === uid);
};

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
</style>