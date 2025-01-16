<template>
    <div class="container">
        <div class="content">
            <div class="error">
                <p v-if="errorMessage">{{ errorMessage }}</p>
            </div>

            <div>
                <label>日期</label>
                <div>{{ new Date().toISOString().split("T")[0] }}</div>
            </div>
            <div>
                <label>名稱</label>
                <div>{{ user.username }}</div>
            </div>
            <input type="date" v-model="formData.date" hidden />
            <input type="number" v-model="formData.id" hidden />
            <div><label>數值</label><input type="number" v-model="formData.value" />K</div>

            <div class="btn-group">
                <button class="btn" @click="send">送出</button>
                <button class="btn" @click="goToHome">返回</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useToast } from 'vue-toastification';
const toast = useToast();

import axios from 'axios';
import { useUser, fetchAllUsers, WatcherUser } from '~/store/st_user.js';
const user = useUser();

const formData = ref({ id: user?.id, value: 0 });
const errorMessage = ref('');

WatcherUser((newUser) => {
    if (newUser) {
        formData.value = {
            id: newUser.id,
            date: new Date().toISOString().split("T")[0],
            value: newUser.value,
        };
    }
})

// 輸入數值
const send = async () => {
    try {
        console.log('formData.value', formData.value);

        const response = await axios.post('/api/trial', formData.value);
        if (response.data.success) {
            fetchAllUsers()
            toast.success(response.data.message);
            goToHome();
        } else {
            toast.error(response.data.message);
            errorMessage.value = response.data.message || '輸入失敗';;
        }
    } catch (error) {
        errorMessage.value = 'Please try again';
    }
};
// 回首頁
const goToHome = () => {
    navigateTo('/')
};
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

    position: relative;
    gap: 6px;

    >div {
        display: flex;
        justify-content: center;
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

.error {
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;

    >p {
        text-align: center;
        width: 80%;
        background: red;
        padding: 3px;
    }
}

@media screen and (max-width: 768px) {
    .content {
        width: auto;
    }

    .error {
        height: auto;
    }
}
</style>