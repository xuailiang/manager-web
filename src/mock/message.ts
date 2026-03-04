import type { SiteMessage } from '../types/message'

const deepClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj))

// Initial mock data
const mockMessages: SiteMessage[] = [
    {
        id: 'msg-1',
        title: '系统升级维护通知',
        description: '治理中心将于本周六凌晨 2:00-4:00 进行停机维护网络组升级，届时管控审核操作将受限。',
        type: 'notification',
        isRead: false,
        createdAt: '2026-03-04 10:30',
    },
    {
        id: 'msg-2',
        title: '店铺 [华强北专营] 申诉待处理',
        description: '商家补充了发票和运单物流记录，请尽快前往【申诉流转中心】复核。',
        type: 'todo',
        isRead: false,
        createdAt: '2026-03-04 11:15',
    },
    {
        id: 'msg-3',
        title: '新活动报名申请待审批',
        description: '收到了一份 S 级【女神节特卖】大促的联合品牌发券资格审批。',
        type: 'todo',
        isRead: true,
        createdAt: '2026-03-03 16:40',
    },
    {
        id: 'msg-4',
        title: '风险告警：聚集性下单特征触发',
        description: '拦截到涉嫌异地机器大规模领用券池异常，请前往【异常核销工单池】断链止损。',
        type: 'alert',
        isRead: false,
        createdAt: '2026-03-04 14:10',
    },
    {
        id: 'msg-5',
        title: '用户 @yuxinji 您好，欢迎加入',
        description: '系统检测到您所在的超管权限组合更新，这是系统为您生成的基础入门向导。',
        type: 'message',
        isRead: true,
        createdAt: '2026-02-28 09:00',
    },
    {
        id: 'msg-6',
        title: '商品 [高仿运动鞋] 客诉率飙升',
        description: '该款商品24小时内客单纠纷突破设定阈值，已触发二级警告。',
        type: 'alert',
        isRead: false,
        createdAt: '2026-03-04 13:00',
    }
]

export const getMessages = (): SiteMessage[] => {
    return deepClone(mockMessages)
}

export const getUnreadCount = (): number => {
    return mockMessages.filter(m => !m.isRead).length
}

export const markAsRead = (id: string): SiteMessage | undefined => {
    const msg = mockMessages.find(m => m.id === id)
    if (msg && !msg.isRead) {
        msg.isRead = true
        return deepClone(msg)
    }
    return undefined
}

export const markAllAsRead = (): void => {
    mockMessages.forEach(m => {
        m.isRead = true
    })
}

export const clearAllRead = (): void => {
    // Only keep unread messages
    const unreadMessages = mockMessages.filter(m => !m.isRead)
    mockMessages.splice(0, mockMessages.length, ...unreadMessages)
}
