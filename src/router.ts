import { useRouteMatch } from 'react-router-dom'

const joinUrls = (a, b) => a.replace(/\/+$/, '') + '/' + b.replace(/^\/+/, '')

export const useRelativeRoute = () => {
  const match = useRouteMatch()
  return {
    url: (x: string) => joinUrls(match.url, x),
    path: (x: string) => joinUrls(match.path, x),
  }
}
