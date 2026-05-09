<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-form @submit="finalizarAgendamento" class="q-gutter-y-md">
        <q-card-section>
          <div class="text-h6">Cadastro de Agendamento</div>
        </q-card-section>
        <q-card-section class="q-gutter-y-md">
          <q-input
            v-model="nomeCliente"
            label="Nome da Cliente"
            outlined
            ounded
            standout
            lazy-rules
            :rules="[(val) => (val && val.length > 0) || 'Por favor, digite o nome']"
          />

          <q-input
            v-model="whats"
            label="Whatsapp"
            outlined
            rounded
            standout
            mask="(##) # ####-####"
            unmasked-value
            lazy-rules
            :rules="[(val) => (val && val.length === 11) || 'Digite o DDD + número (11 dígitos)']"
          />

          <div class="row q-col-gutter-md q-mt-md">
            <div class="col-12 col-sm-4">
              <q-input
                v-model="dataAgendamento"
                label="Data"
                mask="##/##/####"
                hint="Formato: DD/MM/AAAA"
                :rules="[(val) => validarData(val) || 'A data não pode ser no passado!']"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
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

            <div class="col-12 col-sm-4">
              <q-input
                outlined
                rounded
                v-model="horaAgendamento"
                label="Horário"
                mask="##:##"
                fill-mask
                lazy-rules
                :rules="[validarHora]"
              >
                <template v-slot:append>
                  <q-icon name="access_time" class="cursor-pointer">
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
        </q-card-section>
        <q-card-section>
          <div class="row justify-start">
            <div class="row q-gutter-sm" style="width: 400px; max-width: 100%">
              <q-btn color="positive" label="Agendamento Concluído" type="submit" />
              <q-btn color="red" label="Voltar" @click="voltar" />
            </div>
          </div>
        </q-card-section>
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
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

// VALIDAÇÃO DA DATA: Verifica passado e se a data existe no calendário
const validarData = (val) => {
  if (!val) return 'A data é obrigatória!'
  if (val.length !== 10) return 'Digite a data completa!'

  const [dia, mes, ano] = val.split('/')
  const diaNum = Number(dia)
  const mesNum = Number(mes)
  const anoNum = Number(ano)

  // O mês precisa existir (entre 1 e 12)
  if (mesNum < 1 || mesNum > 12) {
    return 'Mês inválido!'
  }

  const dataUsuario = new Date(anoNum, mesNum - 1, diaNum)

  // O JavaScript corrige datas sozinhas (ex: 31/02 vira 03/03).
  // Se o mês gerado for diferente do digitado, a data não existe!
  if (dataUsuario.getMonth() !== mesNum - 1 || dataUsuario.getDate() !== diaNum) {
    return 'Essa data não existe no calendário!'
  }

  const dataAtual = new Date()
  dataAtual.setHours(0, 0, 0, 0)

  if (dataUsuario < dataAtual) {
    return 'A data não pode ser no passado!'
  }

  return true
}

// VALIDAÇÃO DA HORA: Impede coisas como 25:80
// VALIDAÇÃO DA HORA: Impede horas inválidas e horários que já passaram hoje
const validarHora = (val) => {
  if (!val) return 'O horário é obrigatório!'
  if (val.includes('_') || val.length !== 5) {
    return 'Preencha o horário completo!'
  }

  const [hora, minuto] = val.split(':')
  const horaNum = Number(hora)
  const minNum = Number(minuto)

  // 1. Verifica se a hora matematicamente existe (ex: barra 25:80)
  if (horaNum > 23 || minNum > 59) {
    return 'Horário inválido! (Use 00:00 a 23:59)'
  }

  // 2. NOVA REGRA: Verifica se o agendamento é para hoje e se a hora já passou
  if (dataAgendamento.value && dataAgendamento.value.length === 10) {
    const [diaStr, mesStr, anoStr] = dataAgendamento.value.split('/')
    const dataSelecionada = new Date(Number(anoStr), Number(mesStr) - 1, Number(diaStr))
    const agora = new Date()

    // Checa se o dia, mês e ano selecionados são exatamente os de hoje
    const ehHoje = 
      dataSelecionada.getDate() === agora.getDate() &&
      dataSelecionada.getMonth() === agora.getMonth() &&
      dataSelecionada.getFullYear() === agora.getFullYear()

    if (ehHoje) {
      const horaAtual = agora.getHours()
      const minutoAtual = agora.getMinutes()

      // Compara se a hora digitada é menor que a atual, 
      // ou se é a mesma hora mas os minutos já passaram
      if (horaNum < horaAtual || (horaNum === horaAtual && minNum <= minutoAtual)) {
        return 'Esse horário já passou!'
      }
    }
  }

  return true
}

// Bloqueio visual do calendário
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
  console.log('Botão clicado! Tentando salvar...')

  const dados = {
    cliente: nomeCliente.value,
    whatsapp: whats.value,
    data: dataAgendamento.value,
    hora: horaAgendamento.value,
    servicos: servicosSelecionados.value,
    valorTotal: somaTotal.value,
  }

  try {
    $q.loading.show({ message: 'Salvando no banco...' })

    await api.post('/agendamentos', dados)

    $q.notify({
      type: 'positive',
      message: 'Agendamento salvo com sucesso!',
      position: 'top',
    })

    router.push('/dashboard')
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao salvar. Verifique sua conexão com o servidor.',
      position: 'top',
    })
  } finally {
    $q.loading.hide()
  }
}

const voltar = () => {
  router.push('/')
}
</script>
