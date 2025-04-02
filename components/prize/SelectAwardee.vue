<template>
    <div class="select">
        <div class="wrapper">
            <!-- 抽獎選項 -->
            <select v-model="choosePrize" class="select-id">
                <option v-for="item in filteredPrizes" :key="item.pid" :value="item.pid">
                    {{ item.pname }}
                </option>
            </select>
            <!-- 全部/出席戰場 -->
            <CheckboxWrapper v-model="chooseAttend" />
        </div>
        <!-- 排除人 -->
        <div class="exclude-people">
            <label>需要排除的人</label>
            <select @change="handleChange" multiple>
                <option v-for="user in excludeLeaveUser" :key="user.id" :value="user.id">
                    {{ user.username }}
                </option>
            </select>
            <button class="btn" @click="sendFetchAwardee">確定</button>
        </div>
    </div>
</template>

<script setup>
import CheckboxWrapper from '~/components/prize/CheckboxWrapper.vue';
import axios from "axios";

const { $swal } = useNuxtApp();
const users = useState("users");
const allPrize = useState("getAllPrize");
const isSpinning = useState("isSpinning");
const excludePeople = ref([]);
// 排除人
const handleChange = (event) => {
    const exclude = Array.from(event.target.selectedOptions, option => Number(option.value));
    excludePeople.value = exclude;
}

// 抽獎獎項
const filteredPrizes = computed(() => {
    return allPrize.value.filter(prize => !prize.hidden)
});
//選擇獎勵
const choosePrize = useState("choosePrize", () => NaN)
// 全部false/出席戰場true分類
const chooseAttend = useState("chooseAttend", () => false)
// 排除已離開的人
const excludeLeaveUser = ref([]);
watch(users, () => {
    excludeLeaveUser.value = users.value.filter((user) => (user.verify));
}, { immediate: true });


// get抽獎者
const lotteryList = useState('allprize');

const sendFetchAwardee = async () => {
    let sendData = { type: 'getawardee', pid: choosePrize.value, chooseAttend: chooseAttend.value, excludePeople: excludePeople.value }
    try {
        const response = await axios.post('/api/awardee', sendData);

        if (response.data.success) {
            lotteryList.value = response.data.data;
        }

        if (!response.data.success) {
            $swal.fire({
                title: response.data.message,
                icon: "warning",
                timer: 1500,
                showConfirmButton: false
            });
        }
    } catch (error) {
        console.log('errr', error)
        $swal.fire({
            title: 'Please try again',
            icon: "error",
            timer: 1500,
            showConfirmButton: false
        });
    }
    isInProcess.value = false;
};

const isInProcess = useState('isInProcess', () => false);

watch(isInProcess, async () => {

    console.log('lotteryList has changed, fetching awardees count...');

    await sendFetchAwardee();
});
</script>



<style lang="scss" scoped>
.select {
    display: flex;

    .wrapper {
        select {
            width: 100%;
            height: 40px;
        }
    }

    .exclude-people {
        display: flex;
        flex-direction: column;

        label {
            background: black;
            color: white;
            font-size: 12px;
            padding: 4px 8px;
        }

        button {
            width: auto;
        }
    }
}

.awardee-all-list {
    position: relative;
    padding: 16px;
    width: 500px;
    height: 300px;
    color: black;
    background: white;
    overflow: hidden;
    overflow-y: auto;

    .cancle {
        position: absolute;
        right: 6px;
        top: 6px;
        color: red;
        font-size: 24px;
    }
}

.grid {
    display: grid;
    grid-template-columns: 16px 1fr 1fr 16px;
    grid-template-areas: '. name date .';
    text-align: center;

}


.wheel-container {
    text-align: center;

    button {
        padding: 10px 20px;
        font-size: 18px;
        background-color: #ff6600;
        color: white;
        border: none;
        cursor: pointer;
    }
}


@media screen and (max-width: 768px) {}
</style>