<template>
     <div v-if="isClient">
        <div v-if="user === null || !user " class="btn-group">
            <button class="btn" @click="goToSignup">註冊</button>
            <button class="btn" @click="goToLogin">登入</button>
        </div>
        <div v-else-if="user.position === '管理員'" class="btn-group">
            <button class="btn" @click="goToManager">管理者模式</button>
            <button class="btn" @click="goToLogout">登出</button>
        </div>
        <div v-else-if="user && user.verify" class="btn-group">
            <button class="btn" @click="goToLogout">登出</button>
        </div>
        <div v-else class="btn-group">
            <button class="btn" @click="goToLogout">登出</button>
        </div>
    </div>
</template>

<script setup>
const user = useState("user");

const goToLogin = () => { navigateTo('/login') };
const goToSignup = () => { navigateTo('/signup') };
const goToManager = () => { navigateTo('/manager') };
const goToLogout = () => {
    const cookie = useCookie("ipx");
    cookie.value = ''; 
    cookie.maxAge = 0; 
    user.value = null;
    };

const isClient = ref(false);
onMounted(() => {
  isClient.value = true; // 客戶端渲染後顯示內容
});
</script>

<style lang="scss" scoped>
.btn-group {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-inline: 24px;
    height: 35px;

    button {
        width: 80px;
    }
}

@media screen and (max-width: 768px) {}
</style>
