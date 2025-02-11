<template>
    <div class="container">
        <div class="content">
            <div class="announce">*此為公會網站密碼，請勿使用常用的密碼設置。</div>
            <div class="announce">*如忘記密碼可找「米路露」尋回。</div>
            <div class="announce">*僅提供觀看、成員請假與成員試煉數值輸入。</div>

            <div class="error">
                <p v-if="errorMessage">{{ errorMessage }}</p>
            </div>
            <input type="number" v-model="formData.id" hidden />
            <div><label>遊戲名稱</label><input type="text" v-model="formData.username" /></div>
            <div><label>網站密碼</label><input type="password" v-model="formData.password" /></div>
            <div><label>LineID</label><input type="text" v-model="formData.lineID" />
            </div>
            <div><label>Line名稱</label><input type="text" v-model="formData.lineName" /></div>
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
import { useUser, fetchAllUsers, WatcherUser } from '~/store/st_user.js';
const user = useUser();

const formData = ref({ type: 'update', id: user?.id });
const errorMessage = ref('');

WatcherUser((newUser) => {
    if (newUser) {
        formData.value = {
            type: 'update',
            id: newUser.id,
            username: newUser.username,
            lineID: newUser.lineID,
            lineName: newUser.lineName,
        };
    }
})

// 輸入請假
const send = async () => {

    if (!formData.value.password && !formData.value.lineID && !formData.value.lineName) {
        errorMessage.value = '未輸入任何資料更改';
        return
    }

    try {
        const response = await axios.post('/api/user', formData.value);
        if (response.data.success) {
            fetchAllUsers()
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
            errorMessage.value = response.data.message || '更新失敗';
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
    gap: 6px;
    position: relative;

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