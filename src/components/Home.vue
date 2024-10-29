<template>
<div class='page-body'>
    <div class='col-12 d-flex align-items-center justify-content-center py-4'>
        <img src='/logo.png' alt='COTAK Logo' height='128' width='128'/>
    </div>

    <div class='py-4'>
        <div class='col-12 d-flex align-items-center justify-content-center'>
            <IconCircleCheck :size='64' stoke='1' color='green'/>
        </div>
        <div class='col-12 d-flex align-items-center justify-content-center'>
            <h1>All services are online</h1>
        </div>
        <div class='col-12 d-flex align-items-center justify-content-center'>
            <span class='subheader'>As of October 29, 5:45 PM CET</span>
        </div>
    </div>

    <div class='container-xl pt-4'>
        <div class='card'>
            <div class='card-header'>
                <div class='card-title'>Services</div>
            </div>
            <div class='card-body'>
                <template v-for='service in services'>
                    <div class='col-12 pb-2'>
                        <div class='d-flex align-items-center'>
                            <div class='d-flex align-items-center'>
                                <span class="status-indicator status-green status-indicator-animated">
                                    <span class="status-indicator-circle"></span>
                                    <span class="status-indicator-circle"></span>
                                    <span class="status-indicator-circle"></span>
                                </span>

                                <span class='mx-2 subheader' v-text='service.name'/>
                            </div>
                            <div class='ms-auto d-flex'>
                                <div
                                    v-for='date in dates'
                                    v-tooltip='date'
                                    class='date bg-green rounded'
                                    style='
                                        width: 12px;
                                        height: 32px;
                                        margin-right: 1px;
                                    '
                                />
                            </div>
                        </div>
                    </div>
                </template>
            </div>
        </div>
    </div>
</div>
</template>

<style>
.date:hover {
    filter: saturate(0.25);
}
</style>

<script setup lang='ts'>
import { ref, computed } from 'vue';
import {
    IconCircleCheck
} from '@tabler/icons-vue';

const dates = computed(() => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 30; i++) {
        const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        dates.push(date);
    }

    return dates;
});

const services = ref([{
    name: 'COTAK.gov'
},{
    name: 'TAK Server'
}]);

</script>
