import { useEffect, useState } from 'react'

export type Route = 'guest' | 'admin'

function parse(hash: string): Route {
  return /^#\/?admin\b/.test(hash) ? 'admin' : 'guest'
}

export function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parse(window.location.hash))
  useEffect(() => {
    const onChange = () => setRoute(parse(window.location.hash))
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}

export function guestUrl(): string {
  const url = new URL(window.location.href)
  url.hash = ''
  return url.toString()
}
