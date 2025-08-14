<script setup>
import { ref, onMounted, computed } from 'vue'
import supabase from '../utils/supabase'

const stories = ref([])
const loading = ref(true)
const error = ref(null)
const searchQuery = ref('')

async function fetchStories() {
  try {
    loading.value = true
    
    // 从Supabase获取故事列表
    const { data, error: supabaseError } = await supabase
      .from('stories')
      .select('*')
      .order('id')
    
    if (supabaseError) throw supabaseError
    
    if (data && data.length > 0) {
      stories.value = data
      error.value = null // 清除可能存在的错误
      return
    }
    
    // 如果没有从Supabase获取到数据，使用默认故事数据
    useDefaultStories()
  } catch (err) {
    console.error('Error fetching stories:', err)
    error.value = '获取故事列表失败，使用默认数据'
    useDefaultStories()
  } finally {
    loading.value = false
  }
}

// 如果数据库中没有数据，使用默认故事数据
function useDefaultStories() {
  stories.value = [
    {
      id: 1,
      title: '张良纳履',
      description: '汉初三杰之一张良拾履的故事，讲述了他如何遇到奇人并获得奇书《太公兵法》的传奇经历。',
      cover_image: '/images/zhangliang.svg'
    },
    {
      id: 2,
      title: '诸葛亮舌战群儒',
      description: '三国时期，诸葛亮在江东舌战群儒，说服孙权联合刘备共同抗击曹操的故事。',
      cover_image: '/images/zhugeliang.svg'
    },
    {
      id: 3,
      title: '孟母三迁',
      description: '战国时期，孟母为了给儿子孟轲（孟子）创造良好的学习环境，三次搬家的故事，体现了环境对人成长的重要影响。',
      cover_image: '/images/mengmu.svg'
    }
  ]
}

onMounted(async () => {
  await fetchStories()
  if (stories.value.length === 0) {
    useDefaultStories()
  }
})

const emit = defineEmits(['select-interactive-story'])

function selectInteractiveStory(story) {
  emit('select-interactive-story', story.id)
}

const filteredStories = computed(() => {
  if (!searchQuery.value) return stories.value
  const query = searchQuery.value.toLowerCase()
  return stories.value.filter(story => 
    story.title.toLowerCase().includes(query) || 
    story.description.toLowerCase().includes(query)
  )
})
</script>

<template>
  <div class="story-list">
    <div class="search-container">
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="搜索故事标题或内容..." 
        class="search-input"
      >
      <button class="search-button">搜索</button>
    </div>
    
    <div v-if="loading" class="loading">
      <p>加载中...</p>
    </div>
    
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
    </div>
    
    <div v-else class="stories-grid">
      <div 
        v-for="story in filteredStories" 
        :key="story.id"
        class="story-card"
      >
        <div class="story-image">
          <img v-if="story.cover_image" :src="story.cover_image" :alt="story.title" class="cover-image">
          <!-- 使用默认图片作为占位符 -->
          <div v-else class="placeholder-image"></div>
        </div>
        <div class="story-info">
          <h2>{{ story.title }}</h2>
          <p>{{ story.description }}</p>
          <div class="story-actions">
            <button class="action-button interactive" @click="selectInteractiveStory(story)">
              开始互动
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.story-list {
  width: 100%;
}

.search-container {
  display: flex;
  margin-bottom: 20px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.search-input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 5px 0 0 5px;
  font-size: 1rem;
  outline: none;
  font-family: inherit;
}

.search-button {
  background-color: #ff6b9d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 0 5px 5px 0;
  cursor: pointer;
  font-size: 1rem;
  font-family: inherit;
}

.loading, .error {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
}

.stories-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.story-card {
  display: flex;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  background-color: #fff;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.story-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.story-image {
  width: 150px;
  min-width: 150px;
  background-color: #ff9e80;
  display: flex;
  align-items: center;
  justify-content: center;
}

.story-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-image {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #ff9e80 0%, #ffab91 100%);
  border-radius: 8px 0 0 8px;
}

.story-info {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.story-info h2 {
  margin-top: 0;
  color: #ff6b9d;
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
}

.story-info p {
  color: #666;
  line-height: 1.5;
  font-size: 0.95rem;
  flex: 1;
}

.story-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.action-button {
  background-color: #f8f4e5;
  border: none;
  color: #ff6b9d;
  padding: 8px 15px;
  font-size: 0.9rem;
  cursor: pointer;
  border-radius: 20px;
  transition: all 0.3s;
  font-family: inherit;
  align-self: flex-end;
}

.action-button:hover {
  background-color: #f0e9d2;
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-button.interactive {
  background-color: #ff6b9d;
  color: #fff;
  border: none;
}

.action-button.interactive:hover {
  background-color: #ff4b8d;
}

@media (max-width: 768px) {
  .stories-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .story-card {
    flex-direction: column;
  }
  
  .story-image {
    width: 100%;
    height: 120px;
  }
  
  .search-container {
    flex-direction: column;
    gap: 10px;
  }
  
  .search-input, .search-button {
    border-radius: 5px;
    width: 100%;
  }
}
</style>