<template>
    <div class="container">
        <div class="content">
            <div class="color-block red">
                <span>騎士</span>
                <div v-for="auser in a" :key="auser.id">{{ auser.username }}</div>
            </div>
            <div class="color-block green">
                <span>獵人</span>
                <div v-for="buser in b" :key="buser.id">{{ buser.username }}</div>
            </div>
            <div class="color-block blue">
                <span>法師</span>
                <div v-for="cuser in c" :key="cuser.id">{{ cuser.username }}</div>
            </div>
            <div class="color-block purple">
                <span>刺客</span>
                <div v-for="duser in d" :key="duser.id">{{ duser.username }}</div>
            </div>
            <div class="color-block gray">
                <span>鐵匠</span>
                <div v-for="euser in e" :key="euser.id">{{ euser.username }}</div>
            </div>
            <div class="color-block yellow">
                <span>服事</span>
                <div v-for="fuser in f" :key="fuser.id">{{ fuser.username }}</div>
            </div>
        </div>
        <div>總共:{{ totalLength }}人</div>
        <button @click="goToHome">返回</button>
    </div>
</template>

<script setup>
import { fetchAllUsers } from '../store/st_user';

const users = useState("users");
const a = ref([]);
const b = ref([]);
const c = ref([]);
const d = ref([]);
const e = ref([]);
const f = ref([]);

const totalLength = computed(() =>
    a.value.length + b.value.length + c.value.length + d.value.length + e.value.length + f.value.length
);

// 回首頁
const goToHome = () => {
    navigateTo('/')
};

watch(() => users.value, () => {
    if (!users?.value || users.value.length === 0) return fetchAllUsers();

    a.value = users.value.filter(v => v.verify && v.job == '騎士');
    b.value = users.value.filter(v => v.verify && v.job == '獵人');
    c.value = users.value.filter(v => v.verify && v.job == '法師');
    d.value = users.value.filter(v => v.verify && v.job == '刺客');
    e.value = users.value.filter(v => v.verify && v.job == '鐵匠');
    f.value = users.value.filter(v => v.verify && v.job == '服事');

}, { immediate: true });


definePageMeta({
    middleware: 'check-login'
});
</script>

<style lang="scss" scoped>
.container {
    width: 100%;
    height: 100%;

    .content {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 16px;
        font-size: 12px;

        .color-block {
            display: flex;
            flex-direction: column;
            gap: 6px;
            padding: 24px 12px;
            border-radius: 8px;
            margin-block: 1rem;

            span {
                border-radius: 4px;
                width: 40px;
                text-align: center;
                padding: 3px 8px;
            }

            >div {
                width: 150px;
                border: 1px solid rgba(171, 171, 235, 0.5);
                border-radius: 6px;
                background: white;
                padding: 8px 12px;
            }
        }

        .red {
            --color: 255, 210, 210;
            background: rgba(var(--color), 0.5);

            span {
                background: rgba(var(--color), 1);
            }

            >div {
                border: 1px solid rgba(var(--color), 1);
            }
        }

        .green {
            --color: 193, 255, 228;
            background: rgba(var(--color), 0.5);

            span {
                background: rgba(var(--color), 1);
            }

            >div {
                border: 1px solid rgba(var(--color), 1);
            }
        }

        .blue {
            --color: 210, 233, 255;
            background: rgba(var(--color), 0.5);

            span {
                background: rgba(var(--color), 1);
            }

            >div {
                border: 1px solid rgba(var(--color), 1);
            }
        }

        .purple {
            --color: 211, 221, 255;
            background: rgba(var(--color), 0.5);

            span {
                background: rgba(var(--color), 1);
            }

            >div {
                border: 1px solid rgba(var(--color), 1);
            }
        }

        .gray {
            --color: 208, 208, 208;
            background: rgba(var(--color), 0.5);

            span {
                background: rgba(var(--color), 1);
            }

            >div {
                border: 1px solid rgba(var(--color), 1);
            }
        }

        .yellow {
            --color: 255, 244, 193;
            background: rgba(var(--color), 0.5);

            span {
                background: rgba(var(--color), 1);
            }

            >div {
                border: 1px solid rgba(var(--color), 1);
            }
        }
    }

    >button {
        position: absolute;
        top: 8px;
        right: 16px;
        width: 30px;
        text-align: center;
        font-size: 12px;
        border: 1px solid black;
        padding: 4px 8px;


        background: linear-gradient(135deg, transparent 50%, #c5cfff 50%);
        background-size: 300% 300%;
        background-position: 0% 0%;
        border-radius: 8px;
        cursor: pointer;
        transition: background-position 0.4s ease-in-out;

        &:hover {
            background-position: 100% 100%;
            color: rgb(148, 148, 148);

        }
    }
}

@media screen and (max-width: 768px) {
    .container {
        margin-top: 40px;

        .content {
            flex-direction: column;
            gap: 0px;

            .color-block {
                position: relative;
                flex-direction: row;
                flex-wrap: wrap;
                padding: 48px 12px 24px 12px;
                margin-block: 4px;

                span {
                    position: absolute;
                    top: 12px;
                    left: 12px;
                }

                >div {
                    width: 150px;
                    border: 1px solid rgba(171, 171, 235, 0.5);
                    border-radius: 6px;
                    background: white;
                    padding: 8px 12px;
                }
            }

            .red {
                --color: 255, 210, 210;
                background: rgba(var(--color), 0.5);

                span {
                    background: rgba(var(--color), 1);
                }

                >div {
                    border: 1px solid rgba(var(--color), 1);
                }
            }

            .green {
                --color: 193, 255, 228;
                background: rgba(var(--color), 0.5);

                span {
                    background: rgba(var(--color), 1);
                }

                >div {
                    border: 1px solid rgba(var(--color), 1);
                }
            }

            .blue {
                --color: 210, 233, 255;
                background: rgba(var(--color), 0.5);

                span {
                    background: rgba(var(--color), 1);
                }

                >div {
                    border: 1px solid rgba(var(--color), 1);
                }
            }

            .purple {
                --color: 211, 221, 255;
                background: rgba(var(--color), 0.5);

                span {
                    background: rgba(var(--color), 1);
                }

                >div {
                    border: 1px solid rgba(var(--color), 1);
                }
            }

            .gray {
                --color: 208, 208, 208;
                background: rgba(var(--color), 0.5);

                span {
                    background: rgba(var(--color), 1);
                }

                >div {
                    border: 1px solid rgba(var(--color), 1);
                }
            }

            .yellow {
                --color: 255, 244, 193;
                background: rgba(var(--color), 0.5);

                span {
                    background: rgba(var(--color), 1);
                }

                >div {
                    border: 1px solid rgba(var(--color), 1);
                }
            }
        }

        >button {
            position: absolute;
            top: 8px;
            right: 16px;
            width: 30px;
            text-align: center;
            font-size: 12px;
            border: 1px solid black;
            padding: 4px 8px;


            background: linear-gradient(135deg, transparent 50%, #c5cfff 50%);
            background-size: 300% 300%;
            background-position: 0% 0%;
            border-radius: 8px;
            cursor: pointer;
            transition: background-position 0.4s ease-in-out;

            &:hover {
                background-position: 100% 100%;
                color: rgb(148, 148, 148);

            }
        }
    }

}
</style>