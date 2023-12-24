import { LOG_IN, ALL_AUTHORS, ALL_BOOKS } from '../query'
import { useState, useEffect } from 'react'
import { useMutation } from '@apollo/client'

const LogInForm = ({ setToken }) => {
  const [username, setUsername] = useState()
  const [password, setPassword] = useState()
  const [LogIn, result] = useMutation(LOG_IN, {
    refetchQueries: [{ query: ALL_BOOKS }, { query: ALL_AUTHORS }],
  })
  useEffect(() => {
    if (result.data) {
      console.log(result.data)
      const token = result.data.login.value
      console.log(token)
      setToken(token)
      localStorage.setItem('logInUserToken', token)
    }
  }, [result.data])
  const handleLogin = async (event) => {
    event.preventDefault()

    LogIn({ variables: { username: username, password: password } })
    setUsername()
    setPassword()
  }
  return (
    <div>
      <h2>Log in</h2>
      <form onSubmit={handleLogin}>
        <div>
          username
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </div>
        <div>
          password
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <button type='submit'>log in</button>
      </form>
    </div>
  )
}
export default LogInForm
