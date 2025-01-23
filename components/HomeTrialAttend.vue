<template>
    <div class="trial-container">
        <h3>昨日試煉出席</h3>
        <Doughnut ref="chartRef" :data="chartData" :options="chartOptions" />
    </div>
</template>

<script setup>
import axios from 'axios';
import { Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const chartRef = ref(null)
const datas = ref([0, 0])

const chartData = ref({
    labels: ['出席', '未出席'],
    datasets: [
        {
            label: 'Person',
            data: datas.value,
            backgroundColor: ['#8DDE92', '#FFC8C9'],
            borderWidth: 1,
        },
    ],
});

const chartOptions = ref({
    responsive: true,
    plugins: {
        legend: {
            position: 'top',
            labels: {
                font: {
                    size: 14,
                },
            },
        },
        tooltip: {
            enabled: true,
        },
    },
    font: {
        size: 10,
    },
});

// 抓取資料
const fetchData = async () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    try {
        const response = await axios.post("/api/search", { date: yesterday });
        if (response.data.success) {
            const ptrue = response.data.data.trianY.length;
            const pfalse = response.data.data.trianN.length;
            datas.value = [ptrue, pfalse]

        }
    } catch (error) {
        console.error('保存失敗', error);
    };
};

watch(datas, async () => {
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
.trial-container {
    min-width: 150px;
    height: 250px;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>