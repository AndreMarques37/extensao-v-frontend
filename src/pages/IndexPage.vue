<template>

  <q-page class="servicos-page q-pa-md">

    <q-card class="servicos-card">
      <div class="form-header">
        <div class="form-header-icon">
          <q-icon name="spa" size="22px" />
        </div>
        <div>
          <div class="form-titulo">Selecione os Serviços</div>
          <div class="form-subtitulo">
            {{ selecionados.length }} selecionado(s) ·
            <span class="form-total">{{ somaFormatada }}</span>
          </div>
        </div>
      </div>

      <q-separator />

      <q-list class="servicos-lista">
        <q-item
          v-for="servico in servicos"
          :key="servico.id"
          tag="label"
          v-ripple
          clickable
          class="servico-item"
          :class="{ 'item-selecionado': servico.selecionado }"
        >
          <q-item-section side>
            <q-checkbox v-model="servico.selecionado" color="primary" />
          </q-item-section>

          <q-item-section>
            <q-item-label
              class="servico-nome"
              :class="{ 'servico-nome-ativo': servico.selecionado }"
            >
              {{ servico.nome }}
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <div
              class="preco-chip"
              :class="{ 'preco-chip-ativo': servico.selecionado }"
            >
              R$ {{ servico.preco }}
            </div>
          </q-item-section>
        </q-item>
      </q-list>

      <q-separator />

      <div class="form-rodape q-pa-md">

        <div class="total-area q-mb-md" v-if="somaTotal > 0">
          <span class="total-label">Total selecionado</span>
          <span class="total-valor">{{ somaFormatada }}</span>
        </div>

        <q-btn
          unelevated
          label="Avançar para Agendamento"
          icon="arrow_forward"
          color="positive"
          class="btn-confirmar full-width q-mb-sm"
          :disable="somaTotal === 0"
          @click="irParaAgendamento"
        />

        <q-btn
          flat
          label="Cancelar"
          icon="close"
          color="grey-7"
          class="full-width"
          @click="cancelarAgendamento"
        />
      </div>
    </q-card>

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
      servicos: selecionados.value.join(','),
    },
  })
}

const cancelarAgendamento = () => {
  router.push({ path: '/dashboard' })
}

const servicos = ref([
  { id: 1,  nome: 'Design de Sobrancelhas',        preco: 40, selecionado: false },
  { id: 2,  nome: 'Design com Tintura ou Henna',   preco: 45, selecionado: false },
  { id: 3,  nome: 'Reconstrução de Sobrancelhas',  preco: 50, selecionado: false },
  { id: 4,  nome: 'Depilação Axilas',              preco: 25, selecionado: false },
  { id: 5,  nome: 'Depilação Buço',                preco: 20, selecionado: false },
  { id: 6,  nome: 'Depilação Braço',               preco: 25, selecionado: false },
  { id: 7,  nome: 'Depilação Costas',              preco: 35, selecionado: false },
  { id: 8,  nome: 'Depilação Coxa',                preco: 30, selecionado: false },
  { id: 9,  nome: 'Depilação Canela',              preco: 25, selecionado: false },
  { id: 10, nome: 'Depilação Virilha',             preco: 40, selecionado: false },
  { id: 11, nome: 'Spa dos Pés',                   preco: 60, selecionado: false },
])

const somaTotal = computed(() =>
  servicos.value
    .filter((el) => el.selecionado === true)
    .reduce((acc, el) => acc + el.preco, 0)
)

const selecionados = computed(() =>
  servicos.value
    .filter((el) => el.selecionado === true)
    .map((el) => el.nome)
)

const somaFormatada = computed(() =>
  somaTotal.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
)
</script>

<style scoped>

.servicos-page {
  background: #f0f2f5;
  min-height: 100vh;
}

.servicos-card {
  border-radius: 20px !important;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08) !important;
  border: 1px solid rgba(0, 0, 0, 0.06);
  max-width: 680px;
  margin: 0 auto;
}

.form-header {
  background: #f5f8ff;
  padding: 20px 24px 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  border-bottom: 1px solid #e8edf5;
}
.form-header-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: linear-gradient(135deg, #134e5e 0%, #71b280 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}
.form-titulo {
  font-size: 1rem;
  font-weight: 700;
  color: #1a237e;
  letter-spacing: 0.01em;
}
.form-subtitulo {
  font-size: 0.78rem;
  color: #78909c;
  margin-top: 2px;
}
.form-total {
  font-weight: 700;
  color: #2e7d32;
}

.servicos-lista {
  background: white;
}

.servico-item {
  border-left: 4px solid transparent;
  border-bottom: 1px solid #f0f2f5;
  transition: background 0.15s ease, border-color 0.15s ease;
  padding: 12px 16px;
  min-height: 60px;
}
.servico-item:last-child {
  border-bottom: none;
}
.servico-item:hover {
  background: #f8faff !important;
  border-left-color: #1976d2;
}

.item-selecionado {
  background: #f0fbf4 !important;
  border-left-color: #21ba45 !important;
}

.servico-nome {
  font-size: 0.9rem;
  color: #455a64;
  font-weight: 500;
  transition: color 0.15s ease;
}
.servico-nome-ativo {
  color: #1b5e20;
  font-weight: 700;
}

.preco-chip {
  font-size: 0.82rem;
  font-weight: 600;
  color: #546e7a;
  background: #eceff1;
  border-radius: 8px;
  padding: 4px 10px;
  white-space: nowrap;
  transition: background 0.15s ease, color 0.15s ease;
}
.preco-chip-ativo {
  color: #2e7d32;
  background: #e8f5e9;
}

.form-rodape {
  background: #fafbff;
}

.total-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f0fbf4;
  border: 1px solid #c8e6c9;
  border-radius: 12px;
  padding: 10px 16px;
}
.total-label {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #78909c;
}
.total-valor {
  font-size: 1.1rem;
  font-weight: 800;
  color: #2e7d32;
}

.btn-confirmar {
  border-radius: 10px !important;
  font-weight: 700;
  letter-spacing: 0.03em;
  box-shadow: 0 6px 20px rgba(33, 186, 69, 0.3) !important;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}
.btn-confirmar:hover:not(:disabled) {
  box-shadow: 0 10px 28px rgba(33, 186, 69, 0.4) !important;
  transform: translateY(-1px);
}
</style>