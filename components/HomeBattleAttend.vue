<template>
    <div class="battle-container">
        <div v-if="loading" class="loading">
            <Loading />
        </div>
        <Doughnut v-else ref="chartRef" :data="chartData" :options="chartOptions" />
    </div>
</template>

<script setup>
import { Doughnut } from 'vue-chartjs';
import axios from 'axios';
import Loading from "~/components/Loading.vue"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const loading = useState('loading');
const chartRef = ref(null)
const datas = ref([0, 0, 0])

const chartData = ref({
    labels: ['出席', '未出席', '請假'],
    datasets: [
        {
            label: '人數',
            data: datas.value,
            backgroundColor: ['#8DDE92', '#FFC8C9', '#ABD3D3'],
            borderWidth: 1,
        },
    ],
});

const chartOptions = ref({
    responsive: true,
    plugins: {
        legend: {
            position: 'top',
            title: {
                display: true,
                text: '上週戰場出席',
                font: {
                    size: 16,
                    weight: 'bold',
                },
                color: '#555',
            },
            labels: {
                color: '#555',
                font: {
                    size: 12,
                },
                boxWidth: 12,
                boxHeight: 12,
                padding: 8,
            },
        },
        tooltip: { // 滑鼠移動到上面的提示
            // enabled: true,
            backgroundColor: '#000000',
            titleFont: {
                size: 14,
            },
            bodyFont: {
                size: 12,
            },
        },
    },
});

// 抓取資料
const fetchData = async (retries = 3, delay = 1000) => {
    try {
        const response = await axios.get("/api/total-chart");
        if (response.data.success) {
            datas.value = response.data.data
        }
    } catch (error) {
        console.log(error, "抓取所有成員戰場出席失敗，請重新抓取！");
    if (error.response && error.response.status === 503) {
      console.log(`正在重試... 剩餘次數: ${retries}`);
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay)); // 延遲一段時間
        return fetchAllUsers(retries - 1, delay); // 重新調用函數，減少重試次數
      } else {
        console.log("重試次數已達上限，請稍後再試！");
      }
    }
    };
}

watch([datas, loading], async () => {
    await nextTick(() => {
        if (chartRef.value && chartRef.value.chart) {
            chartRef.value.chart.data.datasets[0].data = datas.value; // 更新圖表數據
            chartRef.value.chart.update(); // 強制更新圖表
        }
    });
});

onMounted(() => {
    fetchData();
});
</script>


<style scoped>
.battle-container {
    min-width: 150px;
    height: 250px;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>