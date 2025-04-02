<template>

    <div v-if="isClient">
        <div class="marquee">
            <div class="marquee-content" v-if="datas && datas.length">
                <div v-for="(item, index) in datas" :key="item.aid" class="marquee-item"
                    :style="`animation-delay: ${index * 1}s;`">
                    恭喜 「{{ getUserById(item.uid).username }}」 獲得{{ getPrizeById(item.pid).pname }} ！
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import axios from 'axios';
const { $swal } = useNuxtApp();
const users = useState("users");

const datas = ref([]);
const prizes = ref([]);
const fetchData = async () => {
    try {
        const prizesResponse = await axios.get("/api/prizes")

        if (prizesResponse.data.success) {
            prizes.value = prizesResponse.data.data;
        }

        const awardeeResponse = await axios.get("/api/awardee")
        if (awardeeResponse.data.success) {
            const sorted = awardeeResponse.data.data.sort((a, b) => b.id - a.id).slice(0, 3);
            datas.value = sorted;
        }
    } catch (error) {
        console.error(error);
        $swal.fire({
            title: "123請重新再試！",
            icon: "error",
            timer: 1500,
            showConfirmButton: false
        });
    }
};
// 取得名稱
const getUserById = (uid) => {
    return users.value.find(user => user.id == uid);
};
const getPrizeById = (pid) => {
    return prizes.value.find(prize => prize.pid == pid);
};

const isClient = ref(false);
onMounted(() => {
    fetchData();
    isClient.value = true;
});

</script>

<style lang="scss" scoped>
.marquee {
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    padding: 10px 0;
}

.marquee-content {
    display: flex;
    animation: marquee 20s linear infinite;
}

.marquee-item {
    display: inline-block;
    padding-left: 0;
    animation: slideIn 10s linear;
    margin-right: 50px;
}

@keyframes marquee {
    from {
        transform: translateX(100%);
    }

    to {
        transform: translateX(-100%);
    }
}

@keyframes marquee-item {
    from {
        transform: translateX(100%);
        /* 項目從右邊進入 */
    }

    to {
        transform: translateX(-100%);
        /* 項目移動到左邊消失 */
    }
}

@media screen and (max-width: 768px) {}
</style>