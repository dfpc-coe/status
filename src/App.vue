<template>
    <div class='page h-100 cloudtak-gradient'>
        <router-view
            @err='err = $event'
        />

        <TablerError
            v-if='err'
            :err='err'
            @close='err = null'
        />
    </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import '@tabler/core/dist/js/tabler.min.js';
import '@tabler/core/dist/css/tabler.min.css';
import {
    TablerError
} from '@tak-ps/vue-tabler';
import { std, stdurl } from './std.ts';

const err = ref<Error | undefined>();

function errorCaptures(err) {
    if (!(err instanceof Error)) {
        err = new Error(String(err));
    }

    const e = err as Error;
    this.err = e;
}
</script>
