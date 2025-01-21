<template>
    <div class="title">
        <i class="fa-solid fa-star"></i>
        <span>{{ title }}</span>
        <i class="fa-solid fa-star"></i>
        <div class="title-border"></div>
    </div>
</template>

<script setup>
defineProps({
    title: {
        type: String,
    }
});

</script>

<style lang="scss" scoped>
.title {
    display: flex;
    gap: 16px;
    font-size: 16px;
}

.title-border {
    margin-top: 12px;
    width: calc(100% - 180px);
    height: 1px;
    background: rgb(94, 94, 94);
}

@media screen and (max-width: 730px) {
    .title {
        font-size: 24px;
        font-weight: bold;
        justify-content: center;
        align-items: center;
    }

    .title-border {
        display: none;
    }
}
</style>