<template>
    <div>
        <ManagerNavbar :current-active="currentActive" @update:currentActive="updateCurrentActive" />
        <div class="container" v-if="currentActive === 'searchdata'">
            <div class="search-date">
                搜尋日期：<input type="date" v-model="selectedDate" /><button class="edit-btn"
                    @click="fetchSearch">搜尋</button>
            </div>
            <div class="content">
                <div>
                    <h4 class="title">戰場出席:{{ data?.battleY?.length || 0 }}</h4>
                    <div v-for="a in data?.battleY" :key="a.id">{{ getUserById(a.uid)?.username }}</div>
                </div>
                <div>
                    <h4 class="title">戰場未出席:{{ data?.battleN?.length || 0 }}</h4>
                    <div v-for="b in data?.battleN" :key="b.id">{{ getUserById(b.uid)?.username }}</div>
                </div>
                <div>
                    <h4 class="title">戰場請假:{{ data?.dayoff?.length || 0 }}</h4>
                    <div v-for="c in data?.dayoff" :key="c.id">{{ getUserById(c.uid)?.username }}</div>
                </div>
                <div>
                    <h4 class="title">試煉出席:{{ data?.trianY?.length || 0 }}</h4>
                    <div v-for="d in data?.trianY" :key="d.id">{{ getUserById(d.id)?.username }}</div>
                </div>
                <div>
                    <h4 class="title">試煉未出席:{{ data?.trianN?.length || 0 }}</h4>
                    <div v-for="e in data?.trianN" :key="e.id">{{ getUserById(e.id)?.username }}</div>
                </div>
            </div>
        </div>
        <div class="container" v-else>
            <div class="content2">
                <div>
                    <h4 class="title">請假次數前10位</h4>
                    <div v-for="a in getdata?.dayoffperson" :key="a._id" class="flex">

                        <span>{{ getUserById(a._id)?.username }}</span>
                        <span>{{ a.count }}次</span>
                    </div>
                </div>
                <div>
                    <h4 class="title">試煉缺席前10位</h4>
                    <div class="flex-col">查詢月份：<input type="month" v-model="selectedDate" /><button class="edit-btn"
                            @click="fetchFivePerson">送出</button></div>
                    <div v-for="b in data2" :key="b.id" class="flex">
                        <span>{{ getUserById(b.id)?.username }}</span>
                        <span>{{ b.count }}次</span>
                    </div>
                </div>
                <div>
                    <h4 class="title">戰場缺席前10位</h4>
                    <div class="flex-col"></div>
                    <div v-for="c in getdata?.battleperson" :key="c._id" class="flex">
                        <span>{{ getUserById(c._id)?.username }}</span>
                        <span>{{ c.count }}次</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import ManagerNavbar from '~/components/ManagerNavbar.vue';
import axios from "axios";
import { useToast } from 'vue-toastification';
const toast = useToast();

const currentActive = ref("searchdata"); // 接收子層組件
const updateCurrentActive = (newValue) => {
    currentActive.value = newValue;
};

const selectedDate = ref(null);
const users = useState("users")
const data = ref(null);
const fetchSearch = async () => {
    try {
        const response = await axios.post("/api/search", { date: selectedDate.value });
        if (response.data.success) {
            data.value = response.data.data;
            toast.success(response.data.message);
        } else {
            toast.error(response.data.message);
        }
    } catch (error) {
        toast.error("錯誤");
    }
};
const data2 = ref(null);
const fetchFivePerson = async () => {
    try {
        const response = await axios.patch("/api/search", { date: selectedDate.value });
        if (response.data.success) {
            data2.value = response.data.data;
            toast.success(response.data.message);
        } else {
            toast.error(response.data.message);
        }
    } catch (error) {
        toast.error("錯誤", error);
    }
};
const getdata = ref(null);
const getData = async () => {
    try {
        const response = await axios.get("/api/search");
        if (response.data.success) {
            getdata.value = response.data.data;
        } else {
            toast.error(response.data.message);
        }
    } catch (error) {
        toast.error("錯誤");
    }
};

// 取得名稱
const getUserById = (uid) => {
    return users.value.find(user => user.id == uid);
};


onMounted(() => {
    getData();
});
</script>



<style lang="scss" scoped>
.container {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;

    .content {
        width: 70%;
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 24px;

        .title {
            text-align: center;
            box-shadow: 0 1px black;
        }

    }

    .content2 {
        width: 80%;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 24px;

        .title {
            text-align: center;
            box-shadow: 0 1px black;
        }

    }
}

.search-date {
    width: 80%;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    white-space: nowrap;

    input {
        width: 500px;
        height: 36px;
        padding: 24px;
        border-radius: 12px;
    }

}

.edit-btn {
    border: 1px solid black;
    padding: 4px 8px;

    &:active {
        transform: translateY(2px);
    }
}

.flex {
    margin-block: 16px;
    display: flex;
    justify-content: space-between;
}

.flex-col {
    height: 32px;
    display: flex;
    gap: 16px;
    align-items: center;
    white-space: nowrap;

    input {
        width: 50%;
        height: 100%;
    }
}


@media screen and (max-width: 768px) {
    .container {
        .content {
            display: flex;
            flex-direction: column;
        }
    }
}
</style>