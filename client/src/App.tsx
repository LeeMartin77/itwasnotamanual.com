import React from 'react';
import './App.css';
import { PredictionDetailsComponent } from './components/prediction/PredictionDetailsComponent';
import { PredictionSummaryComponent } from './components/prediction/PredictionSummaryComponent';
import { Prediction } from './types/prediction';


const fakePrediction: Prediction = {
  id: "7e476c02-8aa6-4676-bd87-e24ca27710a8",
  // TODO: How do we generate this
  url: "nineteen-eighty-four-smart-speaker",
  openlibraryid: "OL1168083W",
  book_title: "Nineteen Eighty-Four",
  wiki: "Smart_speaker",
  wiki_title: "Smart speaker",
  quote: "He thought of the telescreen with its never-sleeping ear. They could spy upon you night and day, but if you kept your head, you could still outwit them."
}


function App() {
  return (
    <div className="App">
      <header className="App-header">
        <PredictionSummaryComponent prediction={fakePrediction} />
        <PredictionDetailsComponent prediction={fakePrediction} />
      </header>
    </div>
  );
}

export default App;
