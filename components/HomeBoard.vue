<template>
    <div class="container">
        <HomeTitle title="公會公告欄" />

        <div v-if="loading" class="loading">
            <Loading />
        </div>
        <div v-else-if="board.length > 0 && !loading" class="card board">
            <div v-for="b in board">
                <div class="one-board" @click="goToBoardDetail(b.bid)">
                    <div>{{ b.title }}</div>
                    <div>- {{ b.createdate }}</div>
                </div>
            </div>
        </div>
        <div v-else>暫無公告</div>
    </div>
</template>

<script setup>
import HomeTitle from '~/components/HomeTitle.vue';
import Loading from '~/components/Loading.vue';
import axios from 'axios';
const loading = useState('loading');

const board = ref([])
const fetchboard = async () => {
    try {
        const response = await axios.get("/api/board");

        if (response.data.success) {
            // 抓取前五則最新的使用
            board.value = response.data.data.sort((a, b) => b.bid - a.bid).slice(0, 3);
        }
    } catch (error) {
        console.log(error, "執行錯誤，請前往修改代碼，試煉排行。");
    }
};
// 前往內文
const goToBoardDetail = (bid) => {
    navigateTo(`/board/${bid}`);
};
onMounted(() => {
    fetchboard();
});


</script>

<style lang="scss" scoped>
.container {
    >div:first-child {
        margin-bottom: 16px;
    }
}

.one-board {
    display: grid;
    word-wrap: break-word;
    overflow-wrap: break-word;
    font-size: 12px;
    margin-bottom: 8px;
    cursor: pointer;
    width: 100%;
    &:hover {
        transform: scale(1.03);
        border-width: 0 0 1px 0;
        border-color: rgba(214, 195, 195, 0.5);
        border-style: solid;
    }

    div:last-child{
       margin-left: auto;
    }
}


@media screen and (max-width: 768px) {
    .board {
        margin-inline: auto;
        width: 100%;
        padding: 12px 24px;
    }
}
</style>