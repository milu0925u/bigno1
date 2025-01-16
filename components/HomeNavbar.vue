<template>
    <div v-if="user && user.position === '管理員'" class="btn-group">
        <button class="btn" @click="goToManager">管理者模式</button>
    </div>
    <div v-else-if="user && user.username" class="btn-group">
    </div>
    <div v-else class="btn-group">
        <button class="btn" @click="goToSignup">註冊</button>
        <button class="btn" @click="goToLogin">登入</button>
    </div>
</template>

<script setup>
import { useUser } from '~/store/st_user';
const user = useUser();

const goToLogin = () => { navigateTo('/login') };
const goToSignup = () => { navigateTo('/signup') };
const goToManager = () => { navigateTo('/manager') };
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
