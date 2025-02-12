<template>
    <div class="container">
        <div class="content">
            <div class="error">
                <p v-if="errorMessage">{{ errorMessage }}</p>
            </div>
            <div><label>遊戲名稱</label><input type="text" v-model="formData.username" placeholder="your game ID"
                    required />
            </div>
            <div><label>網站密碼</label><input type="password" v-model="formData.password" placeholder="Password"
                    required />
            </div>

            <div class="btn-group">
                <button class="btn" @click="login">登入</button>
                <button class="btn" @click="goToHome">返回</button>
            </div>
        </div>
    </div>
</template>

<script setup>

const { $swal } = useNuxtApp();

import axios from 'axios';
const user = useState("user");

const formData = ref({ type: 'login', username: '', password: '' });
const errorMessage = ref('');

// 登入
const login = async () => {
    try {
        const response = await axios.post('/api/user', formData.value, { withCredentials: true })

        if (response.data.success) {
            user.value = response.data.user;
            errorMessage.value = '';
            $swal.fire({
                title: response.data.message,
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });
            navigateTo('/');

        } else {
            $swal.fire({
                title: response.data.message,
                icon: "error",
                timer: 1500,
                showConfirmButton: false
            });
            errorMessage.value = response.data.message || '登入失敗';
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
        align-items: center;
        gap: 12px;

        input {
            padding: 6px 8px;
        }

        label {
            width: 100px;
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