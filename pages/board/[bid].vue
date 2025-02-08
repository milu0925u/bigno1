<template>
    <div class="container">
        <div class="content">
            <div class="title">{{title}}</div>
            <Editer ref="deltaContent" :isViewing="isViewing" />
        </div>
        <div class="content-reply"> 
            <div class="reply">
                <div><b>玩家A</b><p>待新增回應貼文!!!!</p></div>
                <div><b>玩家C</b><p>測試</p></div>
                <div><b>玩家B</b><p>測試測試</p></div>
                <div><b>玩家G</b><p>太測試</p></div>
                <div><b>玩家D</b><p>測試</p></div>
         </div>
         <div class="text-btn">
                <input type="text" />
                <button class="btn">傳送</button>
            </div>
        </div>    
        <div class="btn-group">
            <button class="btn" @click="goToHome">返回</button>
        </div>
    </div>
</template>

<script setup>
import axios from "axios";
import Editer from '~/components/Editer.vue';
import { useRoute } from 'vue-router';
const user = useState('user');
const route = useRoute();

const title = ref('');
const deltaContent = ref(null); //  存放 Delta 格式內容
const isViewing = ref(true); // 編輯狀態

const fetchData = async () => {
    const bid = route.params.bid;
        try {
            const response = await axios.get(`/api/board/${bid}`);
            if (response.data.success) {
                title.value = response.data.data.title;
                deltaContent.value?.setEditorContent(response.data.data.content)

            }
        } catch (error) {
            toast.error(response.data.message)
        };
    }

// 回首頁
const goToHome = () => {
    navigateTo('/')
};


// 監聽路由變更
watch(() => [route.params.bid], (newBid) => {
    if (newBid) fetchData();
}, { immediate: true });


</script>

<style lang="scss" scoped>
.container{
    --background:rgba(131, 211, 212, 1);
    --title:rgba(29, 82, 83, 1);
    --text:rgba(145, 12, 7, 1);
    --border:rgba(108, 167, 168, 1);
    margin-inline:auto;
    width:90%;
    background:var(--background);
    display:flex;
    padding:24px;
    position: relative;
    .content{
        width:75%;
        background:#FCFCFC;
        >div{
            border-style: solid;
            border-color: var(--border);
            &:first-child{
                border-width: 2px 2px 0 2px;
            }
            &:last-child{
            border-width: 0 2px 2px 2px;
            }
        }
        .text-btn{
            margin-top:auto;
        }
    };
    .content-reply{
        flex:1;
        display:flex;
        flex-direction: column;
        justify-content: space-between;
        padding-left:16px;
        input[type="text"]{
            width:100%;
            padding:8px 8px;
            margin-block:4px;
            border:1px solid var(--border);
        }
        button{
            background:var(--title);
        }
        .reply{
        display:flex;
        flex-direction: column;
        gap:6px;
        font-size:12px; 
        margin-top:80px;
            >div{
            border:1px solid var(--border);
            border-radius: 8px;
            width:100%;
            padding:12px 16px;
            background:#FCFCFC;
            }
        }
    }
    
    .title{
    display: flex;
    justify-content: space-between;
    padding: 8px 12px;
    height:50px;
    color:white;
    align-items: center;
    background:	var(--title);
    }
    .btn-group{
    position: absolute;
    display:flex;
    gap:16px;
    button{
    width:80px;
    height:25px;
    }
    top:24px;
    right:24px;
    }
}

@media screen and (max-width: 768px) {
    .container{
        width:100%;
        margin:0;
        padding-top:4rem;
        flex-direction: column;
        .content{
            width:100%;
            margin-bottom:16px;
        }
        .content-reply{
            padding:0;
        }
        .btn-group{
            height:50px;
            top:16px;
           right:26px;
            button{
            font-size:12px;
            width:50px;
            height:24px;
            }
    }
    }
}
</style>