export interface SiteMessage {
    id: string
    title: string
    description?: string
    type: 'notification' | 'message' | 'todo' | 'alert'
    isRead: boolean
    createdAt: string
}
