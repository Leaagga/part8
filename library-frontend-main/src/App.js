import { useEffect, useState } from 'react'
import { useSubscription } from '@apollo/client'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LogInForm from './components/LogInForm'
import Recommendation from './components/Recommendation'
import { BOOK_ADDED } from './query'
const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)
  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      console.log(data)

      const title = data.data.bookAdded.title
      const author = data.data.bookAdded.author.name
      window.alert(`${title} by ${author} added`)
    },
  })
  let savedToken = null
  useEffect(() => {
    savedToken = localStorage.getItem('logInUserToken')
    if (savedToken) {
      setToken(savedToken)
    }
  }, [token])
  const handleLogout = () => {
    setToken(null)
    localStorage.removeItem('logInUserToken')
  }
  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {!token ? (
          <>
            <button onClick={() => setPage('login')}>log in</button>
          </>
        ) : (
          <>
            <button onClick={() => setPage('add')}>add book</button>
            <button onClick={() => setPage('recommendation')}>
              recommendation
            </button>
            <button onClick={handleLogout}>log out</button>
          </>
        )}
      </div>
      <Authors show={page === 'authors'} />
      <Books show={page === 'books'} />
      <NewBook show={page === 'add'} />
      {page === 'recommendation' ? <Recommendation /> : null}
      {page === 'login' ? <LogInForm setToken={setToken} /> : null}
    </div>
  )
}

export default App
