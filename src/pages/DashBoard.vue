<template>
  <q-page class="q-pa-md bg-grey-2">
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6">
        <q-card class="resumo-card card-diario text-white shadow-2">
          <q-card-section class="row items-center no-wrap">
            <div class="col">
              <div class="text-overline text-weight-medium opacity-70">Faturamento Hoje</div>
              <div class="text-h4 text-weight-bolder q-my-xs">{{ faturamentoDiarioFormatado }}</div>
              <div class="text-caption row items-center">
                <q-icon name="pending_actions" class="q-mr-xs" />
                {{ agendamentosDia.filter((i) => !i.status).length }} atendimentos ativos
              </div>
            </div>
            <q-icon name="payments" size="52px" class="icon-fundo" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6">
        <q-card class="resumo-card card-mensal text-white shadow-2">
          <q-card-section class="row items-center no-wrap">
            <div class="col">
              <div class="text-overline text-weight-medium opacity-70">
                Total de {{ nomeMesVisualizado }}
              </div>
              <div class="text-h4 text-weight-bolder q-my-xs">{{ faturamentoMensalFormatado }}</div>
              <div class="text-caption row items-center">
                <q-icon name="auto_graph" class="q-mr-xs" />
                Acumulado do mês visualizado
              </div>
            </div>
            <q-icon name="show_chart" size="52px" class="icon-fundo" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-card class="q-mb-md shadow-1 rounded-borders">
      <q-card-section class="q-pa-none">
        <div class="row justify-between items-center bg-primary text-white q-pa-sm">
          <q-btn flat round icon="chevron_left" @click="voltarDia" />
          <div class="text-subtitle1 text-weight-bold">{{ dataFormatadaExibicao }}</div>
          <q-btn flat round icon="chevron_right" @click="proximoDia" />
        </div>
        <q-date
          v-model="dataSelecionada"
          minimal
          flat
          class="full-width"
          mask="DD/MM/YYYY"
          :events="datasComAgendamento"
          event-color="warning"
          @update:model-value="filtrarPorData"
          @navigation="aoNavegarNoCalendario"
        />
      </q-card-section>
    </q-card>

    <div class="text-subtitle2 q-mb-sm text-grey-7 q-pl-sm">Agenda do Dia</div>
    <q-list bordered separator class="bg-white rounded-borders shadow-1">
      <q-item v-if="agendamentosDia.length === 0" class="q-pa-lg text-center text-grey">
        <q-item-section>Nenhum agendamento para este dia.</q-item-section>
      </q-item>

      <q-item
        v-for="item in agendamentosDia"
        :key="item.id"
        v-ripple
        clickable
        @click="verDetalhes(item)"
        :class="{
          'bg-cancelado': item.status === 'cancelado',
          'bg-concluido': item.status === 'concluido',
        }"
      >
        <q-item-section side>
          <div
            :class="{ 'text-strike text-grey': item.status === 'cancelado' }"
            class="text-weight-bold text-primary"
          >
            {{ item.hora }}
          </div>
        </q-item-section>

        <q-item-section>
          <q-item-label
            :class="{ 'text-strike text-grey': item.status === 'cancelado' }"
            class="text-weight-bold"
          >
            {{ item.cliente }}
            <q-badge
              v-if="item.status === 'cancelado'"
              color="red"
              label="Cancelado"
              class="q-ml-sm"
            />
            <q-badge
              v-if="item.status === 'concluido'"
              color="positive"
              label="Realizado"
              class="q-ml-sm"
            />
          </q-item-label>
          <q-item-label caption class="text-grey-8">
            {{ Array.isArray(item.servicos) ? item.servicos.join(', ') : item.servico }}
          </q-item-label>
        </q-item-section>

        <q-item-section side>
          <div class="row items-center no-wrap">
            <div class="text-positive text-weight-bolder q-mr-md">R$ {{ item.valorTotal }}</div>

            <template v-if="!item.status">
              <q-btn
                flat
                round
                dense
                color="positive"
                icon="check_circle"
                size="sm"
                class="q-mr-xs"
                @click.stop="finalizarServico(item)"
              >
                <q-tooltip>Concluir Serviço</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                color="red"
                icon="close"
                size="sm"
                @click.stop="cancelarAgendamento(item)"
              >
                <q-tooltip>Cancelar</q-tooltip>
              </q-btn>
            </template>
          </div>
        </q-item-section>
      </q-item>
    </q-list>

    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="primary" @click="irParaNovaReserva" />
    </q-page-sticky>

    <q-dialog v-model="exibirDetalhes">
      <q-card style="min-width: 350px; border-radius: 20px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">📋 Detalhes</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="text-subtitle1 text-weight-bold">{{ agendamentoSelecionado?.cliente }}</div>
          <p class="text-grey-7">{{ agendamentoSelecionado?.whatsapp }}</p>
          <q-separator q-my-md />

          <div class="q-mt-sm"><strong>Horário:</strong> {{ agendamentoSelecionado?.hora }}</div>
          <div class="q-mb-md">
            <strong>Serviços:</strong>
            {{
              Array.isArray(agendamentoSelecionado?.servicos)
                ? agendamentoSelecionado?.servicos.join(', ')
                : agendamentoSelecionado?.servico
            }}
          </div>

          <div
            v-if="!agendamentoSelecionado?.status"
            class="row items-center q-gutter-sm no-wrap bg-grey-1 q-pa-sm rounded-borders"
          >
            <div class="text-h6 text-primary">
              Total: R$ {{ agendamentoSelecionado?.valorTotal }}
            </div>
            <q-space />
            <q-input
              v-model.number="valorParaDescontar"
              label="Desc."
              type="number"
              outlined
              dense
              prefix="R$"
              style="width: 80px"
            />
            <q-btn
              color="orange-9"
              icon="done"
              @click="confirmarDesconto"
              :disable="!valorParaDescontar"
            />
          </div>

          <div
            v-else-if="agendamentoSelecionado?.status === 'concluido'"
            class="text-h5 text-positive text-center q-pa-md text-weight-bold"
          >
            ✓ SERVIÇO REALIZADO
          </div>
          <div v-else class="text-h5 text-red text-center q-pa-md text-weight-bold">
            ✕ CANCELADO
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pb-md q-px-md">
          <q-btn label="Fechar" color="grey-7" flat v-close-popup />
          <q-btn
            v-if="agendamentoSelecionado?.status !== 'cancelado'"
            label="Whats"
            color="green"
            icon="chat"
            @click="enviarLembrete(agendamentoSelecionado)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { date, useQuasar } from 'quasar'
import { api } from 'boot/axios'
import { useRouter } from 'vue-router'

const $q = useQuasar()
const router = useRouter()

// --- ESTADO ---
const dataSelecionada = ref(date.formatDate(new Date(), 'DD/MM/YYYY'))
const todosAgendamentos = ref([])
const agendamentosDia = ref([])
const valorParaDescontar = ref(0)
const exibirDetalhes = ref(false)
const agendamentoSelecionado = ref(null)

const vistaCalendario = ref({
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
})

// --- NAVEGAÇÃO CALENDÁRIO ---
const aoNavegarNoCalendario = (view) => {
  vistaCalendario.value = view
}

const nomeMesVisualizado = computed(() => {
  const meses = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ]
  return meses[vistaCalendario.value.month - 1]
})

// --- CÁLCULOS ---

// Cria a lista de dias com agendamento no formato YYYY/MM/DD para o calendário pintar de amarelo
const datasComAgendamento = computed(() => {
  const diasUnicos = new Set()

  todosAgendamentos.value.forEach((item) => {
    // Só inclui dias de agendamentos que não estejam cancelados (opcional, pode tirar se quiser mostrar todos)
    if (item.data && item.status !== 'cancelado') {
      // Inverte de DD/MM/YYYY para YYYY/MM/DD
      const [dia, mes, ano] = item.data.replace(/-/g, '/').split('/')
      diasUnicos.add(`${ano}/${mes}/${dia}`)
    }
  })

  return Array.from(diasUnicos)
})

const faturamentoDiarioFormatado = computed(() => {
  const total = agendamentosDia.value
    .filter((i) => i.status !== 'cancelado')
    .reduce((acc, item) => acc + (Number(item.valorTotal) || 0), 0)
  return total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
})

const faturamentoMensalFormatado = computed(() => {
  const mSel = vistaCalendario.value.month
  const aSel = vistaCalendario.value.year
  const total = todosAgendamentos.value
    .filter((item) => {
      if (!item.data || item.status === 'cancelado') return false
      const [m, a] = item.data.replace(/-/g, '/').split('/')
      return Number(m) === mSel && Number(a) === aSel
    })
    .reduce((acc, item) => acc + (Number(item.valorTotal) || 0), 0)
  return total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
})

// --- API ---
const salvarNoBanco = async (item) => {
  try {
    $q.loading.show()
    await api.put(`/agendamentos/${item.id}`, item)
    return true
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao salvar. Verifique o servidor.' })
    return false
  } finally {
    $q.loading.hide()
  }
}

const finalizarServico = (item) => {
  $q.dialog({
    title: 'Finalizar',
    message: `Concluir serviço de ${item.cliente}?`,
    cancel: true,
  }).onOk(async () => {
    if (await salvarNoBanco({ ...item, status: 'concluido' })) {
      item.status = 'concluido'
      $q.notify({ type: 'positive', message: 'Concluído!', icon: 'check' })
    }
  })
}

const cancelarAgendamento = (item) => {
  $q.dialog({
    title: 'Cancelar',
    message: `Cancelar agendamento de ${item.cliente}?`,
    cancel: true,
  }).onOk(async () => {
    if (await salvarNoBanco({ ...item, status: 'cancelado' })) {
      item.status = 'cancelado'
      $q.notify({ type: 'warning', message: 'Cancelado.' })
    }
  })
}

const confirmarDesconto = async () => {
  const item = agendamentoSelecionado.value
  const novoTotal = (Number(item.valorTotal) - Number(valorParaDescontar.value)).toFixed(2)
  if (await salvarNoBanco({ ...item, valorTotal: novoTotal })) {
    item.valorTotal = novoTotal
    valorParaDescontar.value = 0
    $q.notify({ type: 'positive', message: 'Desconto aplicado!' })
  }
}

// --- AUXILIARES ---
const filtrarPorData = () => {
  const busca = dataSelecionada.value.replace(/-/g, '/')
  agendamentosDia.value = todosAgendamentos.value.filter((item) => {
    return item.data && item.data.replace(/-/g, '/') === busca
  })
}

const buscarDadosDoServidor = async () => {
  try {
    const res = await api.get('/agendamentos')
    todosAgendamentos.value = res.data
    filtrarPorData()
  } catch (e) {
    console.error(e)
  }
}

const dataFormatadaExibicao = computed(() => {
  const p = dataSelecionada.value.split('/')
  return date.formatDate(new Date(p[2], p[1] - 1, p[0]), 'D [de] MMMM', {
    months: [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ],
  })
})

const proximoDia = () => {
  const p = dataSelecionada.value.split('/')
  const n = date.addToDate(new Date(p[2], p[1] - 1, p[0]), { days: 1 })
  dataSelecionada.value = date.formatDate(n, 'DD/MM/YYYY')
}
const voltarDia = () => {
  const p = dataSelecionada.value.split('/')
  const n = date.subtractFromDate(new Date(p[2], p[1] - 1, p[0]), { days: 1 })
  dataSelecionada.value = date.formatDate(n, 'DD/MM/YYYY')
}

const verDetalhes = (item) => {
  agendamentoSelecionado.value = item
  exibirDetalhes.value = true
}
const enviarLembrete = (item) => {
  const f = item.whatsapp ? item.whatsapp.replace(/\D/g, '') : ''
  window.open(
    `https://wa.me/55${f}?text=Olá ${item.cliente}, confirmo seu horário hoje às ${item.hora}!`,
    '_blank',
  )
}
const irParaNovaReserva = () => router.push('/agendamento')

onMounted(buscarDadosDoServidor)
watch(dataSelecionada, filtrarPorData)
</script>

<style scoped>
.resumo-card {
  border-radius: 24px;
  overflow: hidden;
  position: relative;
  height: 130px;
  display: flex;
  align-items: center;
}
.card-diario {
  background: linear-gradient(135deg, #134e5e 0%, #71b280 100%);
}
.card-mensal {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
}
.icon-fundo {
  position: absolute;
  right: -10px;
  bottom: -10px;
  opacity: 0.15;
  transform: rotate(-15deg);
}
.bg-concluido {
  background-color: #f0f9f1 !important;
  border-left: 6px solid #21ba45;
}
.bg-cancelado {
  background-color: #fff0f0 !important;
  border-left: 6px solid #f44336;
}
.text-strike {
  text-decoration: line-through;
  opacity: 0.5;
}
</style>

//atualização 08/05/2026
