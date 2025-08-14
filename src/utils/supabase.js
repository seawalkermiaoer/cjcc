import { createClient } from '@supabase/supabase-js'

// 获取环境变量，如果不存在则使用默认值
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://example.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'example-anon-key'

// 创建Supabase客户端
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 检查Supabase连接是否有效
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Supabase连接错误:', error.message)
  } else {
    console.log('Supabase连接成功')
  }
})

export default supabase
