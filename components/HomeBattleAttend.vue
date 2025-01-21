<template>
    <div class="battle-container">
        尚未完成
        <!-- <Doughnut :data="chartData" :options="chartOptions" /> -->
    </div>
</template>

<script setup>
import { Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { fetchChartData } from '~/store/st_user.js';
ChartJS.register(ArcElement, Tooltip, Legend);
// 定義 chartRef 來引用圖表實例
const chartRef = ref(null);
// 定義圖表數據
const datas = ref([0, 0, 0]);
// API 請求獲取資料

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
        },
        tooltip: {
            enabled: true,
        },
    },
});

watch(datas, async () => {
    // 等待 Vue 完成 DOM 更新
    await nextTick(() => {
        // 確保 chartRef 存在並能更新
        if (chartRef.value && chartRef.value.chart) {
            chartRef.value.chart.data.datasets[0].data = datas.value; // 更新圖表數據
            chartRef.value.chart.update(); // 強制更新圖表
        }
    });
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