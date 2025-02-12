<template>
    <div class="container">
        <div class="content">
            <div v-if='loading' class="loading">
                <Loading />
            </div>
            <div v-else>
                <Line ref="chartRef" :data="chartData" :options="chartOptions" />
            </div>
            <button @click="goToHome">返回</button>
        </div>
    </div>
</template>

<script setup>
import axios from 'axios';
import Loading from "~/components/Loading.vue"
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale } from 'chart.js';
ChartJS.register(LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale);

const user = useState('user');
const loading = ref(true)

const chartRef = ref(null)
const datas = ref({ label: [], data: [] })
const chartData = ref({
    labels: datas.value.label,
    datasets: [
        {
            label: '人數',
            data: datas.value.data,
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        },
    ],
});

const chartOptions = ref({
    responsive: true,
    scales: {
        x: {
            type: 'category',
            title: {
                display: true,
                text: '日期',
            },
        },
        y: {
            min: 0,
            title: {
                display: true,
                text: '值',
            },
        },
    },
    plugins: {
        legend: {
            display: false,
        },
        tooltip: {
            enabled: true,  // 启用工具提示
            mode: 'index',  // 设置提示模式
        },
    },

});
// 回首頁
const goToHome = () => {
    navigateTo('/')
};

const fetchData = async () => {
    try {
        const response = await axios.patch("/api/user", { uid: user.value.id });
        if (response.data.success) {
            datas.value.label = response.data.label;
            datas.value.data = response.data.data;
            loading.value = false;
        }
    } catch (error) {
        console.error('保存失敗', error);
    };
}

watch([user, datas, loading], async () => {
    await nextTick(() => {
        if (chartRef.value && chartRef.value.chart) {
            chartRef.value.chart.data.datasets[0].data = datas.value.data;
            chartRef.value.chart.data.labels = datas.value.label;
            chartRef.value.chart.update(); // 強制更新圖表
        }
    }, { immediate: true });
});

onMounted(() => {
    fetchData();
});

definePageMeta({
    middleware: 'check-login'
});
</script>

<style lang="scss" scoped></style>