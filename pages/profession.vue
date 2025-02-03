<template>
    <div class="container">
        <div></div>

        <button @click="goToHome">返回</button>
    </div>
</template>

<script setup>
const users = useState("users");

// 回首頁
const goToHome = () => {
    navigateTo('/')
};



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
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>