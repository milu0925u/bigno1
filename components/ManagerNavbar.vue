<template>
    <div>
        <div class="btn-group">
            <button :class="{ activeColor: route.name === 'manager' }" @click="goToAllUser"><i
                    class="fa-solid fa-people-group"></i><span>所有成員</span></button>

            <button :class="{ activeColor: route.name === 'manager-verify' }" @click="goToVerify"><i
                    class="fa-solid fa-user-pen"></i><span>審核人員</span></button>

            <button :class="{ activeColor: route.name === 'manager-trial' }" @click="goToWriteTrial"><i
                    class="fa-solid fa-bolt"></i><span>協助輸入試煉</span></button>

            <button :class="{ activeColor: route.name === 'manager-battle' }" @click="goToBattle"><i
                    class="fa-regular fa-square-check"></i><span>戰場出席</span></button>

            <button :class="{ activeColor: route.name === 'manager-board' }" @click="goToBoard"><i
                    class="fa-solid fa-comments"></i><span>公會公告</span></button>

            <button :class="{ activeColor: route.name === 'manager-search' }" @click="goToSearch"><i
                    class="fa-solid fa-magnifying-glass"></i><span>搜尋</span></button>

            <button @click="goToHome"> <i class="fa-solid fa-arrow-right-from-bracket"></i><span>返回首頁</span></button>
        </div>
        <div class="group-list">
            <div v-if='route.name === "manager"'>
                <button :class="{ activeColor: props.currentActive === 'seeAll' }"
                    @click="seeAll">審核<span>成員</span></button>
                <button :class="{ activeColor: props.currentActive === 'seeAllcontainLeave' }"
                    @click="seeAllcontainLeave">離開<span>成員</span></button>
                <button :class="{ activeColor: props.currentActive === 'seeNoUser' }"
                    @click="seeNoUser">未審核<span>成員</span></button>
            </div>
            <div v-else-if='route.name === "manager-verify"'>
                <button :class="{ activeColor: props.currentActive === 'verifyJoin' }" @click="verifyJoin">加入</button>
                <button :class="{ activeColor: props.currentActive === 'verifyDate' }" @click="verifyDate">請假</button>
            </div>

            <div v-else-if='route.name === "manager-search"'>
                <button :class="{ activeColor: props.currentActive === 'searchdata' }" @click="searchdata">搜尋出席</button>
                <button :class="{ activeColor: props.currentActive === 'searchtotal' }"
                    @click="searchtotal">總出席表</button>
            </div>

            <div v-else-if='route.name === "manager-board"'>
                <button :class="{ activeColor: props.currentActive === 'allboard' }" @click="allboard">所有公告</button>
                <button :class="{ activeColor: props.currentActive === 'addboard' }" @click="addboard">新增公告</button>
            </div>
        </div>
    </div>
</template>

<script setup>
const goToAllUser = () => {
    navigateTo('/manager')
};
const goToVerify = () => {
    navigateTo('/manager-verify')
};
const goToSearch = () => {
    navigateTo('/manager-search')
};
const goToBattle = () => {
    navigateTo('/manager-battle')
};
const goToWriteTrial = () => {
    navigateTo('/manager-trial')
};
const goToBoard = () => {
    navigateTo('/manager-board')
};


const goToHome = () => { navigateTo('/') };

import { useRoute } from 'vue-router';

const route = useRoute();

const props = defineProps({
    currentActive: {
        type: String,
        required: true,
    },
});
const emit = defineEmits(['update:currentActive']);

const seeAll = () => {
    emit('update:currentActive', "seeAll");
}
const seeAllcontainLeave = () => {
    emit('update:currentActive', "seeAllcontainLeave");
}
const seeNoUser = () => {
    emit('update:currentActive', "seeNoUser");
}
const verifyDate = () => {
    emit('update:currentActive', "verifyDate");
}
const verifyJoin = () => {
    emit('update:currentActive', "verifyJoin");
};
const searchdata = () => {
    emit('update:currentActive', "searchdata");
};
const searchtotal = () => {
    emit('update:currentActive', "searchtotal");
};
const allboard = () => {
    emit('update:currentActive', "allboard");
};
const addboard = () => {
    emit('update:currentActive', "addboard");
};

</script>

<style lang="scss" scoped>
.btn-group {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-inline: 24px;
    text-align: center;
    padding: 16px;

    button {
        display: flex;
        align-items: center;
        padding: 4px 16px;
        border: 1px solid black;

        i {
            font-size: 12px;
            padding-right: 12px;
        }

        &:last-child {
            margin-left: auto;
        }
    }
}

.group-list {
    padding-inline: 24px;
    width: 80%;
    margin: auto;
    margin-block: 16px;

    >div {
        display: flex;
        justify-content: space-between;
        text-align: center;

        >button {
            width: calc(100% / 3);
            padding: 3px 8px;
            border: 1px solid black;

            &:hover {
                color: rgb(157, 255, 138);
            }
        }
    }
}

.activeColor {
    background: black;
    color: white;
}

@media screen and (max-width: 768px) {
    .btn-group {
        gap: 0;
        padding-inline: 0;

        span {
            display: none;
        }

        button {
            padding: 12px;

            i {
                font-size: 16px;
                padding-right: 0;
            }
        }
    }

    .group-list {
        padding-inline: 0;
        width: 100%;
        margin-block: 8px;

        span {
            display: none;
        }
    }
}
</style>