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

fetchAllUsers();

</script>
