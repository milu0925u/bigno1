<template>
    <div class="container">
        <HomeTitle title="職業表" />
        <div v-if="loading" class="loading">
            <Loading />
        </div>
        <div v-else class="align">
            <div class="go" @click="goToJobPage"><i class="fa-brands fa-golang"></i></div>
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
    navigateTo('/profession')
};

const jobCount = computed(() => {
    return users.value.filter((v) => v.verify).reduce((acc, user) => {
        if (user.job) {
            acc[user.job] = (acc[user.job] || 0) + 1;
        }
        return acc;
    }, {});
});

const jobKeys = computed(() => {
    return Object.keys(jobCount.value).sort((a, b) => jobCount.value[b] - jobCount.value[a]);
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
    width: 80%;
    display: flex;
    flex-direction: column;
    position: relative;

    .go {
        position: absolute;
        right: 0;
        margin-left: auto;
        color: red;
        font-size: 24px;

        &:hover {
            cursor: pointer;
            animation: bounce 0.6s infinite alternate ease-in-out;
        }
    }

    @keyframes bounce {
        0% {
            transform: translateY(0);
        }

        100% {
            transform: translateY(-10px);
            /* 向上跳 10px */
        }
    }
}

@media screen and (max-width: 768px) {
    .align {
        align-items: center;
    }
}
</style>