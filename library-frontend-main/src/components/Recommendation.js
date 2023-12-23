import { useQuery } from '@apollo/client'
import { ALL_BOOKS, GET_USER } from '../query'
const Recommendation = () => {
  const user = useQuery(GET_USER)
  const books = useQuery(ALL_BOOKS)
  if (user.loading || books.loading) {
    return <div>loading</div>
  }
  console.log(user)
  const recommendation = user.data.me.favoriteGenre
  const recommendBooks = books.data.allBooks.filter((b) =>
    b.genres.includes(recommendation)
  )
  return (
    <div>
      <h2>Recommendations</h2>
      <div>
        books in your favorite genre <b>{recommendation}</b>
      </div>
      <table>
        <tr>
          <th></th>
          <th>author</th>
          <th>published</th>
        </tr>
        {recommendBooks.map((b) => (
          <tr key={b.title}>
            <td>{b.title}</td>
            <td>{b.author.name}</td>
            <td>{b.published}</td>
          </tr>
        ))}
      </table>
    </div>
  )
}
export default Recommendation
