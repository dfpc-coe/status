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
            <h1 class='user-select-none'>All services are online</h1>
        </div>
        <div class='col-12 d-flex align-items-center justify-content-center'>
            <span class='subheader user-select-none'>As of <span v-text='requestDate'/></span>
        </div>
    </div>

    <div class='container pt-4'>
        <div class='card'>
            <div class='card-header'>
                <div class='card-title'>Services</div>
                <div class='ms-auto'>
                    <TablerIconButton
                        title='Refresh'
                        @click='refresh'
                    >
                        <IconRefresh :size='32' stroke='1'/>
                    </TablerIconButton>
                </div>
            </div>
            <div class='card-body'>
                <TablerLoading v-if='loading'/>
                <template v-else v-for='service in services'>
                    <div class='col-12 pb-2'>
                        <div class='d-flex align-items-center'>
                            <div class='d-flex align-items-center'>
                                <span
                                    v-tooltip='"Current Status"'
                                    class="status-indicator status-green status-indicator-animated"
                                >
                                    <span class="status-indicator-circle"></span>
                                    <span class="status-indicator-circle"></span>
                                    <span class="status-indicator-circle"></span>
                                </span>

                                <span class='mx-2 subheader' v-text='service.name'/>
                            </div>
                            <div class='ms-auto d-flex'>
                                <div
                                    v-for='date in dates'
                                    v-tooltip='`${date.toLocaleString("default", { month: "long" })} ${date.getUTCDate()}`'
                                    class='date bg-green rounded cursor-pointer'
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
    TablerLoading,
    TablerIconButton
} from '@tak-ps/vue-tabler';
import {
    IconRefresh,
    IconCircleCheck
} from '@tabler/icons-vue';

const dates = computed(() => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 30; i++) {
        const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        dates.push(date);
    }

    return dates.reverse();
});

const requestDate = ref(new Date());
const loading = ref(false);

const services = ref([{
    name: 'COTAK.gov'
},{
    name: 'TAK Server'
},{
    name: 'Authentication Service'
},{
    name: 'CloudTAK Service'
}]);

async function refresh() {
    loading.value = true;

    loading.value = false;
}
</script>
