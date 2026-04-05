export interface User {
  id: number
  username: string
}

export interface Tag {
  id: number
  name: string
  slug: string
}

export interface ArticleList {
  slug: string
  title: string
  content: string
  author: User
  tags: Tag[]
  views: number
  rating: number
  comments_count: number
  created_at: string
}

export interface ArticleDetail extends ArticleList {
  content: string
  user_vote: number | null
}

export interface ArticleParams {
  page?: number
  search?: string
  tags__slug?: string
  author__username?: string
  ordering?: string
}

export interface ArticleWriteData {
  title: string
  content: string
  tag_names?: string[]
}

export interface Comment {
  id: number
  content: string
  author: User
  created_at: string
}

export interface Profile {
  user: User
  avatar: string | null
  bio: string
  is_following?: boolean
  followers_count?: number
  articles?: ArticleList[]
}

export interface ProfileUpdateData {
  bio?: string
  avatar?: File
}

export interface Notification {
  id: number
  actor: User
  article: { slug: string; title: string }
  is_read: boolean
  created_at: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface AuthResponse {
  token: string
  user: User
}

export interface VoteResponse {
  rating: number
  user_vote: number | null
}

export interface MarkReadResponse {
  marked: number
}
