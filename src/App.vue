<script setup>
import websocketService from '@/websocket';

import { RouterLink, RouterView } from 'vue-router'

import { ref, onMounted, onBeforeUnmount  } from 'vue';

import player from './components/player.vue'

import queue from './components/queue.vue';

import './assets/main.css'

// Создаем реактивную переменную для хранения значения поиска
const searchQuery = ref('');
const showDropdown = ref(false);
const results = ref();

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
        case 'search':
          results.value = message.results;
          break
        default:
          break;
    }
};

onMounted(() => {
  websocketService.connect();
  websocketService.addListener(handleMessage);
});

onBeforeUnmount(() => {
  websocketService.removeListener(handleMessage);
});

// Обработчик отправки формы
const handleSubmit = () => {
  if (searchQuery.value === '') {
    return;
  }
  const jsLinkPattern = /^https?:\/\/.+/i;
  if (jsLinkPattern.test(searchQuery.value)) {
    const url = searchQuery.value.split("?");
    websocketService.send('add', { thisId: false, text: url[0] });
    searchQuery.value = '';
  } else {
    websocketService.send('search', { text: searchQuery.value });
  }
  results.value = '';
};

const clickAudioTitle = (id) => {
  websocketService.send('add', {thisId: true, text: id});
  results.value = '';
  searchQuery.value = '';
  showDropdown.value = false;
} 

</script>

<template>
  <header>
    <nav class="navbar bg-body-tertiary">
      <div class="container-fluid justify-content-center">
        <form @submit.prevent="handleSubmit" class="d-flex" role="search">
          <queue></queue>
          <input
            class="form-control me-2"
            type="text"
            placeholder="Search"
            aria-label="Search"
            v-model="searchQuery"
            @keydown.enter="handleEnter"
            @click="showDropdown = true"
          />
          <button class="btn btn-outline-success" type="submit">Search</button>
        </form>
      </div>
    </nav>
  </header>
  <body>
    <div v-if="showDropdown" class="d-flex justify-content-center">
      <div class="dropdown-menu show w-100">
        <button @click="showDropdown = false;" class="btn btn-danger m-2">Close</button>
        <a v-for="item in results"
          class="dropdown-item"
          @click="clickAudioTitle(item.id)"
          >
            {{ item.author }} - {{ item.title }}
        </a>
      </div>
    </div>
    <player></player>
  </body>
</template>
