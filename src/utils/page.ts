import { base, moreLocales } from '@/config'
import { getLangFromPath } from '@/i18n/lang'
import { getLocalizedPath } from '@/i18n/path'

// Determine if the path matches a specific page type
function matchPageType(path: string, prefix: string = '') {
  // Remove base path if configured
  const pathWithoutBase = base && path.startsWith(base)
    ? path.slice(base.length)
    : path

  // Remove leading and trailing slashes from the path
  const normalizedPath = pathWithoutBase.replace(/^\/|\/$/g, '')

  // Homepage check: matches root path ('') or language code ('en', 'zh-tw'),
  // plus paginated home pages ('page/2', 'en/page/2')
  if (prefix === '') {
    const segments = normalizedPath.split('/').filter(Boolean)
    if (segments.length > 0 && (moreLocales as readonly string[]).includes(segments[0])) {
      segments.shift()
    }
    return segments.length === 0
      || (segments.length === 2 && segments[0] === 'page' && /^\d+$/.test(segments[1]))
  }

  // Ensure strict segment boundary matching to prevent partial matches
  const startsWithSegment = (target: string, segment: string) =>
    target === segment || target.startsWith(`${segment}/`)

  // Match both default language paths and localized paths
  return startsWithSegment(normalizedPath, prefix)
    || moreLocales.some(lang => startsWithSegment(normalizedPath, `${lang}/${prefix}`))
}

export function isHomePage(path: string) {
  return matchPageType(path)
}

export function isPostPage(path: string) {
  return matchPageType(path, 'posts')
}

export function isTagPage(path: string) {
  return matchPageType(path, 'tags')
}

export function isAboutPage(path: string) {
  return matchPageType(path, 'about')
}

// Returns page context with language, page types and localization helper
export function getPageInfo(path: string) {
  const currentLang = getLangFromPath(path)
  const isHome = isHomePage(path)
  const isPost = isPostPage(path)
  const isTag = isTagPage(path)
  const isAbout = isAboutPage(path)

  return {
    currentLang,
    isHome,
    isPost,
    isTag,
    isAbout,
    getLocalizedPath: (targetPath: string) =>
      getLocalizedPath(targetPath, currentLang),
  }
}
