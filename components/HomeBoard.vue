<template>
    <div class="container">
        <HomeTitle title="公會公告欄" />

        <div v-if="loading" class="card loading">
            <Loading />
        </div>
        <div v-else>
            尚未建立
        </div>
    </div>
</template>

<script setup>
import HomeTitle from '~/components/HomeTitle.vue';
import Loading from '~/components/Loading.vue'
const loading = useState('loading');

</script>

<style lang="scss" scoped>
.container {
    text-align: center;

    >div:first-child {
        margin-bottom: 16px;
    }
}

@media screen and (max-width: 1200px) {}
</style>