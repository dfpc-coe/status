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
        <div class='row row-cards'>
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
                                        class="status-indicator status-indicator-animated"
                                        :class='{
                                            "status-green": service.health === "green",
                                            "status-orange": service.health === "yellow",
                                            "status-red": service.health === "red",
                                        }'
                                    >
                                        <span class="status-indicator-circle"></span>
                                        <span class="status-indicator-circle"></span>
                                        <span class="status-indicator-circle"></span>
                                    </span>

                                    <span class='mx-2 subheader' v-text='service.name'/>
                                </div>
                                <div class='ms-auto d-flex'>
                                    <div
                                        v-for='day in service.dates'
                                        v-tooltip='`${day.date.toLocaleString("default", { month: "long" })} ${day.date.getUTCDate()} UTC`'
                                        @click='individual = `${day.date.getUTCFullYear()}-${day.date.getUTCMonth() + 1}-${day.date.getUTCDate()}`'
                                        class='date rounded cursor-pointer'
                                        :class='{
                                            "bg-green": day.health === "green",
                                            "bg-orange": day.health === "yellow",
                                            "bg-red": day.health === "red"
                                        }'
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
            <div v-if='individual' class='card'>
                <div class='card-header'>
                    <div class='card-title' v-text='individual + " Incidents"'></div>
                    <div class='ms-auto'>
                        <TablerIconButton
                            title='Close'
                            @click='individual = undefined'
                        >
                            <IconX :size='32' stroke='1'/>
                        </TablerIconButton>
                    </div>
                </div>
                <div class='card-body'>
                    <TablerNone label='Incidents' :create='false'/>
                </div>
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
import type { Static } from '@sinclair/typebox';
import { Issue, Health } from '../types.ts'
import {
    TablerNone,
    TablerLoading,
    TablerMarkdown,
    TablerIconButton
} from '@tak-ps/vue-tabler';
import {
    IconX,
    IconRefresh,
    IconAlertTriangle,
    IconCircleCheck
} from '@tabler/icons-vue';

const globalHealth = ref(Health.GREEN);
const requestDate = ref(new Date());
const loading = ref(true);
const individual = ref<string | undefined>();

onMounted(async () => {
    await refresh();
})

const config = ref<Config>({
    services: []
})

function healthVerb(health: string) {
    if (health === Health.YELLOW) {
        return 'degraded'
    } else if (health === Health.RED) {
        return 'impacted'
    } else if (health === Health.GREEN) {
        return 'healthy'
    } else {
        return 'unknown';
    }
}

async function refresh() {
    loading.value = true;

    globalHealth.value = Health.GREEN

    const res = await fetch(window.location.pathname + 'config.json');
    config.value = await res.json() as Config;

    for (const service of config.value.services) {
        service.health = Health.GREEN;

        const dates: Map<string, {
            health: string;
            date: Date;
        }> = new Map();

        const today = new Date();

        for (let i = 0; i < 30; i++) {
            const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
            dates.set(`${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`, { health: Health.GREEN, date });
        }

        for (const issueid of service.issues) {
            const issue = await fetchIssue(config.value.repo, issueid);

            if (!issue.end) {
                if (["green", "yellow"].includes(globalHealth.value) && issue.severity === "red") {
                    globalHealth.value = "red";
                } else if (["green"].includes(globalHealth.value) && issue.severity === "yellow") {
                    globalHealth.value = "yellow";
                }

                if (["green", "yellow"].includes(service.health) && issue.severity === "red") {
                    service.health = "red";
                } else if (["green"].includes(service.health) && issue.severity === "yellow") {
                    service.health = "yellow";
                }
            }

            for (const day of daysBetween(issue.start, issue.end)) {
                // We only display the last 30 days, ignore days before this
                const serviceDate = dates.get(day);
                if (!serviceDate) continue;

                if (["green", "yellow"].includes(serviceDate.health) && issue.severity === "red") {
                    serviceDate.health = "red";
                } else if (["green"].includes(serviceDate.health) && issue.severity === "yellow") {
                    serviceDate.health = "yellow";
                }
            }
        }

        service.dates = Array.from(dates.values()).reverse();
    }

    loading.value = false;
}

async function fetchIssue(repo, issueid): Promise<Static<typeof Issue>> {
    const res = await fetch(`https://api.github.com/repos/${repo}/issues/${issueid}`)

    const issue = await res.json()

    return {
        start: issue.created_at,
        end: issue.closed_at,
        body: issue.body
    };
}

function daysBetween(startDate: string, endDate?: string): Array<string> {
    const currentDate = new Date(startDate);
    const endDateCopy = endDate ? new Date(endDate) : new Date();
    endDateCopy.setHours(23, 59, 59, 0);

    const dates = [];
    while (currentDate <= endDateCopy) {
        dates.push(`${currentDate.getUTCFullYear()}-${currentDate.getUTCMonth() + 1}-${currentDate.getUTCDate()}`);
        currentDate.setDate(currentDate.getDate() + 1);
    }
    console.error(dates);

    return dates;
}

</script>
