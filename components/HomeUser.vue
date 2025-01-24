<template>
    <div v-if="loading" class="loading">
        <Loading />
    </div>
    <div v-if="user && user?.username && user?.verif === true" class="card">
        <div class="content">
            <div><span>名稱</span>{{ user && user.username ? user.username : '無' }}</div>
            <div><span>職業</span>{{ user && user.username ? user.job : '無' }}</div>
            <div><span>加入時間</span>{{ user && user.username ? user.createDate : '無' }}</div>
            <div class="btn-group">
                <button class="btn" @click="goToUserData">編輯資料</button>
                <button class="btn" @click="goToTakeOff">戰場請假</button>
                <button class="btn" @click="goToTrial">試煉數值</button>
            </div>
        </div>
    </div>
    <div v-else-if="!user && !user?.verify === false" class="not-login">
        您的審核未通過/非本公會會員。
    </div>
    <div v-else class="not-login">
        尚未登入，右上角前往登入。
    </div>
</template>

<script setup>
import { useUser } from '~/store/st_user';
import Loading from "~/components/Loading.vue"
const user = useUser();
const loading = useState('loading');


const goToTakeOff = () => { navigateTo('/takeoff') };
const goToTrial = () => { navigateTo('/taketrial') };
const goToUserData = () => { navigateTo('/takeuserData') };

</script>

<style lang="scss" scoped>
.content {
    >div {
        display: flex;
        justify-content: space-between;
    }
}

.btn-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 24px 0 0 0;
}

.not-login {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

@media screen and (max-width: 800px) {
    .content {
        font-size: 12px;
    }
}
</style>