import { request, gql } from 'graphql-request'

const query = gql`
query frontpageQuery($searchString: String!, $searchContexts: [String]) {
  search(searchString: $searchString, searchContexts: $searchContexts) {
    results {
      ... on PropertyResult {
        pinnum
        address
        city
        zipcode
      }
    }
  }
}
`
let variables = {"searchString": "70 Court", "searchContexts": ["property"]}

request('https://dev-data-api1.ashevillenc.gov/graphql', query, variables).then((data) => {
  console.log(data.search[0].results)
})
