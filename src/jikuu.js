import Jikuu from './decorator'
import './jikuu.scss'

// Enable hot reloading for development.
if (module.hot) module.hot.accept()

// Bind Jikuu to the global window object to expose it to the inline <script> tags.
window.Jikuu = Jikuu
