<template>
    <div v-if="isClient">
        <ManagerNavbar :current-active="currentActive" @update:currentActive="updateCurrentActive" />
        <div class="container" v-if="currentActive === 'allprize'">
            <Allprize />
        </div>
        <div class="container" v-else-if="currentActive === 'addprize'">
            <CreatePrize />
        </div>
        <div class="container" v-else-if="currentActive === 'lottery'">
            <SelectAwardee />
            <Lottery />
        </div>
        <div class="awardee-modal" v-if="openModal">
            <div class="awardee-all-list">
                <button @click="openModal = false" class="cancle"><i class="fa-solid fa-xmark"></i></button>

                <div class="header grid">
                    <div>得獎人</div>
                    <div>得獎日期</div>
                </div>
                <div v-for="award in awardees" :key="award.aid" class="grid">
                    <div>{{ getUserById(award.uid).username }}</div>
                    <div>{{ new Date(award.createdate).toISOString().split('T')[0] }}</div>
                </div>

            </div>
        </div>
    </div>
</template>

<script setup>
import axios from "axios";
import Allprize from '~/components/prize/AllPrize.vue';
import CreatePrize from '~/components/prize/CreatePrize.vue';
import SelectAwardee from '~/components/prize/SelectAwardee.vue';
import ManagerNavbar from '~/components/ManagerNavbar.vue';
import Lottery from '~/components/prize/Lottery.vue';

const currentActive = ref("lottery"); // 接收子層組件
const updateCurrentActive = (newValue) => {
    currentActive.value = newValue;
};

// 是否打開彈跳視窗
const openModal = useState('openModal', () => false);

// 抓取所有得獎者與獎項
const datas = useState('getAllPrize', () => []);
const awardees = useState('awardees', () => []); // 得獎人
const lotteryList = useState('lottery', () => []); // 抽獎名單
const fetchData = async () => {
    try {
        const [prizesResponse, awardeeResponse] = await Promise.all([
            axios.get("/api/prizes"),
            axios.get("/api/awardee")
        ]);

        let allPrize = []
        if (prizesResponse.data.success) {
            allPrize = prizesResponse.data.data;
            allPrize.forEach(prize => { prize.awardees = [] });
        }
        if (awardeeResponse.data.success) {
            let allAwardee = awardeeResponse.data.data;
            allAwardee.forEach(awardee => {
                const prize = allPrize.find(prize => prize.pid === awardee.pid);
                if (prize) {
                    prize.awardees.push(awardee);
                }
            });
        }
        datas.value = allPrize;
    } catch (error) {
        console.log(error, '取得失敗');
    }
};
// 取得名稱
const users = useState("users")
const getUserById = (uid) => {
    return users.value.find(user => user.id == uid);
};

watch(datas, () => {
    fetchData();
}, { immediate: true });


const isClient = ref(false);
onMounted(() => {
    isClient.value = true; // 客戶端渲染後顯示內容
});

definePageMeta({
    middleware: ['manager', 'check-login']
});
</script>



<style lang="scss" scoped>
.container {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    gap: 24px;

    .content {
        width: 90%;

        .header {
            >div {
                margin-inline: 2px;
                background: rgb(0, 0, 0);
                color: white;
                padding: 6px 4px;
            }
        }

        .body {
            display: flex;
            justify-content: center;
            align-items: center;

            >div {
                flex: 1;
                white-space: nowrap;
                /* 禁止換行 */
                overflow: hidden;
                /* 隱藏超出部分 */
                text-overflow: ellipsis;
                /* 超出部分顯示省略號 */
                padding: 8px;
            }

            .watch-btn {
                width: 40%;
                padding: 4px 6px;
                border: 1px dashed rgb(107, 162, 172);
                color: #3cca9b;

                &:hover {
                    background: #3cca9b8f;
                    color: white;
                }
            }
        }

        .header,
        .body {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            padding: 2px;
            gap: 4px;

            input,
            select {
                width: 90%;
                height: 100%;
            }
        }

    }

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

    .select {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 16px;

        .select-id {
            width: 40%;
            padding: 6px 16px;
        }

        button {
            width: 50px;
        }

        form {
            width: 150px;
            height: 180px;

            select {
                width: 150px;
                height: 100%;
            }
        }

        .wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
        }
    }

}

.awardee-modal {
    position: absolute;
    z-index: 1;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 100%;
    background: rgba(31, 31, 31, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;

    .header {
        margin-top: 32px;
        text-align: center;

        >div {
            margin-inline: 2px;
            background: rgb(0, 0, 0);
            color: white;
            padding: 6px 4px;
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

        >div {
            padding: 4px 8px;

            &:first-child {
                grid-area: name;
            }

            &:last-child {
                grid-area: date;
            }
        }
    }
}

@media screen and (max-width: 768px) {
    .container {
        .content {
            width: 100%;

            .header {
                >div {
                    margin-inline: 0
                }
            }

            .body {
                >div {
                    padding: 2px;
                }

                .watch-btn {
                    width: 80%;
                }
            }

            .header,
            .body {
                padding: 0px;
            }
        }

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

        .select {
            height: auto;
            width: 100%;
            display: grid;
            grid-template-columns: 50% 50%;
            grid-template-areas: 'selectID selectID'
                'wrapper form';
            border-bottom: 1px solid black;
            padding: 16px;

            .select-id {
                grid-area: selectID;
                justify-self: center;
                width: 80%;
            }

            .wrapper {
                grid-area: wrapper;
            }

            form {
                grid-area: form;
            }
        }
    }

}
</style>