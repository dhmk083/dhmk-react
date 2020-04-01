import React from 'react'
import { StaticRouter, Route } from 'react-router-dom'
import { render } from '@testing-library/react'

import { useRelativeRoute } from './router'

test('useRouteBuilder', () => {
  const Comp = ({ location, routePath }) => {
    return (
      <StaticRouter location={location}>
        <Route path={routePath}>
          <Route component={Inner} />
        </Route>
      </StaticRouter>
    )
  }
  const Inner = () => {
    const { url, path } = useRelativeRoute()

    return (
      <div>
        <p>{path('subpath')}</p>
        <p>{url('suburl')}</p>
      </div>
    )
  }

  for (const location of ['/main', '/main/']) {
    const { container } = render(<Comp location={location} routePath="/:arg" />)
    const [path, url] = [...(container.querySelectorAll('p') as any)]
    expect(path.textContent).toBe('/:arg/subpath')
    expect(url.textContent).toBe('/main/suburl')
  }
})
