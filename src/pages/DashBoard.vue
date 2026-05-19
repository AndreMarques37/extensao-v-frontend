<template>
  <q-page class="agenda-page q-pa-md">

    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6">
        <q-card class="resumo-card card-diario text-white">
          <q-card-section class="row items-center no-wrap q-pa-lg">
            <div class="col">
              <div class="text-overline text-weight-medium opacity-70 card-label">Faturamento Hoje</div>
              <div class="text-h4 text-weight-bolder q-my-xs card-valor">{{ faturamentoDiarioFormatado }}</div>
              <div class="text-caption row items-center card-sub">
                <q-icon name="pending_actions" class="q-mr-xs" />
                {{ agendamentosDia.filter((i) => !i.status).length }} atendimentos ativos
              </div>
            </div>
            <q-icon name="payments" size="56px" class="icon-fundo" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6">
        <q-card class="resumo-card card-mensal text-white">
          <q-card-section class="row items-center no-wrap q-pa-lg">
            <div class="col">
              <div class="text-overline text-weight-medium opacity-70 card-label">
                Total de {{ nomeMesVisualizado }}
              </div>
              <div class="text-h4 text-weight-bolder q-my-xs card-valor">{{ faturamentoMensalFormatado }}</div>
              <div class="text-caption row items-center card-sub">
                <q-icon name="auto_graph" class="q-mr-xs" />
                Acumulado do mês visualizado
              </div>
            </div>
            <q-icon name="show_chart" size="56px" class="icon-fundo" />
          </q-card-section>
        </q-card>
      </div>
    </div>


    <q-card class="calendario-card q-mb-lg">
      <q-card-section class="q-pa-none">


        <div class="nav-dia-header row justify-between items-center q-px-md q-py-sm">
          <q-btn
            flat round
            icon="chevron_left"
            class="nav-btn"
            @click="voltarDia"
          />
          <div class="nav-dia-titulo text-weight-bold">{{ dataFormatadaExibicao }}</div>
          <q-btn
            flat round
            icon="chevron_right"
            class="nav-btn"
            @click="proximoDia"
          />
        </div>

        <q-date
          v-model="dataSelecionada"
          minimal
          flat
          class="full-width calendario-interno"
          mask="DD/MM/YYYY"
          :events="datasComAgendamento"
          event-color="warning"
          @update:model-value="filtrarPorData"
          @navigation="aoNavegarNoCalendario"
        />
      </q-card-section>
    </q-card>


    <div class="secao-titulo q-mb-sm q-pl-sm">Agenda do Dia</div>


    <q-list class="agenda-lista">


      <q-item v-if="agendamentosDia.length === 0" class="vazio-item q-pa-xl">
        <q-item-section class="text-center">
          <q-icon name="event_available" size="36px" class="q-mb-sm vazio-icon" />
          <div class="vazio-texto">Nenhum agendamento para este dia.</div>
        </q-item-section>
      </q-item>

      <q-item
        v-for="item in agendamentosDia"
        :key="item.id"
        v-ripple
        clickable
        class="agenda-item"
        :class="{
          'item-cancelado': item.status === 'cancelado',
          'item-concluido': item.status === 'concluido',
        }"
        @click="verDetalhes(item)"
      >
        <q-item-section side class="q-pr-md">
          <div
            class="hora-chip"
            :class="{ 'hora-cancelada': item.status === 'cancelado' }"
          >
            {{ item.hora }}
          </div>
        </q-item-section>

        <q-item-section>
          <q-item-label
            class="cliente-nome text-weight-bold"
            :class="{ 'text-strike text-grey': item.status === 'cancelado' }"
          >
            {{ item.cliente }}
            <q-badge
              v-if="item.status === 'cancelado'"
              color="red-6"
              label="Cancelado"
              class="q-ml-sm badge-status"
            />
            <q-badge
              v-if="item.status === 'concluido'"
              color="positive"
              label="Realizado"
              class="q-ml-sm badge-status"
            />
          </q-item-label>
          <q-item-label caption class="servicos-lista q-mt-xs">
            {{ Array.isArray(item.servicos) ? item.servicos.join(', ') : item.servico }}
          </q-item-label>
        </q-item-section>

        <q-item-section side>
          <div class="row items-center no-wrap q-gutter-xs">
            <div class="valor-bloco">
              <div class="valor-chip">{{ formatarMoeda(item.valorTotal) }}</div>

              <template v-if="item.valorOriginal && Number(item.valorOriginal) > Number(item.valorTotal)">
                <div class="valor-original">{{ formatarMoeda(item.valorOriginal) }}</div>
                <div class="valor-desconto">
                  -{{ formatarMoeda(Number(item.valorOriginal) - Number(item.valorTotal)) }}
                </div>
              </template>
            </div>

            <template v-if="!item.status">
              <q-btn
                flat round dense
                color="positive"
                icon="check_circle"
                size="sm"
                class="acao-btn"
                @click.stop="finalizarServico(item)"
              >
                <q-tooltip>Concluir Serviço</q-tooltip>
              </q-btn>
              <q-btn
                flat round dense
                color="red-5"
                icon="close"
                size="sm"
                class="acao-btn"
                @click.stop="cancelarAgendamento(item)"
              >
                <q-tooltip>Cancelar</q-tooltip>
              </q-btn>
            </template>
          </div>
        </q-item-section>
      </q-item>
    </q-list>


    <q-page-sticky position="bottom-right" :offset="[20, 20]">
      <q-btn fab icon="add" color="primary" class="fab-add" @click="irParaNovaReserva" />
    </q-page-sticky>


    <q-dialog v-model="exibirDetalhes">
      <q-card class="detalhe-card">

        <q-card-section class="detalhe-header row items-center q-pb-sm">
          <div class="detalhe-titulo">📋 Detalhes do Agendamento</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup class="fechar-btn" />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pt-md">
          <div class="detalhe-cliente">{{ agendamentoSelecionado?.cliente }}</div>
          <div class="detalhe-whats q-mb-md">
            <q-icon name="phone" size="14px" class="q-mr-xs" />
            {{ agendamentoSelecionado?.whatsapp }}
          </div>


          <div class="detalhe-infos q-pa-sm q-mb-md">
            <div class="detalhe-info-item">
              <span class="detalhe-label">Horário</span>
              <span class="detalhe-value">{{ agendamentoSelecionado?.hora }}</span>
            </div>
            <div class="detalhe-info-item">
              <span class="detalhe-label">Serviços</span>
              <span class="detalhe-value">
                {{
                  Array.isArray(agendamentoSelecionado?.servicos)
                    ? agendamentoSelecionado?.servicos.join(', ')
                    : agendamentoSelecionado?.servico
                }}
              </span>
            </div>
          </div>

          <div
            v-if="!agendamentoSelecionado?.status"
            class="desconto-area row items-center q-gutter-sm no-wrap"
          >
            <div class="desconto-total">
              Total: R$ {{ agendamentoSelecionado?.valorTotal }}
            </div>
            <q-space />
            <q-input
              v-model.number="valorParaDescontar"
              label="Desconto"
              type="number"
              outlined
              dense
              prefix="R$"
              class="desconto-input"
            />
            <q-btn
              color="orange-9"
              icon="done"
              round
              dense
              unelevated
              @click="confirmarDesconto"
              :disable="!valorParaDescontar"
            />
          </div>

  
          <div
            v-else-if="agendamentoSelecionado?.status === 'concluido'"
            class="status-badge status-concluido"
          >
            <q-icon name="check_circle" class="q-mr-sm" />
            SERVIÇO REALIZADO
          </div>

          <div v-else class="status-badge status-cancelado">
            <q-icon name="cancel" class="q-mr-sm" />
            CANCELADO
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pb-md q-px-md q-pt-none">
          <q-btn label="Fechar" color="grey-6" flat v-close-popup />
          <q-btn
            v-if="agendamentoSelecionado?.status !== 'cancelado'"
            label="WhatsApp"
            color="green-7"
            icon="chat"
            unelevated
            rounded
            class="q-px-md"
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

const aoNavegarNoCalendario = (view) => {
  vistaCalendario.value = view
}

const nomeMesVisualizado = computed(() => {
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ]
  return meses[vistaCalendario.value.month - 1]
})

const datasComAgendamento = computed(() => {
  const diasUnicos = new Set()
  todosAgendamentos.value.forEach((item) => {
    if (item.data && item.status !== 'cancelado') {
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
  const mSel = Number(vistaCalendario.value.month)
  const aSel = Number(vistaCalendario.value.year)
  const total = todosAgendamentos.value
    .filter((item) => {
      if (!item.data || item.status === 'cancelado') return false
      const dataPadrao = item.data.replace(/\//g, '-')
      const partes = dataPadrao.substring(0, 10).split('-')
      let anoItem, mesItem
      if (partes[0].length === 4) {
        anoItem = Number(partes[0])
        mesItem = Number(partes[1])
      } else {
        anoItem = Number(partes[2])
        mesItem = Number(partes[1])
      }
      return mesItem === mSel && anoItem === aSel
    })
    .reduce((acc, item) => {
      const valor = Number(String(item.valorTotal).replace(',', '.')) || 0
      return acc + valor
    }, 0)
  return total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
})

// --- AÇÕES --- (sem alterações)
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
  if (!item || !item.id) {
    console.error("Erro: Agendamento selecionado está vazio ou sem ID.")
    return
  }
  const valorAtual = Number(item.valorTotal) || 0
  const descontoDigitado = Math.abs(Number(valorParaDescontar.value) || 0)
  if (descontoDigitado > valorAtual) {
    $q.notify({ type: 'negative', message: 'O desconto não pode ser maior que o valor total!', position: 'top' })
    return
  }
  const novoTotal = Math.max(0, valorAtual - descontoDigitado).toFixed(2)
  try {
    await api.put(`/agendamentos/${item.id}`, { ...item, valorTotal: novoTotal })
    item.valorTotal = novoTotal
    valorParaDescontar.value = 0
    $q.notify({ type: 'positive', message: 'Desconto aplicado com sucesso!' })
  } catch (erro) {
    console.error("Erro ao salvar desconto no banco:", erro)
    $q.notify({ type: 'negative', message: 'Erro ao conectar com o servidor.', position: 'top' })
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
    months: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
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

const formatarMoeda = (valor) => {
  const num = Number(String(valor || 0).replace(',', '.')) || 0
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const verDetalhes = (item) => {
  agendamentoSelecionado.value = item
  exibirDetalhes.value = true
}
const enviarLembrete = (item) => {
  const f = item.whatsapp ? item.whatsapp.replace(/\D/g, '') : ''
  window.open(`https://wa.me/55${f}?text=Olá ${item.cliente}, confirmo seu horário hoje às ${item.hora}!`, '_blank')
}
const irParaNovaReserva = () => router.push('/indexpage')

onMounted(buscarDadosDoServidor)
watch(dataSelecionada, filtrarPorData)
</script>

<style scoped>

.agenda-page {
  background: #f0f2f5;
  min-height: 100vh;
}


.resumo-card {
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  min-height: 130px;
  display: flex;
  align-items: center;
  box-shadow: 0 8px 32px rgba(30, 60, 114, 0.18) !important;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.resumo-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 40px rgba(30, 60, 114, 0.22) !important;
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
  opacity: 0.12;
  transform: rotate(-15deg);
}

.card-label {
  letter-spacing: 0.08em;
  font-size: 0.7rem;
}
.card-valor {
  letter-spacing: -0.02em;
  line-height: 1.1;
}
.card-sub {
  opacity: 0.75;
}


.calendario-card {
  border-radius: 20px !important;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08) !important;
  border: 1px solid rgba(0, 0, 0, 0.06);
}


.nav-dia-header {
  background: #1976d2; 
  color: white;

  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.nav-dia-titulo {
  font-size: 1.05rem;
  letter-spacing: 0.02em;
  color: white;
}
.nav-btn {
  color: white !important;
  opacity: 0.9;
}
.nav-btn:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.15) !important;
}

.calendario-interno {
  background: white;
}


.secao-titulo {
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #455a64;
  /* Barra decorativa lateral */
  border-left: 3px solid #1976d2;
  padding-left: 10px !important;
}


.agenda-lista {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.06);
}


.agenda-item {
  border-left: 4px solid transparent;
  border-bottom: 1px solid #f0f2f5;
  transition: background 0.15s ease, border-color 0.15s ease;
  padding: 14px 16px;
  min-height: 72px;
}
.agenda-item:last-child {
  border-bottom: none;
}
.agenda-item:hover {
  background: #f8faff !important;
  border-left-color: #1976d2;
}

.item-concluido {
  background-color: #f0fbf4 !important;
  border-left-color: #21ba45 !important;
}
.item-cancelado {
  background-color: #fff5f5 !important;
  border-left-color: #f44336 !important;
  opacity: 0.75;
}


.hora-chip {
  font-size: 0.82rem;
  font-weight: 700;
  color: #1976d2;
  background: #e8f0fe;
  border-radius: 8px;
  padding: 4px 8px;
  letter-spacing: 0.03em;
  min-width: 48px;
  text-align: center;
}
.hora-cancelada {
  color: #9e9e9e;
  background: #f5f5f5;
  text-decoration: line-through;
}

/* Nome do cliente e serviços */
.cliente-nome {
  font-size: 0.92rem;
  color: #263238;
}
.servicos-lista {
  color: #78909c !important;
  font-size: 0.78rem;
}

/* Badge de status (Realizado / Cancelado) */
.badge-status {
  font-size: 0.65rem;
  border-radius: 6px;
  padding: 2px 6px;
}


.valor-chip {
  font-size: 0.88rem;
  font-weight: 700;
  color: #2e7d32;
  background: #e8f5e9;
  border-radius: 8px;
  padding: 4px 10px;
  white-space: nowrap;
}

.acao-btn {
  opacity: 0.75;
  transition: opacity 0.15s, transform 0.15s;
}
.acao-btn:hover {
  opacity: 1;
  transform: scale(1.1);
}


.vazio-item {
  flex-direction: column;
  align-items: center;
}
.vazio-icon {
  color: #b0bec5;
}
.vazio-texto {
  color: #90a4ae;
  font-size: 0.88rem;
}

.fab-add {
  box-shadow: 0 6px 20px rgba(25, 118, 210, 0.4) !important;
}


.detalhe-card {
  min-width: 360px;
  border-radius: 24px !important;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.18) !important;
  overflow: hidden;
}


.detalhe-header {
  background: #f5f8ff;
  padding: 16px 20px 12px !important;
  border-bottom: 1px solid #e8edf5;
}
.detalhe-titulo {
  font-size: 1rem;
  font-weight: 700;
  color: #1a237e;
  letter-spacing: 0.01em;
}
.fechar-btn {
  color: #78909c !important;
}

.detalhe-cliente {
  font-size: 1.15rem;
  font-weight: 700;
  color: #263238;
  margin-bottom: 2px;
}
.detalhe-whats {
  font-size: 0.82rem;
  color: #78909c;
}

.detalhe-infos {
  background: #f8faff;
  border-radius: 12px;
  border: 1px solid #e8edf5;
}
.detalhe-info-item {
  display: flex;
  flex-direction: column;
  padding: 6px 8px;
}
.detalhe-info-item + .detalhe-info-item {
  border-top: 1px solid #eef2f8;
}
.detalhe-label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #90a4ae;
  margin-bottom: 2px;
}
.detalhe-value {
  font-size: 0.9rem;
  color: #37474f;
  font-weight: 500;
}

.desconto-area {
  background: #f8faff;
  border-radius: 12px;
  border: 1px solid #e8edf5;
  padding: 10px 12px;
}
.desconto-total {
  font-size: 1rem;
  font-weight: 700;
  color: #1565c0;
}
.desconto-input {
  width: 100px;
}

.status-badge {
  border-radius: 12px;
  padding: 14px 20px;
  font-size: 1rem;
  font-weight: 800;
  text-align: center;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  justify-content: center;
}
.status-concluido {
  background: #e8f5e9;
  color: #2e7d32;
}
.status-cancelado {
  background: #ffebee;
  color: #c62828;
}

.text-strike {
  text-decoration: line-through;
  opacity: 0.5;
}

.valor-bloco {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
}

.valor-original {
  font-size: 0.7rem;
  color: #9e9e9e;
  text-decoration: line-through;
  line-height: 1;
}

.valor-desconto {
  font-size: 0.68rem;
  font-weight: 700;
  color: #e53935;
  line-height: 1;
  letter-spacing: 0.01em;
}
</style>