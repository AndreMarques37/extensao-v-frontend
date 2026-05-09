
<template>
  <q-page class="q-pa-md">
    <q-list bordered separator>
      <q-item v-for="servico in servicos" :key="servico.id" tag="label">
        <q-item-section side>
          <q-checkbox v-model="servico.selecionado" color="primary" />
        </q-item-section>

        <q-item-section>
          <q-item-label>{{ servico.nome }}</q-item-label>
          <q-item-label caption>R$ {{ servico.preco }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>

    <div class="q-mt-md text-h6 text-right">
      Total Selecionado: R$ {{ somaTotal }}
      <q-btn 
        color="positive" 
        class="full-width q-mt-md" 
        label="Avançar para Agendamento"
        :badge="`R$ ${somaTotal}`"
        @click="irParaAgendamento"
      />
      <q-btn 
        color="red" 
        class="full-width q-mt-md" 
        label="Cancelar"
        @click="cancelarAgendamento"
      />
/>
    </div>
  </q-page>
</template>


<script setup>

import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const irParaAgendamento = () => {
  router.push({ 
    path: '/agendamento', 
    query: { 
      total: somaTotal.value, 
      servicos: selecionados.value.join(',') 
    } 
  })
}

const cancelarAgendamento = () => {
  router.push({ 
    path: '/dashboard', 
  })
}

    const servicos = ref([
    {
      id: 1,
      nome: 'Design de Sobrancelhas',
      preco: 40,
      selecionado: false,
      icon: 'mdi-brush',
    },
    {
      id: 2,
      nome: 'Design com Tintura ou Henna',
      preco: 45,
      selecionado: false,
      icon: 'mdi-brush',
    },
    {
      id: 3,
      nome: 'Reconstrução de Sobrancelhas',
      preco: 50,
      selecionado: false,
      icon: 'mdi-brush',
    },
    {
      id: 4,
      nome: 'Depilação Axilas',
      preco: 25,
      selecionado: false,
      icon: 'mdi-brush',
    },
    {
      id: 5,
      nome: 'Depilação Buço',
      preco: 20,
      selecionado: false,
      icon: 'mdi-brush',
    },
    {
      id: 6,
      nome: 'Depilação Braço',
      preco: 25,
      selecionado: false,
      icon: 'mdi-brush',
    },
    {
      id: 7,
      nome: 'Depilação Costas',
      preco: 35,
      selecionado: false,
      icon: 'mdi-brush',
    },
    {
      id: 8,
      nome: 'Depilação Coxa',
      preco: 30,
      selecionado: false,
      icon: 'mdi-brush',
    },
    {
      id: 9,
      nome: 'Depilação Canela',
      preco: 25,
      selecionado: false,
      icon: 'mdi-brush',
    },
    {
      id: 10,
      nome: 'Depilação Virilha',
      preco: 40,
      selecionado: false,
      icon: 'mdi-brush',
    },
    {
      id: 11,
      nome: 'Spa dos Pés',
      preco: 60,
      selecionado: false,
      icon: 'mdi-brush',
    },
   ])

   const somaTotal = computed(() => {
  return servicos.value
    .filter(elemento => elemento.selecionado === true) 
    .reduce((acc, elemento) => acc + elemento.preco, 0) 
})
const selecionados = computed(() => {
  return servicos.value
    .filter(elemento => elemento.selecionado === true) 
    .map(elemento => elemento.nome) 
})

</script>
