<template>
    <div>
        <HomeTitle title="試煉排名" />
        <div class="rank-content card">
            <div class="grid title-line">
                <div>名稱</div>
                <div>數值</div>
            </div>
            <div class="rank-b">

                <div v-for="(user, index) in ranking" :key="user.id" class="grid">
                    <div class="ranking">{{ index + 1 }}</div>
                    <div>{{ user.username }}</div>
                    <div>{{ user.value }}K</div>
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
        } else {
            console.log(response.data.message);
        }
    } catch (error) {
        console.log(error, "錯誤");
    }
};
onMounted(() => {
    fetchRanking();
});


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
    grid-template-columns: 1fr 1fr;
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
    position: absolute;
    left: 0;
    top: 12px;
    font-size: 8px;
    border: 1px solid rgb(148, 148, 148);
    border-radius: 80px;
    width: 10px;
    height: 10px;
    color: rgb(148, 148, 148);
}

.rank-b {
    overflow-y: auto;


    &::-webkit-scrollbar {
        display: none;

    }
}

@media screen and (max-width: 730px) {}
</style>