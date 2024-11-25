<script setup>
import { ref,onMounted } from 'vue'
import supabase from '../utils/supabase'

const list = ref([])

async function getTodoList() {
  const { data } = await supabase.from('todos').select('*')

  list.value = data
}

onMounted(() => {
  getTodoList()
})

</script>

<template>
  <ul>
    <li v-for="n in list" :key="n.id" > {{ n.title }}</li>
  </ul>
</template>

<style scoped>

</style>
