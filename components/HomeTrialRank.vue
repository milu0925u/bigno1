<template>
    <div>
        <HomeTitle title="試煉排名" />
        <div class="rank-content card">
            <div class="grid title-line">
                <div></div>
                <div>名稱</div>
                <div>數值</div>
                <div></div>
            </div>
            <div class="rank-b">
                <div v-for="user in ranking" :key="user.id" class="grid">
                    <div class="ranking">{{ user.ranking }}</div>
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

import axios from 'axios';
const ranking = ref([]);
const fetchRanking = async () => {
    try {
        const response = await axios.get("/api/trial");
        if (response.data.success) {
            ranking.value = response.data.users.all
        }
    } catch (error) {
        console.log(error, "錯誤");
    }
};
onMounted(() => {
    fetchRanking();
});


console.log(ranking.value);


</script>

<style lang="scss" scoped>
.rank-content {
    margin-top: 24px;
    height: calc(100vh - 200px);
    display: flex;
    flex-direction: column;
    text-align: center;
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
    // border: 1px solid rgb(148, 148, 148);
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
    overflow-y: auto;


    &::-webkit-scrollbar {
        display: none;

    }
}

@media screen and (max-width: 730px) {}
</style>