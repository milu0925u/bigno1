<template>
    <div class="trial-container">
        <Doughnut ref="chartRef" :data="chartData" :options="chartOptions" />
    </div>
</template>

<script setup>
import { ref, onMounted, watchEffect, nextTick } from 'vue';
import axios from 'axios';
import { Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// 註冊 Chart.js 插件
ChartJS.register(ArcElement, Tooltip, Legend);

// 定義 chartRef 來引用圖表實例
const chartRef = ref(null);

// 定義圖表數據
const datas = ref([0, 0]);

// API 請求獲取資料
const fetchData = async () => {
    try {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        const response = await axios.post('/api/search', { date: today });
        if (response.data.success) {

            datas.value = [response.data.data.trianY.length, response.data.data.trianN.length];
        }
    } catch (error) {
        console.log(error, 'err是啥');
    }
};

// 定義圖表數據和配置
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
onMounted(() => {
    fetchData();
});

</script>

<style scoped>
.trial-container {
    min-width: 150px;
    height: 250px;
}
</style>