<template>
    <div class="create">
        <div><label>名稱：</label><input type="text" v-model="formData.pname" /></div>
        <div class="radio">
            <label>領獎人數：</label>
            <div>多人<input type="radio" name="awardee" v-model="formData.repeat" :value="true" />一人<input type="radio"
                    name="awardee" v-model="formData.repeat" :value="false" /></div>
        </div>
        <div v-if="formData.repeat">可獲得人數：<input type="number" v-model="formData.limit" /></div>
        <div><label>內容：</label><input type="text" v-model="formData.content" /></div>

        <button class="btn" @click="sendCreatePrize">送出</button>
    </div>
</template>

<script setup>
import axios from "axios";
const { $swal } = useNuxtApp();

const formData = ref({ pname: '', repeat: false, limit: 1, content: '' });
const clock = ref(false);
const sendCreatePrize = async () => {
    if (!formData.value.pname) {
        $swal.fire({
            title: '請輸入獎項名稱',
            icon: "warning",
            timer: 1500,
            showConfirmButton: false
        });
        return
    }
    if (formData.value.repeat && formData.value.limit <= 1) {
        $swal.fire({
            title: '請輸入大於1的人數',
            icon: "warning",
            timer: 1500,
            showConfirmButton: false
        });
        return
    }

    if (!formData.value.content) {
        $swal.fire({
            title: '請選擇內容',
            icon: "warning",
            timer: 1500,
            showConfirmButton: false
        });
        return
    }
    try {
        const response = await axios.post('/api/prizes', formData.value);
        if (response.data.success) {
            formData.value = { pname: '', repeat: false, limit: 1, content: '' }
            $swal.fire({
                title: response.data.message,
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });
        }
    } catch (error) {
        console.log(error, 'error');

        $swal.fire({
            title: 'Please try again',
            icon: "error",
            timer: 1500,
            showConfirmButton: false
        });
    }
};

</script>



<style lang="scss" scoped>
.create {
    >div {
        margin: 16px;
    }

    >div:not(.btn-group) {
        display: flex;
        align-items: center;
        gap: 6px;
        height: 36px;
    }

    label {
        width: 100px;
        text-align: right;
        display: inline-block;
    }

    input[type="text"],
    input[type="number"] {
        width: auto;
        padding: 6px 4px;
    }

    .radio {
        >div {
            width: 50%;
            display: flex;
            justify-content: space-between;
        }
    }

    input[type="radio"] {
        transform: scale(1.5);
    }
}

@media screen and (max-width: 768px) {
    .create {
        display: flex;
        flex-direction: column;
        width: 100%;

        label {
            white-space: nowrap;
        }

        input[type="text"],
        input[type="number"] {
            width: 90%;
        }

        .radio {
            >div {
                justify-content: space-around;
            }
        }
    }
}
</style>