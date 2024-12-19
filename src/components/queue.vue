<script setup>

import { ref, onMounted, onBeforeUnmount } from 'vue';

import websocketService from '@/websocket';

const queueList = ref();

const handleMessage = (data) => {
    const message = JSON.parse(data);
    if (Array.isArray(message)) {
        message.forEach(mes => {
            jsonParse(mes);
        });
    } else {
        jsonParse(message);
    }
};

const jsonParse = (message) => {
    switch(message.type) {
        case 'queue':
            queueList.value = message.items;
            break;
        default:
            break;
    }
};

onMounted(() => {
    websocketService.addListener(handleMessage);
});

onBeforeUnmount(() => {
    websocketService.removeListener(handleMessage);
});

</script>

<template>
    <button 
        class="btn btn-primary me-2" 
        type="button" 
        data-bs-toggle="offcanvas" 
        data-bs-target="#offcanvasExample" 
        aria-controls="offcanvasExample"
        >
        Queue
    </button>
    <div class="offcanvas offcanvas-start" tabindex="-1" id="offcanvasExample" aria-labelledby="offcanvasExampleLabel">
        <div class="offcanvas-header">
            <h5 class="offcanvas-title" id="offcanvasExampleLabel">Queue</h5>
            <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body">
            <p v-for="queue in queueList"
                :class="{'bg-danger': !queue.link, 'bg-success': queue.link}"
                class="rounded p-2 mb-2"
            >{{ queue.author }} - {{ queue.title }}</p>
        </div>
    </div>
</template>