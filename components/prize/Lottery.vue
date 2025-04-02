<template>
    <div class="wheel-container">
        <button @click="spinWheel" :disabled="!canSpin"
            :style="{ backgroundColor: !canSpin ? '#cccccc' : '#ff6600', color: !canSpin ? '#666666' : '#fff' }">開始抽獎</button>
        <canvas ref="drawRef" width="600" height="600"></canvas>
    </div>
</template>

<script setup>
import gsap from "gsap";
import axios from "axios";
const { $swal } = useNuxtApp();

const drawRef = ref(null);
const users = useState("users")
const lotteryList = useState('lottery'); // 抽獎名單
const choosePrize = useState("choosePrize") // 選擇獎項
const canSpin = useState("canSpin", () => false); // 轉盤開關 true=可按  false=不可
const getUserById = (id) => {
    return users.value.find(user => user.id == id);
};

// 劃出轉盤
const drawWheel = () => {
    const canvas = drawRef.value;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // 動態設置畫布大小
    const canvasWidth = window.innerWidth * 0.8;  // 設定為螢幕寬度的 80%
    const canvasHeight = window.innerHeight * 0.6;  // 設定為螢幕高度的 60%
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const numPrizes = lotteryList.value.length;
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
        ctx.fillText(getUserById(lotteryList.value[i].id).username, radius * 0.6, 10);
        ctx.restore();
    }
};
const dataLock = useState("dataLock")

const rotation = ref(0);

const spinWheel = () => {
    if (!canSpin.value) return;
    canSpin.value = false; //轉動中,按鈕不可使用

    const canvas = drawRef.value;
    const numPrizes = lotteryList.value.length;

    if (!numPrizes) {
        $swal.fire({
            title: '請重新再試',
            icon: "error",
            timer: 1500,
            showConfirmButton: false
        });

    }

    const anglePerPrize = 360 / numPrizes;

    const spins = Math.floor(Math.random() * 5) + 3; // Random spins between 3-7
    const stopAt = Math.floor(Math.random() * 360);
    const initialRotation = 720; // 至少都先轉兩圈
    const finalRotation = initialRotation + spins * 360 + stopAt;

    // 使用 gsap 進行動畫，旋轉畫布
    gsap.to(canvas, {
        rotation: finalRotation,
        duration: 3,
        ease: "power4.out",
        onComplete: async () => {
            const finalIndex = Math.floor((360 - (finalRotation % 360)) / anglePerPrize);
            const selectedPrize = lotteryList.value[(finalIndex + 1) % lotteryList.value.length];
            try {
                await addAwardee(selectedPrize.id);
                console.log("獎品發放成功");
            } catch (error) {
                console.error("Error adding awardee:", error);
            } finally {
                canSpin.value = true;
                console.log("轉動結束，按鈕已重置");
            }
        }
    });
};

// add中獎人
const addAwardee = async (uid) => {
    try {
        const response = await axios.post('/api/awardee', {
            pid: choosePrize.value,
            uid: uid,
            type: 'add'
        })

        if (response.data.success) {
            $swal.fire({
                title: response.data.message,
                icon: "success",
            });
            dataLock.value = true
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
            title: error.response?.data?.message || 'Please try again',
            icon: "error",
            timer: 1500,
            showConfirmButton: false
        });
    }
}


onMounted(() => {
    if (canSpin.value) {
        window.addEventListener('resize', drawWheel);
    }
});
watch(() => lotteryList.value, () => {
    drawWheel();
},
    { deep: true }
);
</script>

<style lang="scss" scoped>
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
</style>