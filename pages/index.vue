<template>
    <div class="home-grid">
        <div class="navv">
            <HomeNavbar />
        </div>
        <div class="usercard">
            <HomeUser />
        </div>
        <div class="board">
            <HomeBoard />
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
        <div class="pig-g"></div>
    </div>
</template>

<script setup>
import HomeBoard from '~/components/HomeBoard.vue'
import HomeBattleAttend from '~/components/HomeBattleAttend.vue';
import HomeNewUser from '~/components/HomeNewUser.vue';
import HomeUser from '~/components/HomeUser.vue';
import HomeTrialAttend from '~/components/HomeTrialAttend.vue';
import HomeTrialRank from '~/components/HomeTrialRank.vue';
import HomeNavbar from '~/components/HomeNavbar.vue';

// 設置此頁的title跟關鍵字搜尋
useHead({
    title: '天下第一霸豬',
    meta: [
        { name: 'description', content: 'This is RO rebirth Game\'s Guild - Swagger Pig No.1 ' },
        { name: 'keywords', content: 'rebirth,game,guild,nuxt,RO' }
    ],
    link: [
        { rel: 'icon', type: 'image/png', href: '/images/logo.png' } // 指定新的 LOGO 路徑
    ]
});

import { fetchAllUsers } from '~/store/st_user.js';

onMounted(() => {
    fetchAllUsers();
});


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

.pig-g {
    position: absolute;
    bottom: 0;
    right: 10px;
    background-image: url('/public/images/pig-g.png');
    background-repeat: no-repeat;
    background-size: 100%;
    width: 300px;
    height: 130px;
}

@media screen and (max-width: 1600px) {
    .bg {
        background-size: auto;
    }


}

@media screen and (max-width: 768px) {
    .pig {
        width: 150px;
    }

    .pig-g {
        position: relative;
        right: 0;
        width: 100%;
    }
}
</style>