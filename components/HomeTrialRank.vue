<template>
    <div class="container">
        <HomeTitle title="試煉總排名" />
        <span class="tt">Fetch data to the last one</span>
        <div class="rank-content card">
            <div v-if="loading" class="loading">
                <Loading />
            </div>
            <div v-else class="rank-b">

                <div v-for="(user, index) in ranking" :key="user.id" class="grid">
                    <div class="ranking">{{ index + 1 }}</div>
                    <div>{{ user.username }}</div>
                    <div>{{ user.value }}K</div>
                    <div class="pro">
                        <i v-if="user.pro > 0" class="fa-solid fa-up-long up-color"></i>
                        <i v-else-if="user.pro < 0" class="fa-solid fa-down-long down-color"></i>
                        <i v-else class="fa-solid fa-minus"></i>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<script setup>
import HomeTitle from '~/components/HomeTitle.vue';
import Loading from "~/components/Loading.vue"
import axios from 'axios';
const ranking = ref([]);
const loading = ref(true);
const fetchRanking = async (retries = 3, delay = 1000) => {
    try {
        const response = await axios.get("/api/trial");

        if (response.data.success) {
            ranking.value = response.data.users.sort((a, b) => b.value - a.value)
            loading.value = false;
        }
    } catch (error) {
        console.log(error, "抓取所有成員試煉排行失敗，請重新抓取！");
        if (error.response && error.response.status === 503) {
            console.log(`正在重試... 剩餘次數: ${retries}`);
            if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, delay)); // 延遲一段時間
                return fetchRanking(retries - 1, delay); // 重新調用函數，減少重試次數
            } else {
                console.log("重試次數已達上限，請稍後再試！");
            }
        }
    }
};
onMounted(() => {
    fetchRanking();
});
</script>

<style lang="scss" scoped>
.container {
    position: relative;
}

.tt {
    position: absolute;
    top: 18px;
    right: 18px;
    font-size: 8px;
    font-family: monospace;
    color: rgb(76, 68, 190);
}

.rank-content {
    margin-top: 24px;
    height: calc(100vh - 280px);
    display: flex;
    flex-direction: column;
    text-align: center;
    position: relative;
}

.grid {
    display: grid;
    grid-template-columns: 20px 1fr 1fr 20px;
    text-align: center;
    padding-block: 5px;
    position: relative;
}

.title-line {
    border-width: 0 0 1px 0;
    border-color: black;
    border-style: solid;
}

.ranking {
    font-size: 12px;
    border-radius: 80px;
    color: rgb(65, 61, 70);
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.pro {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 12px;

    .up-color {
        color: red;
    }

    .down-color {
        color: rgb(27, 112, 55);
    }
}

.rank-b {
    height: 100%;
    overflow-y: auto;
    position: relative;


    &::-webkit-scrollbar {
        display: none;

    }
}

.center {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

@media screen and (max-width: 800px) {
    .rank-content {
        font-size: 12px;
    }

    .tt {
        position: static;
        display: flex;
        justify-content: center;
    }
}
</style>