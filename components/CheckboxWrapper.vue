<template>
    <fieldset id="switch" class="radio-input">
        <div>
            <input class="input" type="radio" name="radio" v-model="checkedValue" value="all">
            <label>全部</label>
        </div>
        <div>
            <input class="input" type="radio" name="radio" v-model="checkedValue" value="optional">
            <label>自選排除</label>
        </div>
        <div><input class="input" type="radio" name="radio" v-model="checkedValue" value="battlefield">
            <label>出席戰場</label>
        </div>
    </fieldset>
</template>

<script setup>
const props = defineProps({
    selectedValue: {
        type: String,
        default: 'all',
    },
});

const emit = defineEmits(['update:selectedValue']);

const checkedValue = computed({
    get: () => props.selectedValue,
    set: (value) => emit('update:selectedValue', value),
});


</script>


<style lang="scss" scoped>
.radio-input {
    >div {
        display: flex;
        align-items: center;
        padding: 0px 8px;
    }
}

/* From Uiverse.io by adeladel522 */
.input {
    -webkit-appearance: none;
    /* remove default */
    display: block;
    margin: 10px;
    width: 24px;
    height: 24px;
    border-radius: 12px;
    cursor: pointer;
    vertical-align: middle;
    box-shadow: hsla(0, 0%, 100%, .15) 0 1px 1px, inset hsla(0, 0%, 0%, .5) 0 0 0 1px;
    background-color: hsla(0, 0%, 0%, .2);
    background-image: -webkit-radial-gradient(hsla(200, 100%, 90%, 1) 0%, hsla(200, 100%, 70%, 1) 15%, hsla(200, 100%, 60%, .3) 28%, hsla(200, 100%, 30%, 0) 70%);
    background-repeat: no-repeat;
    -webkit-transition: background-position .15s cubic-bezier(.8, 0, 1, 1),
        -webkit-transform .25s cubic-bezier(.8, 0, 1, 1);
    outline: none;
}

.input:checked {
    -webkit-transition: background-position .2s .15s cubic-bezier(0, 0, .2, 1),
        -webkit-transform .25s cubic-bezier(0, 0, .2, 1);
}

.input:active {
    -webkit-transform: scale(1.5);
    -webkit-transition: -webkit-transform .1s cubic-bezier(0, 0, .2, 1);
}



/* The up/down direction logic */

.input,
.input:active {
    background-position: 0 24px;
}

.input:checked {
    background-position: 0 0;
}

.input:checked~.input,
.input:checked~.input:active {
    background-position: 0 -24px;
}
</style>