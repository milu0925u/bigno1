<template>
    <div v-if="isClient">
        <ManagerNavbar :current-active="currentActive" @update:currentActive="updateCurrentActive" />
        <div class="container" v-if="currentActive === 'allprize'">
            <div class="content">
                <div class="header">
                    <div>獎項名稱</div>
                    <div>得獎人數</div>
                    <div>相關內容</div>
                    <div>得獎</div>
                </div>
                <div class="body" v-for="prize in datas" :key="prize.pid">
                    <div>{{ prize.pname }}</div>
                    <div>{{ prize.limit }}</div>
                    <div>{{ prize.content }}</div>
                    <button @click="openModel = true">查看</button>
                    <div v-if="openModel" class="overlay" @click="openModel = false"></div>
                    <div class="awardee-person" v-if="openModel">
                        <div>
                            <button @click="openModel = false" class="cancle"><i class="fa-solid fa-xmark"></i></button>
                            <div class="header grid">
                                <div>得獎人</div>
                                <div>得獎日期</div>
                            </div>
                            <div v-for="award in prize.awardees" :key="award.aid" class="grid awardees">
                                <div>{{ getUserById(award.uid).username }}</div>
                                <div>{{ new Date(award.createdate).toISOString().split('T')[0] }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="container" v-else-if="currentActive === 'addprize'">
        <div class="create">
            <div><label>名稱：</label><input type="text" v-model="formData.pname" /></div>
            <div class="radio">
                <label>領獎人數：</label>
                <div>多人<input type="radio" name="awardee" v-model="formData.repeat" :value="true" />一人<input
                        type="radio" name="awardee" v-model="formData.repeat" :value="false" /></div>
            </div>
            <div v-if="formData.repeat">可獲得人數：<input type="number" v-model="formData.limit" /></div>
            <div><label>內容：</label><input type="text" v-model="formData.content" /></div>

            <button class="btn" @click="sendCreatePrize">送出</button>

        </div>
    </div>
    <div class="container" v-else>
        <div class="select">
            <select v-model="selectPid">
                <option v-for="(item, i) in filteredPrizes" :key="i" :value="item.pid">
                    {{ item.pname }}
                </option>
            </select>
            <button class="btn" @click="sendFetchAwardee">確定</button>
        </div>
        <div class="wheel-container">
            <canvas ref="wheelCanvas" width="600" height="600"></canvas>
            <button @click="spinWheel" :disabled="isSpinning">開始抽獎</button>
        </div>
    </div>
</template>

<script setup>
import ManagerNavbar from '~/components/ManagerNavbar.vue';
import axios from "axios";
import gsap from "gsap";
const { $swal } = useNuxtApp();
const currentActive = ref("allprize"); // 接收子層組件
const updateCurrentActive = (newValue) => {
    currentActive.value = newValue;
};
const users = useState("users")

const openModel = ref(false);

const datas = ref([]);
const fetchData = async () => {
    try {
        const [prizesResponse, awardeeResponse] = await Promise.all([
            axios.get("/api/prizes"),
            axios.get("/api/awardee")
        ]);

        let allPrize = []
        if (prizesResponse.data.success) {
            allPrize = prizesResponse.data.data;
            allPrize.forEach(prize => { prize.awardees = [] });
        }
        if (awardeeResponse.data.success) {
            let allAwardee = awardeeResponse.data.data;
            allAwardee.forEach(awardee => {
                const prize = allPrize.find(prize => prize.pid === awardee.pid);
                if (prize) {
                    prize.awardees.push(awardee);
                }
            });
        }
        datas.value = allPrize;
    } catch (error) {
        $swal.fire({
            title: error.message,
            icon: "error",
            timer: 1500,
            showConfirmButton: false
        });
    }
};
// 創建獎項
const formData = ref({ pname: '', repeat: false, limit: 1, content: '' });
const sendCreatePrize = async () => {
    if (!formData.value.pname) {
        $swal.fire({
            title: '請輸入獎項名稱',
            icon: "warning",
            timer: 1500,
            showConfirmButton: false
        });
        return
    }

    if (!formData.value.content) {
        $swal.fire({
            title: '請選擇內容',
            icon: "warning",
            timer: 1500,
            showConfirmButton: false
        });
        return
    }
    try {
        const response = await axios.post('/api/prizes', formData.value);
        if (response.data.success) {
            fetchData();
            $swal.fire({
                title: response.data.message,
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });
        }
    } catch (error) {
        $swal.fire({
            title: 'Please try again',
            icon: "error",
            timer: 1500,
            showConfirmButton: false
        });
    }
};
// 取得名稱
const getUserById = (uid) => {
    return users.value.find(user => user.id == uid);
};

// select抽獎選項
const filteredPrizes = computed(() => {
    return datas.value
        .filter(prize => !prize.hidden)
        .map(prize => ({
            pid: prize.pid,
            pname: prize.pname,
            content: prize.content
        }));
});
// 選擇後,所有剩下得抽獎者
const sendFetchAwardee = async () => {
    try {
        const response = await axios.post('/api/awardee', { pid: selectPid.value, type: 'getawardee' });
        if (response.data.success) {
            awardee.value = response.data.data
        }
    } catch (error) {
        console.log(error, 'error');
        $swal.fire({
            title: 'Please try again',
            icon: "error",
            timer: 1500,
            showConfirmButton: false
        });
    }
}
const selectPid = ref("null"); //選擇獎勵

// 轉盤抽獎
const wheelCanvas = ref(null);  //畫布
const isSpinning = ref(false); //轉盤開關
const awardee = ref([]); //抽獎人

const drawWheel = () => {
    const canvas = wheelCanvas.value;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // 動態設置畫布大小
    const canvasWidth = window.innerWidth * 0.8;  // 設定為螢幕寬度的 80%
    const canvasHeight = window.innerHeight * 0.6;  // 設定為螢幕高度的 60%
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const numPrizes = awardee.value.length;
    const angleStep = (2 * Math.PI) / numPrizes;

    // 計算圓心和半徑
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const radius = Math.min(canvasWidth, canvasHeight) * 0.4;  // 半徑設為畫布大小的 40%

    // 繪製輪盤
    for (let i = 0; i < numPrizes; i++) {
        const startAngle = i * angleStep;
        const endAngle = startAngle + angleStep;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.fillStyle = i % 2 === 0 ? "#ffcc00" : "#ff6600";
        ctx.fill();
        ctx.stroke();

        // 繪製獎品名稱
        ctx.save();
        ctx.fillStyle = "#fff";
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + angleStep / 2);
        ctx.font = "14px Arial";
        ctx.fillText(awardee.value[i].username, radius * 0.6, 10);
        ctx.restore();
    }
};
// 當按鈕點擊時觸發的轉動邏輯
const spinWheel = () => {
    if (isSpinning.value) return;
    isSpinning.value = true;

    const canvas = wheelCanvas.value;
    const numPrizes = awardee.value.length;
    const anglePerPrize = 360 / numPrizes;

    // 計算隨機選中的獎品的角度
    const randomIndex = Math.floor(Math.random() * numPrizes);
    const targetAngle = 360 * 5 - (randomIndex * anglePerPrize); // 讓選中的 index 停在最上方

    // 計算畫布的轉動角度
    gsap.set(canvas, { rotation: 0 });

    // 使用 gsap 進行動畫，旋轉畫布
    gsap.to(canvas, {
        rotation: targetAngle,
        duration: 3,
        ease: "power4.out",
        onComplete: async () => {
            isSpinning.value = false;
            await addAwardee(awardee.value[randomIndex].id)
        }
    });
};

// const drawWheel = () => {
//     const canvas = wheelCanvas.value;
//     if (!canvas) return;

//     wheelCtx = canvas.getContext("2d");
//     const numPrizes = awardee.value.length;

//     const angleStep = (2 * Math.PI) / numPrizes;

//     for (let i = 0; i < numPrizes; i++) {
//         const startAngle = i * angleStep;
//         const endAngle = startAngle + angleStep;
//         wheelCtx.beginPath();
//         wheelCtx.moveTo(300, 300);
//         wheelCtx.arc(300, 300, 300, startAngle, endAngle);
//         wheelCtx.fillStyle = i % 2 === 0 ? "#ffcc00" : "#ff6600";
//         wheelCtx.fill();
//         wheelCtx.stroke();

//         // 繪製獎品名稱
//         wheelCtx.save();
//         wheelCtx.fillStyle = "#fff";
//         wheelCtx.translate(300, 300);
//         wheelCtx.rotate(startAngle + angleStep / 2);
//         wheelCtx.font = "14px Arial";
//         wheelCtx.fillText(awardee.value[i].username, 200, 10);
//         wheelCtx.restore();
//     }
// };
// const spinWheel = () => {
//     if (isSpinning.value) return;
//     isSpinning.value = true;

//     const numPrizes = awardee.value.length;
//     const randomIndex = Math.floor(Math.random() * numPrizes);
//     const anglePerPrize = 360 / numPrizes;

//     const targetAngle = 360 * 5 - (randomIndex * anglePerPrize); // 讓選中的 index 停在最上方

//     // **重置角度，確保轉盤每次都從 0 開始**
//     gsap.set(wheelCanvas.value, { rotation: 0 });

//     gsap.to(wheelCanvas.value, {
//         rotation: targetAngle,
//         duration: 3,
//         ease: "power4.out",
//         onComplete: async () => {
//             isSpinning.value = false;
//             await addAwardee(awardee.value[randomIndex].id)
//         }
//     });
// };
// 新增中獎人
const addAwardee = async (id) => {
    try {
        const response = await axios.post('/api/awardee', {
            pid: selectPid.value,
            uid: id,
            type: 'add'
        });
        if (response.data.success) {
            await sendFetchAwardee();
            await fetchData();
            $swal.fire({
                title: response.data.message,
                icon: "success",
            });
        }
        if (!response.data.success) {
            $swal.fire({
                title: response.data.message,
                icon: "error",
                timer: 1500,
                showConfirmButton: false
            });
        }
    } catch (error) {
        console.log(error, 'error');
        $swal.fire({
            title: 'Please try again',
            icon: "error",
            timer: 1500,
            showConfirmButton: false
        });
    }
}


watch(awardee, () => {
    drawWheel();
});
const isClient = ref(false);
onMounted(() => {
    isClient.value = true; // 客戶端渲染後顯示內容
    fetchData();
    drawWheel();
    window.addEventListener('resize', drawWheel);
});

definePageMeta({
    middleware: ['manager', 'check-login']
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
                white-space: nowrap;
                /* 禁止換行 */
                overflow: hidden;
                /* 隱藏超出部分 */
                text-overflow: ellipsis;
                /* 超出部分顯示省略號 */
                padding: 8px;
            }

            .awardee-person {
                position: absolute;
                top: 0;
                bottom: 0;
                left: 0;
                right: 0;
                width: 100%;
                height: 100%;
                background: rgba(88, 88, 88, 0.4);
                display: flex;
                justify-content: center;
                align-items: center;

                >div {
                    position: relative;
                    z-index: 2;
                    background: rgba(255, 255, 255, 1);
                    padding: 16px;
                    width: 500px;
                    height: 300px;
                    color: black;

                    .cancle {
                        position: absolute;
                        right: 5px;
                        top: 5px;
                        color: red;
                        font-size: 18px;
                    }
                }

                .awardees {
                    position: relative;
                    z-index: 8;
                    background: rgba(255, 255, 255, 0.5);
                    height: 30px;
                    color: black;
                }

                .grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                }
            }

            .overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0, 0, 0, 0.5);
                z-index: 1;
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

    .create {
        >div {
            margin: 16px;
        }

        >div:not(.btn-group) {
            display: flex;
            align-items: center;
            gap: 6px;
            height: 36px;
        }

        label {
            width: 100px;
            text-align: right;
            display: inline-block;
        }

        input[type="text"],
        input[type="number"] {
            width: auto;
            padding: 6px 4px;
        }

        .radio {
            >div {
                width: 50%;
                display: flex;
                justify-content: space-between;
            }
        }

        input[type="radio"] {
            transform: scale(1.5);
        }
    }

    .select {
        width: 80%;
        display: flex;
        gap: 16px;

        select {
            width: 80%;
            padding: 6px 16px;
        }

        button {
            width: 50px;
        }
    }
}


.wheel-container {
    text-align: center;


    button {
        padding: 10px 20px;
        font-size: 18px;
        background-color: #ff6600;
        color: white;
        border: none;
        cursor: pointer;
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