<template>
    <div class="content">
        <div class="header">
            <div>獎項名稱</div>
            <div>得獎人數</div>
            <div>相關內容</div>
            <div>得獎</div>
        </div>
        <div class="body" v-for="prize in allPrize" :key="prize.pid">
            <div>{{ prize.pname }}</div>
            <div>{{ prize.limit }}</div>
            <div>{{ prize.content }}</div>
            <div v-if="prize.awardees && prize.awardees.length">
                <button @click="handleOpenModal(prize.awardees)" class="watch-btn">查看</button>
            </div>
            <span v-else>尚未抽獎</span>
        </div>
    </div>
</template>

<script setup>

const openModal = useState('openModal');
const allPrize = useState('getAllPrize');
const awardees = useState('awardees');
const handleOpenModal = (items) => {
    openModal.value = true;
    awardees.value = items;
};

</script>

<style lang="scss" scoped>
.content {
    width: 90%;

    .header {
        >div {
            margin-inline: 2px;
            background: rgb(0, 0, 0);
            color: white;
            padding: 6px 4px;
        }
    }

    .body {
        display: flex;
        justify-content: center;
        align-items: center;

        >div {
            flex: 1;
            white-space: nowrap;
            /* 禁止換行 */
            overflow: hidden;
            /* 隱藏超出部分 */
            text-overflow: ellipsis;
            /* 超出部分顯示省略號 */
            padding: 8px;
        }

        .watch-btn {
            width: 40%;
            padding: 4px 6px;
            border: 1px dashed rgb(107, 162, 172);
            color: #3cca9b;

            &:hover {
                background: #3cca9b8f;
                color: white;
            }
        }
    }

    .header,
    .body {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        padding: 2px;
        gap: 4px;

        input,
        select {
            width: 90%;
            height: 100%;
        }
    }

}


@media screen and (max-width: 768px) {
    .content {
        width: 100%;

        .header {
            >div {
                margin-inline: 0
            }
        }

        .body {
            >div {
                padding: 2px;
            }

            .watch-btn {
                width: 80%;
            }
        }

        .header,
        .body {
            padding: 0px;
        }
    }

}
</style>