<template>
    <div class="home-grid">
        <div class="navv">
            <HomeNavbar />
        </div>
        <div class="usercard">
            <HomeUser />
        </div>
        <div class="newuser">
            <HomeNewUser />
        </div>
        <div class="attendt">
            <HomeTrialAttend />
        </div>
        <div class="rank">
            <HomeTrialRank />
        </div>
        <div class="attendb">
            <HomeBattleAttend />
        </div>
        <div class="pig"></div>
        <div class="bg"></div>
    </div>
</template>

<script setup>
import HomeBattleAttend from '~/components/HomeBattleAttend.vue';
import HomeNewUser from '~/components/HomeNewUser.vue';
import HomeUser from '~/components/HomeUser.vue';
import HomeTrialAttend from '~/components/HomeTrialAttend.vue';
import HomeTrialRank from '~/components/HomeTrialRank.vue';
import HomeNavbar from '~/components/HomeNavbar.vue';

// 設置此頁的title跟關鍵字搜尋
useHead({
    title: 'Swagger Pig NO.1',
    meta: [
        { name: 'description', content: 'This is RO rebirth Game\'s Guild - Swagger Pig No.1 ' },
        { name: 'keywords', content: 'rebirth,game,guild,nuxt,RO' }
    ]
});

import { fetchAllUsers } from '~/store/st_user.js';
const user = useState("user");
const cookieUser = useCookie("ipx");
fetchAllUsers();

console.log(cookieUser.value, 'cookieUser我的哭我的哭');

if (!user.value && cookieUser.value) {

    console.log(cookieUser.value, 'cookieUser');
    const decodedUser = JSON.parse(decodeURIComponent(cookieUser.value));
    try {
        const response = axios.post(`/api/user`, { type: 'verify', id: decodedUser.id });
        if (response.data.success) {
            console.log(response.data.users, '結果有存嗎');
            user.value = response.data.users;
        } else {
            console.log('沒有抓到捏');
        }
    } catch (error) {
        console.error("驗證使用者時發生錯誤", error);
    }
}


</script>


<style lang="scss" scoped>
.bg {
    position: fixed;
    z-index: -1;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-image: url('/public/images/background1.png');
    background-repeat: no-repeat;
    background-size: 100%;
    width: 100%;
    height: 100%;
}

.pig {
    position: absolute;
    top: 0;
    left: 0;
    background-image: url('/public/images/pig.png');
    background-repeat: no-repeat;
    background-size: 70%;
    width: 300px;
    height: 300px;
}

@media screen and (max-width: 768px) {
    .pig {
        width: 150px;
    }
}
</style>