<template>
    <div>
        <ManagerNavbar :current-active="currentActive" @update:currentActive="updateCurrentActive" />
        <div class="container" v-if="currentActive === 'searchdata'">
            <div class="search-date">
                搜尋日期：<input type="date" v-model="selectedDate" /><button class="edit-btn"
                    @click="fetchSearch">搜尋</button>
            </div>
            <div class="content">
                <div v-if="data?.battleY?.length || 0">
                    <h4 class="title">戰場出席:{{ data.battleY.length || 0 }}</h4>
                    <div v-for="a in data?.battleY" :key="a.id">{{ getUserById(a.uid)?.username }}</div>
                </div>
                <div v-if="data?.battleN?.length || 0">
                    <h4 class="title">戰場未出席:{{ data?.battleN?.length || 0 }}</h4>
                    <div v-for="b in data?.battleN" :key="b.id">{{ getUserById(b.uid)?.username }}</div>
                </div>
                <div v-if="data?.dayoff?.length || 0">
                    <h4 class="title">戰場請假:{{ data?.dayoff?.length || 0 }}</h4>
                    <div v-for="c in data?.dayoff" :key="c.id">{{ getUserById(c.uid)?.username }}</div>
                </div>
                <div v-if="data?.trianY?.length || 0">
                    <h4 class="title">試煉出席:{{ data?.trianY?.length || 0 }}</h4>
                    <div v-for="d in data?.trianY" :key="d.id">{{ getUserById(d.id)?.username }}</div>
                </div>
                <div v-if="data?.trianN?.length || 0">
                    <h4 class="title">試煉未出席:{{ data?.trianN?.length || 0 }}</h4>
                    <div v-for="e in data?.trianN" :key="e.id">{{ getUserById(e.id)?.username }}</div>
                </div>
            </div>
        </div>
        <div class="container" v-else>
            <div class="hint">
                <div><input type="checkbox" :checked="true" :disabled="true" /> = 出席</div>
                <div><input type="checkbox" :checked="false" :disabled="true" /> = 未出席</div>
                <div><i class="fa-solid fa-xmark red"></i> = 未加入</div>
            </div>
            <div class="table">
                <div class="flex-d title-d">
                    <div>
                        <div>名稱</div>
                    </div>
                    <div v-for="(day, i ) in data2.days" :key="i">
                        <div>{{ day }}</div>
                    </div>
                </div>
                <div v-for="d in data2.data" :key="d.id" class="flex-d">
                    <div>{{ getUserById(d.uid)?.username }}</div>
                    <div v-for="item in d.attendance" :key="i">
                        <div v-if="item === 'nodata'"><i class="fa-solid fa-xmark red"></i></div>
                        <input v-else type="checkbox" :checked="item" :disabled="true" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import ManagerNavbar from '~/components/ManagerNavbar.vue';
import axios from "axios";
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
            if (response.data.data.trianY.length === 0 &&
                response.data.data.trianN.length === 0 &&
                response.data.data.battleN.length === 0 &&
                response.data.data.battleY.length === 0 &&
                response.data.data.dayoff.length === 0
            ) {
                toast.error("查無資料");
            }
            data.value = response.data.data;
        }
    } catch (error) {
        toast.error("請重新再試！");
    }
};
const data2 = ref({ data: [], days: [] });
const fetchSearchTotal = async () => {
    try {
        const response = await axios.get("/api/search");
        if (response.data.success) {
            data2.value = response.data.data;
        } else {
            toast.error(response.data.message);
        }
    } catch (error) {
        console.log(error.error);
        toast.error(error.message);

    }
};


// 取得名稱
const getUserById = (uid) => {
    return users.value.find(user => user.id == uid);
};



onMounted(() => {
    fetchSearchTotal();
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
    gap: 24px;

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

.flex-d {
    margin-block: 8px;
    display: flex;

    >:first-child {
        width: 150px;
    }

    >:not(:first-child) {
        width: 30px;
    }
}

.title-d {
    font-size: 10px;
}

input[type="checkbox"] {
    width: 20px;
    height: 20px;
    appearance: none;
    border: 2px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
    position: relative;
    transition: background-color 0.3s, border-color 0.3s;

    &:checked {
        border-color: #00ff80;

        &::after {
            content: "";
            position: absolute;
            font-size: 16px;
            width: 100%;
            height: 100%;
            background-color: #00ff80;
        }

        &:not(:checked) {
            background-color: white;
        }
    }
}

.flex-col {
    height: 32px;
    display: flex;
    gap: 16px;
    align-items: center;
    white-space: nowrap;
    margin-block: 16px;


    input {
        width: 50%;
        height: 100%;
    }
}

.table {
    width: 80%;
    overflow-y: auto;
}

.hint {
    display: flex;
    align-items: center;
    gap: 32px;
}

.red {
    color: red;
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