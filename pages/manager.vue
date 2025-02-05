<template>
    <div>
        <ManagerNavbar :current-active="currentActive" @update:currentActive="updateCurrentActive" />
        <div class="container">
            <div class="content">
                <div class="header">
                    <div>名稱</div>
                    <div>職業</div>
                    <div class="none">line名稱</div>
                    <div class="none">lineID</div>
                    <div>職位</div>
                    <div class="none">加入時間</div>
                    <div class="none">狀態</div>
                    <div>修改狀態</div>
                </div>

                <div class="body" v-for="user in printUser" :key="user.id">
                    <div v-if="editUser?.id === user.id"><input v-model="editUser.username" type="text" /></div>
                    <div v-else>{{ user.username }}</div>

                    <div v-if="editUser?.id === user.id">
                        <select v-model="editUser.job" placeholder="設定職業" required>
                            <option value="騎士">騎士</option>
                            <option value="法師">法師</option>
                            <option value="獵人">獵人</option>
                            <option value="鐵匠">鐵匠</option>
                            <option value="刺客">刺客</option>
                            <option value="服事">服事</option>
                        </select>
                    </div>
                    <div v-else> {{ user.job }} </div>

                    <div class="none" v-if="editUser?.id === user.id"><input v-model="editUser.lineName" type="text" />
                    </div>
                    <div class="none" v-else> {{ user.lineName }} </div>

                    <div class="none" v-if="editUser?.id === user.id"><input v-model="editUser.lineID" type="text" />
                    </div>
                    <div class="none" v-else> {{ user.lineID }} </div>

                    <div v-if="editUser?.id === user.id">
                        <select v-model="editUser.position" placeholder="設定職位" required>
                            <option value="管理員">管理員</option>
                            <option value="一般成員">一般成員</option>
                        </select>
                    </div>
                    <div v-else> {{ user.position }} </div>

                    <div class="none" v-if="editUser?.id === user.id"><input v-model="editUser.createDate"
                            type="date" /></div>
                    <div class="none" v-else> {{ user.createDate }} </div>

                    <div class="none" v-if="editUser?.id === user.id">
                        <span>
                            <input v-model="editUser.leaveDate" type="date" />
                            <!-- <select v-model="editUser.verify" placeholder="審核加入" required>
                                <option value="true">通過</option>
                                <option value="false">待審核</option>
                                <option value="null">已離開</option>
                            </select> -->
                        </span>
                    </div>
                    <div class="none" v-else>
                        <span :style="{
                            color: user.verify === null ? 'black' : (user.verify === true ? 'green' : 'red')
                        }">
                            {{ user.verify === null ? '已離開' : (user.verify === true ? '正式成員' : '未審核') }}
                        </span>
                    </div>
                    <div v-if="editUser?.id === user.id"><button class="edit-btn" @click="savedata">儲存</button></div>
                    <div v-else-if="editUser?.id !== user.id && editUser"><button></button></div>
                    <div v-else><button v-if="currentActive === 'seeAll'" class="edit-btn"
                            @click="edit(user)">編輯</button></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import ManagerNavbar from '~/components/ManagerNavbar.vue';
import axios from "axios";

import { fetchAllUsers } from '~/store/st_user.js';

import { useToast } from 'vue-toastification';
const toast = useToast();

const currentActive = ref("seeAll");
const updateCurrentActive = (newValue) => {
    currentActive.value = newValue;
};

const users = useState("users")
const printUser = ref([]); //顯示的使用者項目
const editUser = ref(null); // 編輯的項目

// 監控目前位置
watch(
    [currentActive, users],
    ([newCurrentActive, newUsers]) => {
        let filteredUsers;

        if (newCurrentActive === "seeAllcontainLeave") {
            filteredUsers = newUsers?.filter((user) => user.leaveDate);
        } else if (newCurrentActive === "seeNoUser") {
            filteredUsers = newUsers?.filter(
                (user) => user.leaveDate === null && user.verify === false
            );
        } else {
            filteredUsers = newUsers?.filter((user) => user.leaveDate === null);
        }

        // 统一排序逻辑
        printUser.value = filteredUsers?.sort(
            (a, b) => new Date(a.createDate) - new Date(b.createDate)
        );
    },
    { immediate: true, deep: true }
);

const edit = (user) => {
    editUser.value = { ...user };
};
const savedata = async () => {
    try {
        const response = await axios.post("/api/user", { ...editUser.value, type: "update" });
        if (response.data.success) {
            fetchAllUsers();
            editUser.value = null;
            toast.success(response.data.message);
        }
    } catch (error) {
        console.error('保存失敗', error);
    }
};

definePageMeta({
    middleware: ['manager'],  // 只有經過管理員中介層的用戶可以訪問
});

</script>

<style lang="scss" scoped>
.container {
    width: 100%;
    display: flex;
    justify-content: center;


    .content {
        width: 85%;

        .header {
            >div {
                margin-inline: 2px;
                background: rgb(0, 0, 0);
                color: white;
                padding: 6px 4px;
            }
        }

        .body {
            >div {
                white-space: nowrap;
                /* 禁止換行 */
                overflow: hidden;
                /* 隱藏超出部分 */
                text-overflow: ellipsis;
                /* 超出部分顯示省略號 */
            }
        }

        .header,
        .body {
            display: grid;
            grid-template-columns: repeat(8, 1fr);
            padding: 8px;
            text-align: center;

            input,
            select {
                width: 90%;
                height: 100%;
            }
        }
    }
}

.edit-btn {
    border: 1px solid black;
    padding: 4px 8px;

    &:active {
        transform: translateY(2px);
    }
}

@media screen and (max-width: 768px) {
    .none {
        display: none;
    }

    .container {
        .content {
            width: 100%;

            .header,
            .body {
                grid-template-columns: repeat(4, 1fr);
            }
        }
    }
}
</style>