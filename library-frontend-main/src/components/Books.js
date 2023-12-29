import { useQuery } from '@apollo/client'
import { ALL_BOOKS, ALL_GENRES } from '../query'
import { useState } from 'react'
const Books = (props) => {
  const [genresfilter, setGenresfilter] = useState(null)
  const genres = useQuery(ALL_GENRES)
  const result = useQuery(ALL_BOOKS, { variables: { genre: genresfilter } })
  console.log(genres)
  console.log(result)
  if (!props.show) {
    return null
  }
  if (result.loading) {
    return <div>loading</div>
  }
  const books = []
  books.push(...result.data.allBooks)
  const bookGenres = [...genres.data.bookGenres]
  // if (books) {
  //   books.map((b) =>
  //     b.genres.forEach((element) => {
  //       console.log(element)
  //       if (!bookGenres.find((g) => g === element)) {
  //         bookGenres.push(element)
  //         console.log(bookGenres)
  //       }
  //     })
  //   )
  // }

  return (
    <div>
      <h2>books</h2>
      {genresfilter ? (
        <div>
          in genre <b>{genresfilter}</b>
        </div>
      ) : (
        <div>all genres</div>
      )}
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books
            .filter((b) =>
              genresfilter ? b.genres.find((g) => g === genresfilter) : true
            )
            .map((a) => (
              <tr key={a.title}>
                <td>{a.title}</td>
                <td>{a.author.name}</td>
                <td>{a.published}</td>
              </tr>
            ))}
        </tbody>
      </table>
      <div>
        {bookGenres.map((g) => (
          <button key={g} onClick={() => setGenresfilter(g)}>
            {g}
          </button>
        ))}
        <button onClick={() => setGenresfilter(null)}>all genres</button>
      </div>
    </div>
  )
}

export default Books
