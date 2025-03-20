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
        <div class="profession">
            <HomeProfession />
        </div>
        <div class="newuser">
            <HomeNewUser />
        </div>
        <!-- <div class="attendt">
            <HomeTrialAttend />
        </div> -->
        <div class="attendb">
            <HomeBattleAttend />
        </div>
        <!-- <div class="rank">
            <HomeTrialRank />
        </div> -->
        <div class="pig"></div>
        <div class="bg"></div>

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
import HomeProfession from '~/components/HomeProfession.vue';
import { fetchAllUsers } from '~/store/st_user';
// 設置此頁的title跟關鍵字搜尋
useHead({
    title: '糟糕我被波利包圍了',
    meta: [
        { name: 'description', content: 'Oops, I\'m surrounded by Polly' },
        { name: 'keywords', content: 'rebirth,game,guild,nuxt,RO' }
    ],
    link: [
        { rel: 'icon', type: 'image/png', href: '/images/LOGO.svg' } // 指定新的 LOGO 路徑
    ]
});

const loading = useState('loading', () => true);
const user = useState("user", () => null);
const users = useState("users", () => []);
const trail = useState("trail", () => []);
const battle = useState("battle", () => []);

onMounted(() => {
    setTimeout(() => {
        loading.value = false;
    }, 2000);


    window.addEventListener("storage", (event) => {
        if (event.key === "updatetime") {
            fetchAllUsers();
        }
    });

});

definePageMeta({
    middleware: 'check-login'
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
    background-image: url('/public/images/background2.png');
    background-repeat: no-repeat;
    background-size: 100%;
    width: 100%;
    height: 100%;
}

.pig {
    position: absolute;
    top: 0;
    left: 0;
    background-image: url('/public/images/openi-2.png');
    background-repeat: no-repeat;
    background-size: 70%;
    width: 300px;
    height: 300px;
}

.pig-g {
    position: absolute;
    bottom: 0;
    right: 10px;
    background-image: url('/public/images/openi-1.png');
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

@media screen and (max-width: 1200px) {
    .bg {
        background-size: auto;
    }

    .pig-g {
        display: none;
    }
}


@media screen and (max-width: 768px) {
    .pig {
        width: 150px;
    }

    .pig-g {
        display: grid;
        position: static;
        padding: 0;
        margin: 0;
    }
}
</style>