import { useMutation, useQuery } from '@apollo/client'
import { ALL_AUTHORS, SET_BIRTHYEAR } from '../query'
import { useState } from 'react'
const Authors = (props) => {
  const result = useQuery(ALL_AUTHORS)
  const [author, setAuthor] = useState('')
  const [born, setBorn] = useState(null)
  const [setBrithyear] = useMutation(SET_BIRTHYEAR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  })
  if (!props.show) {
    return null
  }
  const authors = []

  if (result.loading) {
    return <div>loading</div>
  }
  console.log(result.data.allAuthors)
  authors.push(...result.data.allAuthors)
  console.log(authors)
  const handleSetBirthyear = async (event) => {
    event.preventDefault()
    setBrithyear({ variables: { author, born } })
    setAuthor('')
    setBorn(null)
  }
  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Set birthyear</h2>
      <form onSubmit={handleSetBirthyear}>
        <div>
          name
          <select
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
          >
            {authors.map((a) => (
              <option value={a.name}>{a.name}</option>
            ))}
          </select>
        </div>
        <div>
          born
          <input
            value={born}
            type='number'
            onChange={(event) => setBorn(Number(event.target.value))}
          />
        </div>
        <button type='submit'>update author</button>
      </form>
    </div>
  )
}

export default Authors
