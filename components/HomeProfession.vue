<template>
    <div class="container">
        <HomeTitle title="職業表" />

        <div v-if="loading" class="loading">
            <Loading />
        </div>
        <div v-else class="align" @click="goToJobPage()">
            <div v-for="key in jobKeys" class="flex">
                <div class="at">{{ key }}</div>
                <div class="ac">{{ jobCount && jobCount[key] }}</div>
            </div>
        </div>
    </div>
</template>

<script setup>
import HomeTitle from '~/components/HomeTitle.vue';
import Loading from '~/components/Loading.vue'
const loading = useState('loading');
const users = useState("users");

const goToJobPage = () => {
    router.push("/profession");
};

let jobKeys = []
let jobCount = {};

watch(() => users.value, (newUsers) => {
    if (newUsers && newUsers.length > 0) {
        jobCount = newUsers.reduce((acc, user) => {
            if (user.job) {
                acc[user.job] = (acc[user.job] || 0) + 1;
            }
            return acc;
        }, {});

        jobKeys = Object.keys(jobCount).sort((a, b) => jobCount[b] - jobCount[a]);
    }
});



</script>

<style lang="scss" scoped>
.container {
    text-align: center;

    >div:first-child {
        margin-bottom: 16px;
    }

    .at {
        width: 50px;
    }

    .ac {
        width: 30px;
    }
}

.align {
    display: flex;
    flex-direction: column;
}

@media screen and (max-width: 768px) {
    .align {
        align-items: center;
    }
}
</style>