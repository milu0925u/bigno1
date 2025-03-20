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
    color: #fb0e51;
    text-shadow: 2px 2px 0px rgba(0, 0, 0, 0.3);

    i {
        color: #fd779d;
    }
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