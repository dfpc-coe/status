<template>
    <div class='page-body'>
        <div class='col-12 d-flex align-items-center justify-content-center py-4'>
            <img
                src='/logo.png'
                alt='COTAK Logo'
                height='128'
                width='128'
            >
        </div>

        <div class='py-4'>
            <div class='col-12 d-flex align-items-center justify-content-center'>
                <TablerLoading
                    v-if='loading'
                    desc=''
                />
                <template v-else>
                    <IconCircleCheck
                        v-if='globalHealth === "green"'
                        :size='64'
                        stoke='1'
                        color='#2fb344'
                    />
                    <IconAlertTriangle
                        v-else
                        :size='64'
                        stoke='1'
                        :color='globalHealth === "yellow" ? "#f76707" : "#d63939"'
                    />
                </template>
            </div>
            <div class='col-12 d-flex align-items-center justify-content-center'>
                <h1 class='user-select-none'>
                    <span v-if='globalHealth === "green"'>All services are </span>
                    <span v-else>Some services are </span>
                    <span v-if='loading'>...</span>
                    <span
                        v-else
                        v-text='healthVerb(globalHealth)'
                    />
                </h1>
            </div>
            <div class='col-12 d-flex align-items-center justify-content-center'>
                <span class='subheader user-select-none'>As of <span v-text='requestDate' /></span>
            </div>
        </div>

        <div class='container pt-4'>
            <div class='row row-cards'>
                <div class='card'>
                    <div class='card-header'>
                        <div class='card-title'>
                            Services
                        </div>
                        <div class='ms-auto'>
                            <TablerIconButton
                                title='Refresh'
                                @click='refresh'
                            >
                                <IconRefresh
                                    :size='32'
                                    stroke='1'
                                />
                            </TablerIconButton>
                        </div>
                    </div>
                    <div class='card-body'>
                        <TablerLoading v-if='loading' />
                        <template
                            v-for='service in config.services'
                            v-else
                        >
                            <div class='col-12 pb-2'>
                                <div class='d-flex align-items-center'>
                                    <div class='d-flex align-items-center'>
                                        <span
                                            v-tooltip='"Current Status"'
                                            class='status-indicator status-indicator-animated'
                                            :class='{
                                                "status-green": service.health === "green",
                                                "status-orange": service.health === "yellow",
                                                "status-red": service.health === "red",
                                            }'
                                        >
                                            <span class='status-indicator-circle' />
                                            <span class='status-indicator-circle' />
                                            <span class='status-indicator-circle' />
                                        </span>

                                        <span
                                            class='mx-2 subheader'
                                            v-text='service.name'
                                        />
                                    </div>
                                    <div class='ms-auto d-flex'>
                                        <div
                                            v-for='day in service.dates'
                                            v-tooltip='`${day.date.toLocaleString("default", { month: "long" })} ${day.date.getUTCDate()} UTC`'
                                            class='date rounded cursor-pointer'
                                            :class='{
                                                "bg-green": day.health === "green",
                                                "bg-orange": day.health === "yellow",
                                                "bg-red": day.health === "red"
                                            }'
                                            style='
                                            width: 12px;
                                            height: 32px;
                                            margin-right: 2px;
                                        '
                                            @click='serviceDate = day'
                                        />
                                    </div>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>
                <div
                    v-if='serviceDate'
                    class='card'
                >
                    <div class='card-header'>
                        <div
                            class='card-title'
                            v-text='serviceDate.date + " Incidents"'
                        />
                        <div class='ms-auto'>
                            <TablerIconButton
                                title='Close'
                                @click='serviceDate = undefined'
                            >
                                <IconX
                                    :size='32'
                                    stroke='1'
                                />
                            </TablerIconButton>
                        </div>
                    </div>
                    <div class='card-body'>
                        <TablerNone
                            v-if='!serviceDate.issues || serviceDate.issues.length === 0'
                            label='incidents'
                            :create='false'
                        />
                        <template
                            :key='issue.id'
                            v-for='issue in serviceDate.issues'
                            v-else
                        >
                            <h1 v-text='issueMap.get(issue) ? issueMap.get(issue).title : "No Title"' />
                            <TablerMarkdown :markdown='issueMap.get(issue) ? issueMap.get(issue).body : ""' />
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang='ts'>
import { ref, onMounted } from 'vue';
import type { Static } from '@sinclair/typebox';
import { Issue, Health, Config, ServiceDate } from '../types.ts'
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
const serviceDate = ref<Static<typeof ServiceDate> | undefined>();

onMounted(async () => {
    await refresh();
})

const config = ref<Static<typeof Config>>({
    services: []
})

const issueMap: Map<number, Static<typeof Issue>> = new Map();

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
    config.value = await res.json() as Static<typeof Config>;

    for (const service of config.value.services) {
        service.health = Health.GREEN;

        const dates: Map<string, Static<typeof ServiceDate>> = new Map();

        const today = new Date();

        for (let i = 0; i < 30; i++) {
            const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
            dates.set(`${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`, { health: Health.GREEN, date, issues: [] });
        }

        for (const issueid of service.issues) {
            const issue = await fetchIssue(config.value.repo, issueid);

            issueMap.set(issueid, issue);

            if (!issue.end) {
                if (["green", "yellow"].includes(globalHealth.value) && issue.health === Health.RED) {
                    globalHealth.value = "red";
                } else if (["green"].includes(globalHealth.value) && issue.health === Health.YELLOW) {
                    globalHealth.value = "yellow";
                }

                if ([Health.GREEN, Health.YELLOW].includes(service.health) && issue.health === Health.RED) {
                    service.health = Health.RED;
                } else if ([Health.GREEN].includes(service.health) && issue.health === Health.YELLOW) {
                    service.health = Health.YELLOW;
                }
            }

            for (const day of daysBetween(issue.start, issue.end)) {
                // We only display the last 30 days, ignore days before this
                const serviceDate = dates.get(day);
                if (!serviceDate) continue;

                if (!serviceDate.issues.includes(issueid)) {
                    serviceDate.issues.push(issueid);
                }

                if ([Health.GREEN, Health.YELLOW].includes(serviceDate.health) && issue.health === Health.RED) {
                    serviceDate.health = Health.RED;
                } else if ([Health.GREEN].includes(serviceDate.health) && issue.health === Health.YELLOW) {
                    serviceDate.health = Health.YELLOW;
                }
            }
        }

        service.dates = Array.from(dates.values()).reverse();
    }

    loading.value = false;
}

async function fetchIssue(repo, issueid): Promise<Static<typeof Issue>> {
    const url = new URL(`https://api.github.com/repos/${repo}/issues/${issueid}`)
    url.searchParams.append('cacheBuster', +new Date());

    const res = await fetch(`https://api.github.com/repos/${repo}/issues/${issueid}`)

    const issue = await res.json()

    let health = Health.GREEN;

    const labels = issue.labels.map((label) => { return label.description });

    if (labels.includes('red')) health = Health.RED;
    if (labels.includes('yellow')) health = Health.YELLOW;

    return {
        health,
        start: issue.created_at,
        end: issue.closed_at || undefined,
        title: issue.title,
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

    return dates;
}

</script>

<style>
.date:hover {
    filter: saturate(0.25);
}
</style>
