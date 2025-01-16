<template>
    <div class="title">
        <span>{{ title }}</span>
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
    width: calc(100% - 80px);
    height: 1px;
    background: rgb(94, 94, 94);
}

@media screen and (max-width: 730px) {
    .title {
        text-align: center;
    }

    .title-border {
        display: none;
    }
}
</style>