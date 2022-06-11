# itwasnotamanual.com

The idea here is simple, a catalogue of dystopian sci-fi ideas that modern life seems to have used as a blueprint, which users can submit and vote on.

The application is built around CDK, with a cloudfront hosted frontend client and a lambda-based API powering it, with DynamoDB acting as the storage layer

### Sitemap
- `/`: Random prediction (reroll button to start, later make it the start of ranking)
  - Ranking should be "Yes", "No"
  - When the user has ranked all predictions, replace Rank buttons with "Random" and "List"
- `/predictions`: Ranked list of predictions
- `/prediction/:url`: A single book/subject prediction
- `/submit`: Interface to add a new prediction

#### TODO
- `/books`: List of books by number of predictions
- `/book/:url`: A single book with a list of it's predictions

## More TODO

- Add a "Skip" button
- Add an explanation dialog when first opening page
- Permalink needs to be clearer (call it "share")
- Add open library and wiki summaries under voting buttons
  - article first
- Quote needs quotemarks/to be clearer it's a quote