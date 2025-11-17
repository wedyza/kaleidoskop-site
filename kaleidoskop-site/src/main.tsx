//import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import ScrollToTop from './components/ScrollToTop.tsx'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from './app/store.ts'

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    {/* <StrictMode> */}
      <BrowserRouter>
        <ScrollToTop />
        <App />
      </BrowserRouter>
    {/* </StrictMode> */}
  </Provider>
)
