<template>
    <div class="battle-container">
        <h3>上周戰場出席</h3>
        <Doughnut ref="chartRef" :data="chartData" :options="chartOptions" />
    </div>
</template>

<script setup>
import { Doughnut } from 'vue-chartjs';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const chartRef = ref(null)
const datas = ref([0, 0, 0])

const chartData = ref({
    labels: ['出席', '未出席', '請假'],
    datasets: [
        {
            label: 'Person',
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
    try {
        const response = await axios.get("/api/total-chart");
        if (response.data.success) {
            datas.value = response.data.data
        }
    } catch (error) {
        console.error('保存失敗', error);
    };
}

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
.battle-container {
    min-width: 150px;
    height: 250px;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>