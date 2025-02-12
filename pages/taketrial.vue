<template>
    <div class="container">
        <div class="content">
            <div class="announce">*我們是休閒公會但希望大家都是很團結活躍的</div>
            <div class="announce">*自行輸入讓資料更精確，感謝各位成員配合，</div>
            <div class="announce">*未輸入者於每日清晨五/七點會匯入昨日資訊。</div>
            <div class="announce">*僅供會員輸日當日打完的數值資訊。</div>
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
            <div><label>數值</label><input type="number" v-model="formData.value" />

                <input type="radio" name="radiogroup" v-model="formData.radio" value="K" />K
                <input type="radio" name="radiogroup" v-model="formData.radio" value="M" />M
            </div>

            <div class=" btn-group">
                <button class="btn" @click="send">送出</button>
                <button class="btn" @click="goToHome">返回</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import axios from 'axios';
import { fetchAllUsers, WatcherUser } from '~/store/st_user.js';
const { $swal } = useNuxtApp();
const user = useState("user");
const formData = ref({ id: user?.id, value: 0 });

WatcherUser((newUser) => {
    if (newUser) {
        formData.value = {
            id: newUser.id,
            type: 'add',
            date: new Date().toISOString().split("T")[0],
            value: newUser.value,
            radio: null,
        };
    }
})

// 輸入數值
const send = async () => {
    if (formData.value.radio === null) {
        $swal.fire({
            title: '請選擇數值單位',
            icon: "success",
            timer: 1500,
            showConfirmButton: false
        });
        return
    }
    if (!formData.value.value) {
        $swal.fire({
            title: '請輸入數值',
            icon: "success",
            timer: 1500,
            showConfirmButton: false
        });
        return
    }
    try {
        const response = await axios.post('/api/trial', formData.value);
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

    position: relative;
    gap: 6px;

    >div {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 12px;

        input[type='number'] {
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