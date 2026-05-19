<template>
  <q-page class="agendamento-page q-pa-md">

    <q-card class="form-card">

      <div class="form-header">
        <div class="form-header-icon">
          <q-icon name="event_note" size="22px" />
        </div>
        <div>
          <div class="form-titulo">Cadastro de Agendamento</div>
          <div class="form-subtitulo" v-if="servicosSelecionados.length">
            {{ servicosSelecionados.length }} serviço(s) selecionado(s) · Total:
            <span class="form-total">{{ somaFormatada }}</span>
          </div>
        </div>
      </div>

      <q-separator />

      <q-form @submit="finalizarAgendamento" class="form-body">


        <div class="secao-titulo q-mb-md">Dados do Cliente</div>

        <div class="q-gutter-y-md">
          <q-input
            v-model="nomeCliente"
            label="Nome da Cliente"
            outlined
            lazy-rules
            class="input-campo"
            :rules="[(val) => (val && val.length > 0) || 'Por favor, digite o nome']"
          >
            <template v-slot:prepend>
              <q-icon name="person" color="primary" />
            </template>
          </q-input>

          <q-input
            v-model="whats"
            label="WhatsApp"
            outlined
            mask="(##) # ####-####"
            unmasked-value
            lazy-rules
            class="input-campo"
            :rules="[(val) => (val && val.length === 11) || 'Digite o DDD + número (11 dígitos)']"
          >
            <template v-slot:prepend>
              <q-icon name="chat" color="positive" />
            </template>
          </q-input>
        </div>

        <div class="secao-titulo q-mt-lg q-mb-md">Data e Horário</div>

        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-6">
            <q-input
              v-model="dataAgendamento"
              label="Data"
              outlined
              mask="##/##/####"
              hint="Formato: DD/MM/AAAA"
              class="input-campo"
              :rules="[(val) => validarData(val) || 'A data não pode ser no passado!']"
            >
              <template v-slot:prepend>
                <q-icon name="calendar_today" color="primary" />
              </template>
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer text-grey-6">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date
                      v-model="dataAgendamento"
                      mask="DD/MM/YYYY"
                      :options="bloquearDatasPassadas"
                    >
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="OK" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>

          <div class="col-12 col-sm-6">
            <q-input
              outlined
              v-model="horaAgendamento"
              label="Horário"
              mask="##:##"
              fill-mask
              lazy-rules
              class="input-campo"
              :rules="[validarHora]"
            >
              <template v-slot:prepend>
                <q-icon name="schedule" color="primary" />
              </template>
              <template v-slot:append>
                <q-icon name="access_time" class="cursor-pointer text-grey-6">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-time v-model="horaAgendamento" mask="HH:mm" format24h>
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="OK" color="primary" flat />
                      </div>
                    </q-time>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
        </div>

        <div class="form-rodape row justify-between items-center q-mt-xl">
          <q-btn
            flat
            label="Voltar"
            icon="arrow_back"
            color="grey-7"
            class="btn-voltar"
            @click="voltar"
          />

          <q-btn
            unelevated
            label="Confirmar Agendamento"
            icon="check_circle"
            color="positive"
            type="submit"
            class="btn-confirmar"
          />
        </div>

      </q-form>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'

const router = useRouter()
const route = useRoute()
const $q = useQuasar()

const somaTotal = ref()
const servicosSelecionados = ref([])

if (route.query.servicos) {
  servicosSelecionados.value = route.query.servicos.split(',')
}
if (route.query.total) {
  somaTotal.value = Number(route.query.total)
}

const somaFormatada = computed(() => {
  const num = Number(somaTotal.value) || 0
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
})

const validarData = (val) => {
  if (!val) return 'A data é obrigatória!'
  if (val.length !== 10) return 'Digite a data completa!'

  const [dia, mes, ano] = val.split('/')
  const diaNum = Number(dia)
  const mesNum = Number(mes)
  const anoNum = Number(ano)

  if (mesNum < 1 || mesNum > 12) return 'Mês inválido!'

  const dataUsuario = new Date(anoNum, mesNum - 1, diaNum)

  if (dataUsuario.getMonth() !== mesNum - 1 || dataUsuario.getDate() !== diaNum) {
    return 'Essa data não existe no calendário!'
  }

  const dataAtual = new Date()
  dataAtual.setHours(0, 0, 0, 0)

  if (dataUsuario < dataAtual) return 'A data não pode ser no passado!'

  return true
}

const validarHora = (val) => {
  if (!val) return 'O horário é obrigatório!'
  if (val.includes('_') || val.length !== 5) return 'Preencha o horário completo!'

  const [hora, minuto] = val.split(':')
  const horaNum = Number(hora)
  const minNum = Number(minuto)

  if (horaNum > 23 || minNum > 59) return 'Horário inválido! (Use 00:00 a 23:59)'

  if (dataAgendamento.value && dataAgendamento.value.length === 10) {
    const [diaStr, mesStr, anoStr] = dataAgendamento.value.split('/')
    const dataSelecionada = new Date(Number(anoStr), Number(mesStr) - 1, Number(diaStr))
    const agora = new Date()

    const ehHoje =
      dataSelecionada.getDate() === agora.getDate() &&
      dataSelecionada.getMonth() === agora.getMonth() &&
      dataSelecionada.getFullYear() === agora.getFullYear()

    if (ehHoje) {
      const horaAtual = agora.getHours()
      const minutoAtual = agora.getMinutes()
      if (horaNum < horaAtual || (horaNum === horaAtual && minNum <= minutoAtual)) {
        return 'Esse horário já passou!'
      }
    }
  }

  return true
}

const bloquearDatasPassadas = (date) => {
  const hoje = new Date()
  const ano = hoje.getFullYear()
  const mes = String(hoje.getMonth() + 1).padStart(2, '0')
  const dia = String(hoje.getDate()).padStart(2, '0')
  return date >= `${ano}/${mes}/${dia}`
}

const nomeCliente = ref('')
const whats = ref('')
const dataAgendamento = ref('')
const horaAgendamento = ref('')

const finalizarAgendamento = async () => {
  const dados = {
    cliente: nomeCliente.value,
    whatsapp: whats.value,
    data: dataAgendamento.value,
    hora: horaAgendamento.value,
    servicos: servicosSelecionados.value,
    valorTotal: somaTotal.value,
    valorOriginal:somaTotal.value
  }

  try {
    $q.loading.show({ message: 'Salvando agendamento...' })
    await api.post('/agendamentos', dados)
    $q.notify({ type: 'positive', message: 'Agendamento salvo com sucesso!', position: 'top' })
    router.push('/dashboard')
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Erro ao salvar. Verifique sua conexão.', position: 'top' })
  } finally {
    $q.loading.hide()
  }
}

const voltar = () => router.push('/')
</script>

<style scoped>

.agendamento-page {
  background: #f0f2f5;
  min-height: 100vh;
}

.form-card {
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
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
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


.form-body {
  padding: 24px;
}


.secao-titulo {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #455a64;
  border-left: 3px solid #1976d2;
  padding-left: 10px;
}


.input-campo {
  border-radius: 10px;
}


.form-rodape {
  border-top: 1px solid #f0f2f5;
  padding-top: 20px;
}

/* Botão Voltar — flat discreto */
.btn-voltar {
  font-weight: 600;
  letter-spacing: 0.02em;
}

.btn-confirmar {
  border-radius: 10px !important;
  font-weight: 700;
  letter-spacing: 0.03em;
  padding: 8px 24px;
  box-shadow: 0 6px 20px rgba(33, 186, 69, 0.3) !important;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}
.btn-confirmar:hover {
  box-shadow: 0 10px 28px rgba(33, 186, 69, 0.4) !important;
  transform: translateY(-1px);
}
</style>