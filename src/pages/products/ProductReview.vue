<template>
  <div class="page-wrap pg-page">
    <div class="pg-review-layout">
      <a-card :bordered="false" class="pg-review-pane">
        <template #title>
          <div class="pg-card-title">
            <span>审核池</span>
            <a-space>
              <a-button size="small" @click="refreshTickets">刷新</a-button>
              <a-button size="small" type="primary" ghost @click="claimSelected">批量领取</a-button>
            </a-space>
          </div>
        </template>
        <a-space class="mb12">
          <a-select v-model:value="statusFilter" style="width: 140px" :options="statusOptions" />
          <a-select v-model:value="priorityFilter" style="width: 120px" :options="priorityOptions" />
        </a-space>
        <div class="pg-review-queue">
          <div
            v-for="item in filteredTickets"
            :key="item.id"
            class="pg-review-task"
            :class="{ active: selected?.id === item.id }"
            @click="requestSwitchTicket(item.id)"
          >
            <div class="pg-review-task-head">
              <a-checkbox
                :checked="selectedQueueIds.includes(item.id)"
                @click.stop
                @change="(event) => toggleQueueSelect(item.id, event.target.checked)"
              />
              <div class="pg-task-title" :title="item.productName">{{ item.productName }}</div>
            </div>
            <div class="pg-task-sub">{{ item.merchantName }} · {{ item.shopName }}</div>
            <div class="pg-task-sub">{{ formatSla(item.slaMinutesLeft) }} · 提交 {{ item.submittedAt }}</div>
            <div class="pg-review-task-tags">
              <a-tag class="pg-pill-tag" :color="getPriorityColor(item)">{{ item.priority }}</a-tag>
              <a-tag class="pg-pill-tag" :color="getReviewMeta(item).color">{{ getReviewMeta(item).label }}</a-tag>
              <a-tag class="pg-pill-tag" :color="item.riskScore >= 80 ? 'red' : item.riskScore >= 60 ? 'orange' : 'green'">风险分 {{ item.riskScore }}</a-tag>
            </div>
          </div>
        </div>
      </a-card>

      <a-card :bordered="false" class="pg-review-pane" title="证据主面板">
        <template v-if="selected">
          <div class="pg-review-main-head">
            <a-image :src="selected.image" width="180" />
            <div>
              <h3>{{ selected.productName }}</h3>
              <p class="cell-sub">{{ selected.category }} · {{ selected.brand }}</p>
              <a-space wrap>
                <a-tag :color="getPriorityColor(selected)">优先级 {{ selected.priority }}</a-tag>
                <a-tag :color="getReviewMeta(selected).color">{{ getReviewMeta(selected).label }}</a-tag>
              </a-space>
            </div>
          </div>

          <div class="pg-review-grid mt16">
            <div class="pg-review-block">
              <div class="pg-review-block-title">机器预审命中</div>
              <a-tag v-for="tag in selected.riskTags" :key="tag" color="orange">{{ tag }}</a-tag>
              <p v-if="!selected.riskTags.length" class="cell-sub">当前无命中风险规则</p>
            </div>
            <div class="pg-review-block">
              <div class="pg-review-block-title">SKU 与利润摘要</div>
              <div class="metric-rows">
                <div class="metric"><span>参考售价</span><strong>¥{{ currentProduct?.price.toFixed(2) ?? '--' }}</strong></div>
                <div class="metric"><span>参考成本</span><strong>¥{{ currentProduct?.cost.toFixed(2) ?? '--' }}</strong></div>
                <div class="metric"><span>毛利率</span><strong>{{ marginText }}</strong></div>
              </div>
            </div>
            <div class="pg-review-block">
              <div class="pg-review-block-title">历史审核差异</div>
              <div class="cell-sub">上次审核单：{{ selected.previousReviewId || '首次审核' }}</div>
              <div class="cell-sub">上次结论：{{ currentProduct?.lastReviewDecision || '待审核' }}</div>
              <div class="cell-sub">最近复核：{{ currentProduct?.lastReviewAt || '-' }}</div>
            </div>
            <div class="pg-review-block">
              <div class="pg-review-block-title">合规证据片段</div>
              <div class="pg-evidence-item" v-for="item in evidenceRows" :key="item.title">
                <div class="pg-evidence-score">{{ item.score }}</div>
                <div class="pg-evidence-content">
                  <div class="pg-evidence-title">{{ item.title }}</div>
                  <div class="cell-sub">{{ item.desc }}</div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </a-card>

      <a-card :bordered="false" class="pg-review-pane" title="决策面板">
        <template v-if="selected">
          <a-alert
            v-if="isDirty"
            class="mb12"
            type="warning"
            show-icon
            message="当前有未提交修改，切换审核单会丢失这些修改。"
          />
          <a-form layout="vertical">
            <a-form-item label="审核结论">
              <a-radio-group v-model:value="formState.decision">
                <a-radio value="approved">通过审核</a-radio>
                <a-radio value="need_fix">要求补件</a-radio>
                <a-radio value="rejected">驳回</a-radio>
              </a-radio-group>
            </a-form-item>
            <a-form-item label="原因编码（结构化）">
              <a-select v-model:value="formState.reasonCodes" mode="multiple" allow-clear :options="reasonCodeOptions" />
            </a-form-item>
            <a-form-item label="整改要求（requiredFixes）">
              <a-textarea v-model:value="formState.requiredFixesText" :rows="3" placeholder="每行一条整改要求" />
            </a-form-item>
            <a-form-item label="证据要求（evidenceRequirements）">
              <a-textarea v-model:value="formState.evidenceText" :rows="3" placeholder="每行一条证据要求" />
            </a-form-item>
            <a-form-item label="补件截止时间">
              <a-date-picker v-model:value="formState.deadline" show-time value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
            </a-form-item>
            <a-form-item label="审核备注">
              <a-textarea v-model:value="formState.comment" :rows="3" placeholder="填写审核结论说明" />
            </a-form-item>
          </a-form>
          <a-space wrap>
            <a-button type="primary" @click="submitDecision">提交结论并下一单</a-button>
            <a-button @click="markResubmitted">标记商户重提</a-button>
            <a-button @click="transferRecheck">转复审队列</a-button>
          </a-space>
        </template>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { useRoute } from 'vue-router'
import {
  claimProductReviewTickets,
  getMallProductById,
  getMallProductReviewTickets,
  markProductReviewResubmitted,
  submitProductReviewDecision,
  transferProductReviewToRecheck,
} from '../../mock/governance'
import type { MallProductReviewTicket, ProductReviewStatus, ReviewPriority } from '../../types/governance'
import type { ReviewDecisionPayload } from '../../types/product-governance'
import { productReviewStatusConfig, reviewPriorityColor } from '../../utils/statusConfig'
import '../../styles/product-governance-v2.css'

type DecisionFormState = {
  decision: ReviewDecisionPayload['decision']
  reasonCodes: string[]
  requiredFixesText: string
  evidenceText: string
  comment: string
  deadline: string
}

const route = useRoute()
const tickets = ref<MallProductReviewTicket[]>([])
const selectedId = ref('')

const statusFilter = ref<'all' | ProductReviewStatus>('all')
const priorityFilter = ref<'all' | ReviewPriority>('all')
const selectedQueueIds = ref<string[]>([])

const formState = ref<DecisionFormState>({
  decision: 'need_fix',
  reasonCodes: [],
  requiredFixesText: '',
  evidenceText: '',
  comment: '',
  deadline: '',
})
const snapshotText = ref('')

const DRAFT_PREFIX = 'mall-admin-review-draft:'

const statusOptions = [
  { label: '全部状态', value: 'all' },
  { label: '已提交', value: 'submitted' },
  { label: '审核中', value: 'in_review' },
  { label: '补件中', value: 'need_fix' },
  { label: '重提待审', value: 'resubmitted' },
  { label: '审核通过', value: 'approved' },
  { label: '已驳回', value: 'rejected' },
]

const priorityOptions = [
  { label: '全部优先级', value: 'all' },
  { label: 'P0', value: 'P0' },
  { label: 'P1', value: 'P1' },
  { label: 'P2', value: 'P2' },
]

const reasonCodeOptions = [
  { label: 'IMG_CLAIM_OVER 主图夸大宣传', value: 'IMG_CLAIM_OVER' },
  { label: 'QUAL_EXPIRING 类目资质即将过期', value: 'QUAL_EXPIRING' },
  { label: 'AUTH_DOC_BLUR 授权书清晰度不足', value: 'AUTH_DOC_BLUR' },
  { label: 'SKU_INFO_MISSING SKU信息缺失', value: 'SKU_INFO_MISSING' },
]

const refreshTickets = () => {
  tickets.value = getMallProductReviewTickets()
}

refreshTickets()

const filteredTickets = computed(() =>
  tickets.value
    .filter((item) => (statusFilter.value === 'all' ? true : item.status === statusFilter.value))
    .filter((item) => (priorityFilter.value === 'all' ? true : item.priority === priorityFilter.value))
    .sort((a, b) => a.slaMinutesLeft - b.slaMinutesLeft),
)

const selected = computed(() => tickets.value.find((item) => item.id === selectedId.value) ?? null)
const currentProduct = computed(() => (selected.value ? getMallProductById(selected.value.productId) : null))

const marginText = computed(() => {
  const product = currentProduct.value
  if (!product || product.price <= 0) return '--'
  return `${(((product.price - product.cost) / product.price) * 100).toFixed(1)}%`
})

const evidenceRows = computed(() => {
  if (!selected.value) return []
  return selected.value.riskTags.map((tag, idx) => ({
    title: tag,
    score: String(Math.max(50, selected.value!.riskScore - idx * 8)),
    desc: idx === 0 ? '系统命中主规则，需要人工核验并给出结论。' : '建议复核证据链路并要求商户补充材料。',
  }))
})

const draftStorageKey = computed(() => `${DRAFT_PREFIX}${selectedId.value}`)

const serializeDraft = (draft: DecisionFormState) =>
  JSON.stringify({
    ...draft,
    reasonCodes: [...draft.reasonCodes].sort(),
  })

const isDirty = computed(() => serializeDraft(formState.value) !== snapshotText.value)

const parseLines = (value: string) =>
  value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)

const hydrateDraft = (ticket: MallProductReviewTicket) => {
  const raw = sessionStorage.getItem(`${DRAFT_PREFIX}${ticket.id}`)
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as DecisionFormState
      formState.value = {
        decision: parsed.decision || 'need_fix',
        reasonCodes: parsed.reasonCodes || [],
        requiredFixesText: parsed.requiredFixesText || '',
        evidenceText: parsed.evidenceText || '',
        comment: parsed.comment || '',
        deadline: parsed.deadline || '',
      }
      snapshotText.value = serializeDraft(formState.value)
      return
    } catch {
      sessionStorage.removeItem(`${DRAFT_PREFIX}${ticket.id}`)
    }
  }
  formState.value = {
    decision: ticket.status === 'approved' ? 'approved' : ticket.status === 'rejected' ? 'rejected' : 'need_fix',
    reasonCodes: [...ticket.reasonCodes],
    requiredFixesText: ticket.requiredFixes.join('\n'),
    evidenceText: ticket.evidenceRequirements.join('\n'),
    comment: '',
    deadline: ticket.deadline,
  }
  snapshotText.value = serializeDraft(formState.value)
}

watch(
  filteredTickets,
  (list) => {
    if (!list.length) {
      selectedId.value = ''
      return
    }
    const exists = list.some((item) => item.id === selectedId.value)
    if (!exists) selectedId.value = list[0].id
  },
  { immediate: true },
)

watch(
  () => route.query.productId,
  (productId) => {
    if (!productId) return
    const target = tickets.value.find((item) => item.productId === String(productId))
    if (target) selectedId.value = target.id
  },
  { immediate: true },
)

watch(
  () => route.query.ticketId,
  (ticketId) => {
    if (!ticketId) return
    const exists = tickets.value.find((item) => item.id === String(ticketId))
    if (exists) selectedId.value = exists.id
  },
  { immediate: true },
)

watch(
  selected,
  (ticket) => {
    if (!ticket) return
    hydrateDraft(ticket)
  },
  { immediate: true },
)

watch(
  formState,
  (draft) => {
    if (!selected.value) return
    sessionStorage.setItem(draftStorageKey.value, JSON.stringify(draft))
  },
  { deep: true },
)

const formatSla = (minutes: number) => (minutes < 0 ? `SLA超时 ${Math.abs(minutes)} 分钟` : `SLA剩余 ${minutes} 分钟`)
const getReviewMeta = (record: MallProductReviewTicket) => productReviewStatusConfig[record.status]
const getPriorityColor = (record: MallProductReviewTicket) => reviewPriorityColor[record.priority]

const requestSwitchTicket = (id: string) => {
  if (id === selectedId.value) return
  if (isDirty.value && !window.confirm('当前审核单有未提交修改，确认切换吗？')) {
    return
  }
  selectedId.value = id
}

const toggleQueueSelect = (id: string, checked: boolean) => {
  if (checked) {
    selectedQueueIds.value = [...new Set([...selectedQueueIds.value, id])]
    return
  }
  selectedQueueIds.value = selectedQueueIds.value.filter((item) => item !== id)
}

const claimSelected = () => {
  if (!selectedQueueIds.value.length) {
    message.warning('请先勾选审核单')
    return
  }
  claimProductReviewTickets(selectedQueueIds.value, 'auditor-01', '平台审核员A')
  refreshTickets()
  selectedQueueIds.value = []
  message.success('已领取选中审核单')
}

const jumpNextTicket = (priority: ReviewPriority) => {
  const next = filteredTickets.value.find(
    (item) =>
      item.id !== selectedId.value &&
      item.priority === priority &&
      (item.status === 'submitted' || item.status === 'resubmitted' || item.status === 'in_review'),
  )
  if (next) {
    selectedId.value = next.id
    return
  }
  if (filteredTickets.value.length) {
    selectedId.value = filteredTickets.value[0].id
  }
}

const submitDecision = () => {
  if (!selected.value) return
  const payload: ReviewDecisionPayload = {
    decision: formState.value.decision,
    reasonCodes: [...formState.value.reasonCodes],
    requiredFixes: parseLines(formState.value.requiredFixesText),
    evidenceRequirements: parseLines(formState.value.evidenceText),
    deadline: formState.value.deadline,
    comment: formState.value.comment,
    operatorId: 'auditor-01',
    operatorName: '平台审核员A',
    operateAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    sourceSystem: 'mall-admin',
    sourceBizId: selected.value.id,
    traceId: `trace-${selected.value.id}-${Date.now()}`,
  }
  try {
    submitProductReviewDecision(selected.value.id, payload)
    sessionStorage.removeItem(draftStorageKey.value)
    refreshTickets()
    const currentPriority = selected.value.priority
    jumpNextTicket(currentPriority)
    message.success('审核结论已提交，已联动消息中心、协同任务与审计日志')
  } catch (error) {
    message.error(error instanceof Error ? error.message : '提交失败，请稍后重试')
  }
}

const markResubmitted = () => {
  if (!selected.value) return
  markProductReviewResubmitted(selected.value.id, '商户运营提交')
  refreshTickets()
  message.success('已标记重提并写入协同日志')
}

const transferRecheck = () => {
  if (!selected.value) return
  transferProductReviewToRecheck(selected.value.id, 'auditor-01', '平台审核员A')
  refreshTickets()
  message.success('已转入复审队列')
}
</script>
