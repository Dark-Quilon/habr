import { render } from 'preact'
import { Router } from 'preact-router'
import App from './App'
import './styles/globals.scss'

render(<App />, document.getElementById('app') as HTMLElement)
