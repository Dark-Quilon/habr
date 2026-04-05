import type {
  ArticleDetail,
  ArticleList,
  ArticleParams,
  ArticleWriteData,
  AuthResponse,
  Comment,
  Notification,
  PaginatedResponse,
  Profile,
  ProfileUpdateData,
  Tag,
  User,
  VoteResponse,
  MarkReadResponse,
} from './types'

// Если переменная окружения пуста, используем точную ссылку на ваш бэкенд
const API_BASE = import.meta.env.VITE_API_URL || 'https://habr-backend.onrender.com/api/v1'

function getToken(): string | null {
  return localStorage.getItem('token')
}

export function setToken(token: string): void {
  localStorage.setItem('token', token)
}

export function removeToken(): void {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export function getStoredUser(): User | null {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Token ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    ...(token ? { cache: 'no-store' } : {}),
  })

  if (res.status === 401) {
    removeToken()
    window.location.href = '/login'
    return undefined as T
  }

  if (res.status === 403) throw new Error('Forbidden')
  if (res.status === 404) throw new Error('Not found')

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(text)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

// Статьи
export async function getArticles(params: ArticleParams = {}): Promise<PaginatedResponse<ArticleList>> {
  const qs = new URLSearchParams()
  if (params.page) qs.set('page', String(params.page))
  if (params.search) qs.set('search', params.search)
  if (params.tags__slug) qs.set('tags__slug', params.tags__slug)
  if (params.ordering) qs.set('ordering', params.ordering)
  const query = qs.toString() ? `?${qs.toString()}` : ''
  return apiFetch<PaginatedResponse<ArticleList>>(`/articles/${query}`)
}

export async function getArticle(slug: string): Promise<ArticleDetail> {
  return apiFetch<ArticleDetail>(`/articles/${slug}/`)
}

export async function createArticle(data: ArticleWriteData): Promise<ArticleDetail> {
  return apiFetch<ArticleDetail>('/articles/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateArticle(slug: string, data: Partial<ArticleWriteData>): Promise<ArticleDetail> {
  return apiFetch<ArticleDetail>(`/articles/${slug}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deleteArticle(slug: string): Promise<void> {
  return apiFetch<void>(`/articles/${slug}/`, { method: 'DELETE' })
}

export async function voteArticle(slug: string, value: 1 | -1): Promise<VoteResponse> {
  return apiFetch<VoteResponse>(`/articles/${slug}/vote/`, {
    method: 'POST',
    body: JSON.stringify({ value }),
  })
}

export async function getFeed(page?: number): Promise<PaginatedResponse<ArticleList>> {
  const query = page ? `?page=${page}` : ''
  return apiFetch<PaginatedResponse<ArticleList>>(`/articles/feed/${query}`)
}

// Комментарии
export async function getComments(slug: string): Promise<Comment[]> {
  const data = await apiFetch<PaginatedResponse<Comment> | Comment[]>(`/articles/${slug}/comments/`)
  return Array.isArray(data) ? data : data.results
}

export async function addComment(slug: string, content: string): Promise<Comment> {
  return apiFetch<Comment>(`/articles/${slug}/comments/`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  })
}

export async function deleteComment(slug: string, id: number): Promise<void> {
  return apiFetch<void>(`/articles/${slug}/comments/${id}/`, { method: 'DELETE' })
}

// Теги
export async function getTags(): Promise<Tag[]> {
  const data = await apiFetch<PaginatedResponse<Tag> | Tag[]>('/tags/')
  return Array.isArray(data) ? data : data.results
}

// Профили
export async function getProfile(username: string): Promise<Profile> {
  return apiFetch<Profile>(`/profiles/${username}/`)
}

export async function getMyProfile(): Promise<Profile> {
  return apiFetch<Profile>('/profiles/me/')
}

export async function updateMyProfile(data: ProfileUpdateData): Promise<Profile> {
  if (data.avatar instanceof File) {
    const form = new FormData()
    if (data.bio !== undefined) form.append('bio', data.bio)
    form.append('avatar', data.avatar)

    const token = getToken()
    const headers: Record<string, string> = {}
    if (token) headers['Authorization'] = `Token ${token}`

    const res = await fetch(`${API_BASE}/profiles/me/`, {
      method: 'PATCH',
      headers,
      body: form,
    })

    if (!res.ok) throw new Error(await res.text())
    return res.json() as Promise<Profile>
  }

  return apiFetch<Profile>('/profiles/me/', {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function followUser(username: string): Promise<{ is_following: boolean; followers_count: number }> {
  return apiFetch<{ is_following: boolean; followers_count: number }>(
    `/profiles/${username}/follow/`,
    { method: 'POST' },
  )
}

// Уведомления
export async function getNotifications(): Promise<PaginatedResponse<Notification>> {
  return apiFetch<PaginatedResponse<Notification>>('/notifications/')
}

export async function markNotificationsRead(): Promise<MarkReadResponse> {
  return apiFetch<MarkReadResponse>('/notifications/mark-read/', {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

// Аутентификация
export async function login(username: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export async function register(username: string, password1: string, password2: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/register/', {
    method: 'POST',
    body: JSON.stringify({ username, password1, password2 }),
  })
}

export async function logout(): Promise<void> {
  return apiFetch<void>('/auth/logout/', { method: 'POST' })
}

export async function getMe(): Promise<User> {
  return apiFetch<User>('/auth/me/')
}
