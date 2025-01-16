<template>
    <div>
        <HomeTitle title="試煉排名" />
        <div class="rank-content card">
            <div class="grid title-line">
                <div>名稱</div>
                <div>數值</div>
            </div>
            <div class="rank-b">
                <div class="rank-b" v-if="users && users.length > 0">
                    <div v-for="user in sortedUsers" :key="user.id" class="grid">
                        <div>{{ user.username }}</div>
                        <div>{{ user.trialTotal }}K</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import HomeTitle from '~/components/HomeTitle.vue';

let users = useState('users')

// 由數字最大到小
const sortedUsers = computed(() => {
    return users && [...users.value].sort((a, b) => {
        const aTrialTotal = a.trialTotal != null ? a.trialTotal : 0;
        const bTrialTotal = b.trialTotal != null ? b.trialTotal : 0;
        return bTrialTotal - aTrialTotal;
    });
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
}

.title-line {
    border-width: 0 0 1px 0;
    border-color: black;
    border-style: solid;
}

.rank-b {
    overflow-y: auto;

    &::-webkit-scrollbar {
        display: none;

    }
}

@media screen and (max-width: 730px) {
    .rank-content {
        width: 90%;
    }
}
</style>