<script setup>
import { ref, onMounted, watch } from 'vue'
import supabase from '../utils/supabase'

const props = defineProps({
  storyId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['back-to-list'])

const storyData = ref(null)
const gameoverData = ref(null) // 存储gameover场景数据
const currentScene = ref(0) // 使用索引而非场景ID
const loading = ref(true)
const error = ref(null)
const storyTitle = ref('')
const isGameover = ref(false) // 标记当前是否为gameover场景

async function fetchStoryData() {
  try {
    loading.value = true
    
    // 直接从story_details表获取故事数据
    const { data: storyDetailData, error: storyDetailError } = await supabase
      .from('story_details')
      .select('*')
      .eq('id', props.storyId)
      .single()
    
    if (storyDetailError) throw storyDetailError
    
    if (storyDetailData) {
      // 从story_details中获取标题，如果没有则使用默认值
      storyTitle.value = storyDetailData.title || '互动故事'
      
      if (storyDetailData.story) {
        // 直接使用story字段中的数组数据
        storyData.value = storyDetailData.story
        // 加载gameover数据
        gameoverData.value = storyDetailData.gameover || {}
        error.value = null // 清除可能存在的错误
        return
      }
    }
    
    // 如果没有从Supabase获取到数据，抛出错误
    throw new Error(`未找到ID为${props.storyId}的故事`)
  } catch (err) {
    console.error('Error fetching story data:', err)
    error.value = '无法加载故事数据'
  } finally {
    loading.value = false
  }
}

function handleChoice(choice) {
  if (choice.consequence === 'exit') {
    emit('back-to-list')
    return
  }
  
  // 重置gameover状态
  isGameover.value = false
  
  // 如果consequence是数字，直接跳转到对应索引的场景
  if (typeof choice.consequence === 'number') {
    currentScene.value = choice.consequence
    return
  }
  
  // 如果consequence是字符串但不是exit，则视为特殊场景名称
  if (typeof choice.consequence === 'string') {
    // 检查是否是gameover场景（以gameOver_开头）
    if (choice.consequence.startsWith('gameOver_') && gameoverData.value && gameoverData.value[choice.consequence]) {
      isGameover.value = true
      currentScene.value = choice.consequence
      return
    }
    
    // 先检查chapter字段
    let sceneIndex = storyData.value.findIndex(scene => 
      scene.chapter && scene.chapter.includes(choice.consequence)
    )
    
    // 如果在chapter中没找到，再检查gameover字段
    if (sceneIndex < 0) {
      sceneIndex = storyData.value.findIndex(scene => 
        scene.gameover && scene.gameover.includes(choice.consequence)
      )
    }
    
    if (sceneIndex >= 0) {
      currentScene.value = sceneIndex
    }
  }
}

onMounted(() => {
  fetchStoryData()
})

watch(() => props.storyId, () => {
  currentScene.value = 0 // 重置为第一个场景
  fetchStoryData()
})
</script>

<template>
  <div class="interactive-story">
    <button class="back-button" @click="emit('back-to-list')">
      &larr; 返回故事列表
    </button>
    
    <h2 class="story-title">{{ storyTitle }}</h2>
    
    <div v-if="loading" class="loading">
      <p>加载中...</p>
    </div>
    
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button class="back-button" @click="emit('back-to-list')">
        返回故事列表
      </button>
    </div>
    
    <!-- 显示普通故事场景 -->
    <div v-else-if="storyData && storyData[currentScene] && !isGameover" class="story-content">
      <div class="story-node">
        <h3 v-if="storyData[currentScene].chapter" class="chapter-title">{{ storyData[currentScene].chapter }}</h3>
        <h3 v-else-if="storyData[currentScene].gameover" class="chapter-title gameover-title">{{ storyData[currentScene].gameover }}</h3>
        <p class="story-text">{{ storyData[currentScene].text }}</p>
        
        <div v-if="storyData[currentScene].image" class="story-image">
          <img :src="storyData[currentScene].image" :alt="storyData[currentScene].chapter || storyData[currentScene].gameover || '故事场景'">
        </div>
        
        <div class="story-choices">
          <button 
            v-for="(choice, index) in storyData[currentScene].choices || []" 
            :key="index"
            class="choice-button"
            @click="handleChoice(choice)"
          >
            {{ choice.text }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- 显示gameover场景 -->
    <div v-else-if="isGameover && gameoverData && gameoverData[currentScene]" class="story-content">
      <div class="story-node">
        <h3 v-if="gameoverData[currentScene].chapter" class="chapter-title">{{ gameoverData[currentScene].chapter }}</h3>
        <h3 v-else class="chapter-title gameover-title">游戏结束</h3>
        <p class="story-text">{{ gameoverData[currentScene].text }}</p>
        
        <div v-if="gameoverData[currentScene].image" class="story-image">
          <img :src="gameoverData[currentScene].image" :alt="gameoverData[currentScene].chapter || '游戏结束'">
        </div>
        
        <div class="story-choices">
          <button 
            v-for="(choice, index) in gameoverData[currentScene].choices || []" 
            :key="index"
            class="choice-button"
            @click="handleChoice(choice)"
          >
            {{ choice.text }}
          </button>
        </div>
      </div>
    </div>
    
    <div v-else class="error">
      <p>无法加载故事内容，请返回故事列表重试</p>
      <button class="back-button" @click="emit('back-to-list')">
        返回故事列表
      </button>
    </div>
  </div>
</template>

<style scoped>
.interactive-story {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fafafa;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.back-button {
  background-color: transparent;
  border: none;
  color: #1cb0f6;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.5rem 0;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  font-family: inherit;
  box-shadow: none;
}

.back-button:hover {
  text-decoration: underline;
}

.story-title {
  color: #58cc02;
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  text-align: center;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 1rem;
}

.loading, .error {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
}

.story-content {
  margin-top: 2rem;
}

.story-node {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.chapter-title {
  color: #58cc02;
  font-size: 1.4rem;
  margin-bottom: 1rem;
  text-align: center;
}

.gameover-title {
  color: #ff4b4b;
  font-weight: bold;
  border-bottom: 2px solid #ff4b4b;
  padding-bottom: 0.5rem;
}

.story-text {
  font-size: 1.2rem;
  line-height: 1.8;
  color: #4b4b4b;
  text-align: justify;
}

.story-image {
  margin: 1rem 0;
  text-align: center;
}

.story-image img {
  max-width: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.story-choices {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.choice-button {
  background-color: #f0f0f0;
  border: 2px solid #e5e5e5;
  color: #4b4b4b;
  padding: 12px 20px;
  margin: 8px 0;
  width: 100%;
  text-align: left;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s;
  font-family: inherit;
}

.choice-button:hover {
  border-color: #1cb0f6;
  background-color: #e8e8e8;
}

.choice-button:active {
  transform: translateY(1px);
}

@media (max-width: 768px) {
  .interactive-story {
    padding: 15px;
  }
  
  .story-title {
    font-size: 1.5rem;
  }
  
  .story-text {
    font-size: 1.1rem;
  }
  
  .choice-button {
    padding: 0.8rem 1.2rem;
    font-size: 1rem;
  }
}
</style>