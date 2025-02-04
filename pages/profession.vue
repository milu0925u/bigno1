<template>
    <div class="container">
        <div class="content">
            <div class="color-block">
                <span>騎士</span>
                <div v-for="auser in a" :key="auser.id">{{ auser.username }}</div>
            </div>
            <div class="color-block">
                <span>獵人</span>
                <div v-for="buser in b" :key="buser.id">{{ buser.username }}</div>
            </div>
            <div class="color-block">
                <span>法師</span>
                <div v-for="cuser in c" :key="cuser.id">{{ cuser.username }}</div>
            </div>
            <div class="color-block">
                <span>刺客</span>
                <div v-for="duser in d" :key="duser.id">{{ duser.username }}</div>
            </div>
            <div class="color-block">
                <span>鐵匠</span>
                <div v-for="euser in e" :key="euser.id">{{ euser.username }}</div>
            </div>
            <div class="color-block">
                <span>服事</span>
                <div v-for="fuser in f" :key="fuser.id">{{ fuser.username }}</div>
            </div>
        </div>

        <button class="btn" @click="goToHome">返回</button>
    </div>
</template>

<script setup>

const users = useState("users");
const a = ref([]);
const b = ref([]);
const c = ref([]);
const d = ref([]);
const e = ref([]);
const f = ref([]);

// 回首頁
const goToHome = () => {
    navigateTo('/')
};

watch(() => users.value, () => {
    if (!users || users.value.length === 0) return;
    a.value = users.value.filter(v => v.job == '騎士');
    b.value = users.value.filter(v => v.job == '獵人');
    c.value = users.value.filter(v => v.job == '法師');
    d.value = users.value.filter(v => v.job == '刺客');
    e.value = users.value.filter(v => v.job == '鐵匠');
    f.value = users.value.filter(v => v.job == '服事');
}, { immediate: true });



</script>

<style lang="scss" scoped>
.container {
    width: 100%;
    height: 100%;

    .content {
        display: flex;
        justify-content: center;
        gap: 16px;
        font-size: 12px;

        .color-block {
            display: flex;
            flex-direction: column;
            gap: 6px;
            padding: 24px 12px;
            border-radius: 8px;

            span {
                width: 35px;
                text-align: center;
                padding: 2px;
            }

            >div {
                width: 150px;
                border: 1px solid rgba(171, 171, 235, 0.5);
                border-radius: 6px;
                background: white;
                padding: 8px 12px;
            }
        }
    }

    >button {
        position: absolute;
        top: 8px;
        right: 24px;
        width: 40px;
        font-size: 12px;
    }
}
</style>