<template>
    <div class="container">
        <HomeTitle title="最新加入" />
        <div v-if="loading" class="card loading height">
            <Loading />
        </div>
        <div v-else class="card">
            <div class="grid title-line">
                <div>名稱</div>
                <div>加入日期</div>
            </div>
            <div class="grid" v-for="user in sortedUsers" :key="user.id">
                <div class="name-length">{{ user.username }}</div>
                <div class="date-length">{{ user.createDate }}</div>
            </div>
        </div>
    </div>
</template>

<script setup>
import HomeTitle from '~/components/HomeTitle.vue';
import Loading from '~/components/Loading.vue'

const users = useState('users');
const loading = useState('loading');

// 抓到最新加入的 最接近十個
const sortedUsers = computed(() => {
    if (!users.value || users.value.length === 0) {
        return []; // 資料尚未加載時，回傳空陣列
    }

    return users.value
        .filter(user => user.verify === true) // 過濾掉 verify === false 的使用者
        .slice() // 創建一個副本，避免改動原始陣列
        .sort((a, b) => new Date(b.createDate) - new Date(a.createDate)) // 按日期排序
        .slice(0, 5); // 取前 5 個
});

</script>

<style lang="scss" scoped>
.container {
    >div:first-child {
        margin-bottom: 16px;
    }
}

.grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding-block: 5px;

    .name-length {
        width: 85px;
        height: 20px;

        word-wrap: break-word;
        white-space: normal;
        font-size: clamp(12px, 5px, 30px);
        overflow-wrap: break-word;
    }

    .date-length {
        text-align: center;
    }
}

.title-line {
    border-width: 0 0 1px 0;
    border-color: black;
    border-style: solid;
    text-align: center;
}

.height {
    height: 300px;
}

@media screen and (max-width: 1200px) {
    .ontainer {
        font-size: 12px;
    }
}
</style>