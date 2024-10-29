<template>
<div class='page-body'>
    <div class='col-12 d-flex align-items-center justify-content-center py-4'>
        <img src='/logo.png' alt='COTAK Logo' height='128' width='128'/>
    </div>

    <div class='py-4'>
        <div class='col-12 d-flex align-items-center justify-content-center'>
            <TablerLoading v-if='loading' desc=''/>
            <template v-else>
                <IconCircleCheck v-if='globalHealth === "green"' :size='64' stoke='1' color='#2fb344'/>
                <IconAlertTriangle v-else :size='64' stoke='1' :color='globalHealth === "yellow" ? "#f76707" : "#d63939"'/>
            </template>
        </div>
        <div class='col-12 d-flex align-items-center justify-content-center'>
            <h1 class='user-select-none'>
                <span v-if='globalHealth === "green"'>All services are </span>
                <span v-else>Some services are </span>
                <span v-if='loading'>...</span>
                <span v-else v-text='healthVerb(globalHealth)'/>
            </h1>
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
                <template v-else v-for='service in config.services'>
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
import { ref, computed, onMounted } from 'vue';
import {
    TablerLoading,
    TablerIconButton
} from '@tak-ps/vue-tabler';
import {
    IconRefresh,
    IconAlertTriangle,
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

const globalHealth = ref('green'); // green, yellow, red
const requestDate = ref(new Date());
const loading = ref(true);

type Service = {
    id: string;
    name: string;
};

type Config = {
    services: Service[]
}

onMounted(async () => {
    await refresh();
})

const config = ref<Config>({
    services: []
})

function healthVerb(health: string) {
    if (health === 'yellow') {
        return 'degraded'
    } else if (health === 'red') {
        return 'impacted'
    } else if (health === 'green') {
        return 'healthy'
    } else {
        return 'unknown';
    }
}

async function refresh() {
    loading.value = true;
    const res = await fetch(window.location.pathname + 'config.json');
    config.value = await res.json() as Config;

    for (const service of config.value.services) {
        for (const issue of service.issues) {
            if (!issue.end) {
                if (["green", "yellow"].includes(globalHealth.value) && issue.severity === "red") {
                    globalHealth.value = "red";
                } else if (["green"].includes(globalHealth.value) && issue.severity === "yellow") {
                    globalHealth.value = "yellow";
                }
            }
        }
    }

    loading.value = false;
}
</script>
