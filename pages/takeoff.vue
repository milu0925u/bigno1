<template>
    <div class="container">
        <div class="content">
            <div class="announce">*我們是休閒公會但希望大家都是很團結活躍的</div>
            <div class="announce">*請假是為了讓資料好登記以及會長了解狀況</div>
            <div class="announce">*感謝各位成員配合。</div>
            <input type="number" v-model="formData.id" hidden />
            <div>
                <label>名稱</label>
                <div>{{ user.username }}</div>
            </div>
            <div><label>請假日期</label><input type="date" v-model="formData.date" /></div>
            <div><label>事由</label><input type="text" v-model="formData.reason" /></div>

            <div class="btn-group">
                <button class="btn" @click="send">送出</button>
                <button class="btn" @click="goToHome">返回</button>
            </div>
        </div>
    </div>

</template>

<script setup>

const { $swal } = useNuxtApp();

import axios from 'axios';
import { fetchAllUsers, WatcherUser } from '~/store/st_user.js';
const user = useState("user");
const formData = ref({ type: 'add', id: user?.id });

WatcherUser((newUser) => {
    if (newUser) {
        formData.value = {
            type: 'add',
            id: newUser.id,
            date: newUser.date,
            reason: newUser.reason,
        };
    }
})

// 輸入請假
const send = async () => {
    if (!formData.value.date) {
        $swal.fire({
            title: '請選擇請假日期',
            icon: "success",
            timer: 1500,
            showConfirmButton: false
        });
        return
    }

    if (!formData.value.reason) {
        $swal.fire({
            title: '請輸入請假事由',
            icon: "success",
            timer: 1500,
            showConfirmButton: false
        });
        return
    }

    try {
        const response = await axios.post('/api/dayoff', formData.value);
        if (response.data.success) {
            fetchAllUsers();
            $swal.fire({
                title: response.data.message,
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });
            goToHome();
        } else {
            $swal.fire({
                title: response.data.message,
                icon: "error",
                timer: 1500,
                showConfirmButton: false
            });
        }
    } catch (error) {
        $swal.fire({
            title: 'Please try again',
            icon: "error",
            timer: 1500,
            showConfirmButton: false
        });
    }
};
// 回首頁
const goToHome = () => {
    navigateTo('/')
};

definePageMeta({
    middleware: 'check-login'
});
</script>

<style lang="scss" scoped>
.container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
}

.content {
    background: white;
    padding: 20px;
    border-radius: 8px;
    max-width: 400px;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 6px;
    position: relative;

    >div {
        display: flex;
        align-items: center;
        gap: 12px;

        input {
            width: 100%;
            padding: 6px 8px;
        }

        label {
            width: 100px;
        }

        div {
            width: 100%;
        }
    }

    .announce {
        justify-content: flex-start;
        font-size: 12px;
    }
}

.btn-group {
    padding-top: 12px;


    button:last-child {
        box-shadow: inset -1px -1px 1px rgb(180, 178, 178), 2px 2px 1px rgb(207, 207, 207);
        color: black;
        background: rgb(207, 207, 207);

        &:active {
            border: 1px solid rgb(180, 178, 178);
            box-shadow: 0 0 0 1px rgb(207, 207, 207);
            transform: translateY(2px);
        }
    }
}


@media screen and (max-width: 768px) {
    .content {
        width: auto;
    }
}
</style>