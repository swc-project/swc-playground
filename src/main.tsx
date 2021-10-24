import { render } from 'react-dom'
import App from './App'

const container = document.createElement('div')
document.body.appendChild(container)

render(<App />, container)
