<script setup>

import { ref, onMounted, onBeforeUnmount } from 'vue';

import websocketService from '@/websocket';

const isPlay = ref(false);

const currentTime = ref(0);
const duration = ref(0);
const progress = ref(0);
const author = ref('');
const title = ref('');
const volume = ref(70);

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
        case 'play':
            audioPlayer.src = message.url;
            author.value = message.author; 
            title.value = message.title;
            cover.src = 'https:' + message.cover.replace("%%", "400x400");
            audioPlayer.play();
            break;
        case 'timestamp':
            const timestamp = parseFloat(message.timestamp);
            audioPlayer.currentTime = timestamp;
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

const playClick = () => {
    isPlay.value = !isPlay.value;
    if (isPlay.value) {
        audioPlayer.play();
    } else {
        audioPlayer.pause();
    }
};

const syncClick = () => {
    websocketService.send('sync');
};

const nextClick = () => {
    websocketService.send('next');
};

const seekVolume = () => {
    audioPlayer.volume = volume.value * 0.0025;
};

const updateSlider = () => {
    currentTime.value = audioPlayer.currentTime;
    progress.value = (currentTime.value / duration.value) * 100;
};

const sendNextEnded = () => {
    audioPlayer.src = '';
    author.value = '';
    title.value = '';
    cover.src = '';
    websocketService.send('ended');
};

const sendPlay = () => {
    websocketService.send('play');
    isPlay.value = true;
};

const loadData = () => {
    duration.value = audioPlayer.duration;
    audioPlayer.volume = volume.value * 0.0025;
};

const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours > 0 ? hours + ':' : ''}${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

</script>

<template>
    <audio id="audioPlayer" src=""
        @timeupdate="updateSlider"
        @play="sendPlay"
        @ended="sendNextEnded"
        @loadeddata="loadData">
    </audio>
    <div class="container mt-3">
        <div class="card">
            <div class="card-body">
                <div class="d-flex justify-content-center m-5">
                    <img id="cover" class="rounded border shadow-lg img-fluid" src="" alt="" width="400" height="400">
                </div>
                <div v-if="author === ''">
                    <h5 class="card-title">No audio</h5>
                </div>
                <div v-else>
                    <h5 class="card-title">{{ author }}</h5>
                    <p class="card-text">{{ title }}</p>
                </div>
                <div class="progress mb-3">
                    <div class="progress-bar" role="progressbar" :style="{ width: progress + '%' }" :aria-valuenow="progress" aria-valuemin="0"
                        aria-valuemax="100"></div>
                </div>
                <div class="d-flex justify-content-between">
                    <span id="currentTime">{{ formatTime(currentTime) }}</span>
                    <span id="duration">{{ formatTime(duration) }}</span>
                </div>
                <div class="mt-3 text-center">
                    <button @click="syncClick" class="btn btn-lg btn-secondary me-2"><i class="fas fa-redo"></i></button>
                    <button v-if="isPlay" @click="playClick" class="btn btn-lg btn-primary me-2"><i class="fas fa-pause"></i></button>
                    <button v-else @click="playClick" class="btn btn-lg btn-primary me-2"><i class="fas fa-play"></i></button>
                    <button @click="nextClick" class="btn btn-lg btn-secondary me-2"><i class="fas fa-long-arrow-alt-right"></i></button>
                </div>
                <div class="mt-3 text-center d-none d-md-block">
                    <input @input="seekVolume" v-model="volume" type="range" class="form-range" style="width: 30%;" max="300" >
                </div>
            </div>
        </div>
    </div>
</template>