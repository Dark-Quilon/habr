import { Router } from 'preact-router'
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
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Router>
          <Home path="/" />
          <ArticleDetail path="/articles/:slug" />
          <ArticleNew path="/articles/new" />
          <ArticleEdit path="/articles/:slug/edit" />
          <Login path="/login" />
          <Register path="/register" />
          <Profile path="/profile/:username" />
          <ProfileEdit path="/profile/me" />
          <Feed path="/feed" />
          <Notifications path="/notifications" />
          <Write path="/write" />
          <NotFound default />
        </Router>
      </main>
      <Footer />
    </>
  )
}
