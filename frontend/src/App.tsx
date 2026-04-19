import { Router } from 'preact-router'
import { useState, useEffect } from 'preact/hooks'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import ArticleDetail from './pages/ArticleDetail'
import ArticleNew from './pages/ArticleNew'
import ArticleEdit from './pages/ArticleEdit'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import ProfileEdit from './pages/ProfileEdit'
import Feed from './pages/Feed'
import Notifications from './pages/Notifications'
import Write from './pages/Write'
import Reports from './pages/Reports'
import About from './pages/About'
import NotFound from './pages/NotFound'

export default function App() {
  const [routerKey, setRouterKey] = useState(0)

  useEffect(() => {
    const handleRouteChange = () => {
      setRouterKey(k => k + 1)
    }
    window.addEventListener('popstate', handleRouteChange)
    return () => window.removeEventListener('popstate', handleRouteChange)
  }, [])

  return (
    <>
      <Navbar />
      <main>
        <Router key={routerKey}>
          <Home path="/" />
          <ArticleDetail path="/articles/:slug" />
          <ArticleNew path="/articles/new" />
          <ArticleEdit path="/articles/:slug/edit" />
          <Login path="/login" />
          <Register path="/register" />
          <ProfileEdit path="/profile/me" />
          <Profile path="/profile/:username" />
          <Feed path="/feed" />
          <Notifications path="/notifications" />
          <Write path="/write" />
          <Reports path="/reports" />
          <About path="/about" />
          <NotFound default />
        </Router>
      </main>
      <Footer />
    </>
  )
}
