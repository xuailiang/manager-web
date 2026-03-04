export type UserRole = 'super_admin' | 'auditor' | 'operator' | 'finance'

const TOKEN_KEY = 'mall_admin_token'
const ROLE_KEY = 'mall_admin_role'
const NAME_KEY = 'mall_admin_name'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

export const getRole = () => (localStorage.getItem(ROLE_KEY) as UserRole | null) ?? null
export const setRole = (role: UserRole) => localStorage.setItem(ROLE_KEY, role)
export const clearRole = () => localStorage.removeItem(ROLE_KEY)

export const getName = () => localStorage.getItem(NAME_KEY) ?? '一卡通商城平台'
export const setName = (name: string) => localStorage.setItem(NAME_KEY, name)
export const clearName = () => localStorage.removeItem(NAME_KEY)

export const clearAuth = () => {
  clearToken()
  clearRole()
  clearName()
}
