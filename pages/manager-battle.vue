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
                <button class="edit-btn" @click="newData"><span>新增名單</span> <i
                        class="fa-solid fa-user-plus"></i></button>
                <button class="edit-btn" @click="getData"><span>勾選出席者</span><i
                        class="fa-solid fa-user-check"></i></button>
                <button class="edit-btn" @click="noData"><span>取消</span><i class="fa-solid fa-user-minus"></i></button>
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
import { toast } from '~/store/st_user';

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

    if (newDataDate.value.date === "") {
        toast.error("沒有選擇日期");
        return
    }

    changebtn.value = 'now';
    ids.value = []
    try {
        const response = await axios.post('/api/battlefield', { ...newDataDate.value, type: 'get' });
        if (response.data.success) {
            if (response.data.users.length > 0) {
                getdata.value = response.data.users;
                toast.success(response.data.message);
                return
            }
            changebtn.value = 'none';
            toast.error("您未新增此日期的人");
        } else {
            toast.error(response.data.message);
        }
    } catch (error) {
        console.log(error, "執行錯誤，請前往修改代碼");
    }
};
// 取得勾錯的人
const noData = async () => {

    if (newDataDate.value.date === "") {
        toast.error("沒有選擇日期");
        return
    }

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
    if (!newDataDate.value || !ids.value) {
        toast.error("沒有選擇日期&人");
        return
    }

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

    i {
        display: none;
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


.btn-group {
    display: flex;
    gap: 12px;
}

@media screen and (max-width: 768px) {

    .btn-group {
        gap: 6px;
    }

    .edit-btn {
        padding: 5px;

        span {
            display: none;
        }

        i {
            display: grid;
        }
    }
}
</style>