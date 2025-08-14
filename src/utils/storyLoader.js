/**
 * 故事数据加载工具
 * 用于从本地JSON文件加载故事数据
 */

// 缓存已加载的故事数据
let cachedStoryData = null;

/**
 * 加载本地故事数据
 * @returns {Promise<Array>} 故事数据数组
 */
async function loadLocalStoryData() {
  if (cachedStoryData) {
    return cachedStoryData;
  }
  
  try {
    const response = await fetch('/story.json');
    if (!response.ok) {
      throw new Error(`无法加载故事数据: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    cachedStoryData = data.stories; // 注意这里的变化，我们需要访问stories数组
    return cachedStoryData;
  } catch (error) {
    console.error('加载故事数据失败:', error);
    throw error;
  }
}

/**
 * 获取特定故事的所有场景
 * @param {string} storyId 故事ID
 * @returns {Promise<Array>} 故事场景数组
 */
async function getStoryScenes(storyId) {
  try {
    const allData = await loadLocalStoryData();
    return allData.filter(scene => scene.story_id === storyId);
  } catch (error) {
    console.error(`获取故事 ${storyId} 的场景失败:`, error);
    throw error;
  }
}

/**
 * 获取所有故事的基本信息
 * @returns {Promise<Array>} 故事基本信息数组
 */
async function getStoriesList() {
  try {
    const allData = await loadLocalStoryData();
    
    // 提取不同的story_id
    const storyIds = [...new Set(allData.map(scene => scene.story_id))];
    
    // 为每个故事ID创建一个基本信息对象
    return storyIds.map(id => {
      // 找到该故事的第一个场景，通常包含标题等信息
      const firstScene = allData.find(scene => scene.story_id === id);
      
      return {
        id,
        title: firstScene?.title || `故事 ${id}`,
        description: firstScene?.description || '一个互动故事',
        // 可以添加更多字段
      };
    });
  } catch (error) {
    console.error('获取故事列表失败:', error);
    throw error;
  }
}

export { loadLocalStoryData, getStoryScenes, getStoriesList };