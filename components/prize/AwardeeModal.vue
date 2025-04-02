<template>
    <div class="awardee-modal" v-if="openModal.value">
        <div class="awardee-all-list">
            <button @click="openModal.value = false" class="cancle"><i class="fa-solid fa-xmark"></i></button>

            <div class="header grid">
                <div>得獎人</div>
                <div>得獎日期</div>
            </div>
            <div v-for="award in awardees.value" :key="award.aid" class="grid">
                <div>{{ getUserById(award.uid).username }}</div>
                <div>{{ new Date(award.createdate).toISOString().split('T')[0] }}</div>
            </div>

        </div>
    </div>
</template>

<script setup>
const openModal = useState("modal"); // 是否打開彈跳視窗
const awardees = useState("awardees"); // 得獎人
const users = useState("users");

console.log(openModal.value, '123')

const getUserById = (uid) => {
    return users.value.find(user => user.id == uid);
};
</script>

<style lang="scss" scoped>
.awardee-modal {
    position: absolute;
    z-index: 1;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 100%;
    background: rgba(31, 31, 31, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;

    .header {
        margin-top: 32px;
        text-align: center;

        >div {
            margin-inline: 2px;
            background: rgb(0, 0, 0);
            color: white;
            padding: 6px 4px;
        }
    }

    .awardee-all-list {
        position: relative;
        padding: 16px;
        width: 500px;
        height: 300px;
        color: black;
        background: white;
        overflow: hidden;
        overflow-y: auto;

        .cancle {
            position: absolute;
            right: 6px;
            top: 6px;
            color: red;
            font-size: 24px;
        }
    }

    .grid {
        display: grid;
        grid-template-columns: 16px 1fr 1fr 16px;
        grid-template-areas: '. name date .';
        text-align: center;

        >div {
            padding: 4px 8px;

            &:first-child {
                grid-area: name;
            }

            &:last-child {
                grid-area: date;
            }
        }
    }
}
</style>