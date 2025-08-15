<script setup>
import { ref } from 'vue'
import StoryList from './components/StoryList.vue'
import InteractiveStory from './components/InteractiveStory.vue'

const currentInteractiveStoryId = ref(null)
const viewMode = ref('list') // 'list', 'interactive'

function selectInteractiveStory(storyId) {
  currentInteractiveStoryId.value = storyId
  viewMode.value = 'interactive'
}

function backToList() {
  currentInteractiveStoryId.value = null
  viewMode.value = 'list'
}
</script>

<template>
  <div class="container">
    <div class="main-content">
      <h1 class="title">选择一个故事</h1>
      
      <StoryList 
        v-if="viewMode === 'list'" 
        @select-interactive-story="selectInteractiveStory"
      />
      
      <InteractiveStory 
        v-else-if="viewMode === 'interactive'" 
        :story-id="currentInteractiveStoryId" 
        @back-to-list="backToList"
      />
    </div>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Ma Shan Zheng', cursive, 'Noto Sans SC', sans-serif;
  background: linear-gradient(135deg, #7ee8fa 0%, #80ff72 100%);
  color: #333;
  line-height: 1.6;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
}

.main-content {
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  padding: 2rem;
  width: 100%;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.title {
  text-align: center;
  color: #ff6b9d;
  margin-bottom: 2rem;
  font-size: 2.2rem;
  position: relative;
  display: block;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
}

.title::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, transparent, #ff6b9d, transparent);
}

@media (max-width: 768px) {
  .container {
    padding: 10px;
  }
  
  .main-content {
    padding: 20px;
  }
  
  .title {
    font-size: 1.5rem;
  }
}
</style>
