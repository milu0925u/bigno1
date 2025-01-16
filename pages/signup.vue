<template>
    <div class="container">
        <div class="content">
            <div class="error">
                <p v-if="errorMessage">{{ errorMessage }}</p>
            </div>
            <div><label>名稱</label><input type="text" v-model="formData.username" placeholder="your game ID" required />
            </div>
            <div><label>職業</label><select v-model="formData.job" placeholder="your game ID" required>
                    <option value="" disabled>選擇職業</option>
                    <option value="騎士">騎士</option>
                    <option value="法師">法師</option>
                    <option value="獵人">獵人</option>
                    <option value="鐵匠">鐵匠</option>
                    <option value="刺客">刺客</option>
                    <option value="服事">服事</option>
                </select></div>
            <div><label>lineName</label><input type="text" v-model="formData.lineName" placeholder="your Line name"
                    required />
            </div>
            <div><label>lineID</label><input type="text" v-model="formData.lineID" placeholder="your Line ID"
                    required /></div>

            <div><label>密碼</label><input type="password" v-model="formData.password" placeholder="Password" required />
            </div>

            <div class="btn-group">
                <button class="btn" @click="signup">註冊</button>
                <button class="btn" @click="goToHome">返回</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import Toast from 'vue-toastification';
const { useToast } = Toast;
const toast = useToast();

import axios from 'axios';

const formData = ref({
    type: 'signup', username: '', password: '', job: '選擇職業', lineName: '', lineID: ''
});
const errorMessage = ref('');

const signup = async () => {
    try {
        const response = await axios.post('/api/user', formData.value);
        if (response.data.success) {
            toast.success(response.data.message);
            navigateTo('/');
        } else {
            toast.error(response.data.message);
            errorMessage.value = response.data.message || '註冊失敗';
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

        label {
            width: 80px;
        }

        input,
        select {
            width: 80%;
            padding: 6px 8px;
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