# itwasnotamanual.com

The idea here is simple, a catalogue of dystopian sci-fi ideas that modern life seems to have used as a blueprint

## Working ideas

### Core/MVP

Each entry should be:
- "Private" ID
- Wikipedia link
  - This represents "Real life" - We'll also grab details on the fly here from the [API](https://en.wikipedia.org/api/rest_v1/)
- OpenLibrary Number
  - This is the fiction - we'll look up details on the fly from [OpenLibrary](https://openlibrary.org/dev/docs/api/books)
- Quote
  - Free text, limited to 280 characters (a-la twitter)

We'll store these in Dynamo, and serve them via a lambda API, with a pretty aggressive CF distribution in front of it.

The site itself will be a React app

### Planned sitemap:
- `/`: Random prediction (reroll button to start, later make it the start of ranking)
  - Ranking should be "Yes", "No"
  - When the user has ranked all predictions, replace Rank buttons with "Random" and "List"
- `/predictions`: Ranked list of predictions
- `/prediction/:url`: A single book/subject prediction
- `/submit`: Interface to add a new prediction
- `/books`: List of books by number of predictions
- `/book/:url`: A single book with a list of it's predictions

### Ideas to add

- User submission
  - This is the big one, and will take this from a very static site to something "useful".
  - Users can submit a tuple they think is accurate
  - If it already exists, just bin the suggestion silently.
  - We can moderate these to start
- User moderation as a Feature
  - *** At this point we'll need cookies ***
  - Just a unique user/machine ID - we won't bother giving them identities
  - Users can vote (swipe left or right in future?) on entries
  - This should be done using token voting to try and avoid abuse
    - User requests to vote
    - User gets a response with a token, and a ~~random~~ algorithmic link/isbn/quote they haven't voted on
    - User votes
    - Vote is reconciled against actual ID of entry
  - Also includes two other buttons:
    - Suggest edit (to edit a quote)
    - Flag for Moderation (to avoid abuse)

### Far future ideas

- Allow for films and TV as well
- Allow links to things other than wikipedia (still curated, maybe things like BBC news, amazon?)

### Extras

- "Admin" console that hooks into Dynamo directly, run from development machine
  - This can be pretty crude to start, maybe in the future we can refactor to be a "real" admin console.