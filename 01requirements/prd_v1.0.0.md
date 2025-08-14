# 中国古代故事互动绘本游戏

这是一个基于Web的互动绘本游戏，讲述中国古代故事，包括《张良纳履》和《诸葛亮舌战群儒》等经典故事。

## 项目特点

- 多个经典中国故事的互动版本
- 故事选择界面，可以选择不同的故事进行阅读
- 每个故事分为多个章节，有不同的选择和结局
- 响应式设计，适配桌面和移动设备
- 精美的SVG插图
- 使用Supabase存储故事数据


CREATE TABLE stories (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  cover_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE story_details (
  id TEXT PRIMARY KEY REFERENCES stories(id),  -- 关联到故事列表的外键
  story JSONB NOT NULL,                          -- 存储故事章节、选择等详细内容
  gameover JSONB,                                -- 存储游戏结束条件
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),  -- 创建时间
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()   -- 更新时间
);