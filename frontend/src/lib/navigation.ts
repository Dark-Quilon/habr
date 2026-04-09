import { route } from 'preact-router'

/**
 * Навигация к тегу без перезагрузки страницы
 * Обновляет URL и состояние Home компонента
 */
export function navigateToTag(tagSlug: string) {
  const url = tagSlug ? `/?tags__slug=${tagSlug}` : '/'

  // Обновляем URL без перезагрузки
  window.history.pushState({ tag: tagSlug }, '', url)

  // Уведомляем Home компонент об изменении через кастомное событие
  window.dispatchEvent(new CustomEvent('tagChange', { detail: { tagSlug } }))
}

/**
 * Навигация к поиску без перезагрузки страницы
 */
export function navigateToSearch(searchQuery: string) {
  const url = searchQuery ? `/?search=${encodeURIComponent(searchQuery)}` : '/'

  window.history.pushState({ search: searchQuery }, '', url)
  window.dispatchEvent(new CustomEvent('searchChange', { detail: { search: searchQuery } }))
}
