import { Prediction, PredictionDetail } from "../../../types/prediction";
import {
  formatOpenLibraryCoverUrlFromCoverNumber,
  getOpenLibraryAuthorByKey,
  getOpenLibraryWorkById,
} from "./thirdPartyDataAccess/openlibrary";
import {
  getWikipediaMedia,
  getWikipediaSummary,
} from "./thirdPartyDataAccess/wikipedia";

export async function getPredictionDetails(
  prediction: Prediction,
  fnGetOpenLibraryWorkById = getOpenLibraryWorkById,
  fnFormatOpenLibraryCoverUrlFromCoverNumber = formatOpenLibraryCoverUrlFromCoverNumber,
  fnGetOpenLibraryAuthorByKey = getOpenLibraryAuthorByKey,
  fnGetWikipediaSummary = getWikipediaSummary,
  fnGetWikipediaMedia = getWikipediaMedia,
): Promise<PredictionDetail> {
  let loadedDetails: PredictionDetail = {
    ...prediction,
    book: {
      title: "",
      authors: [],
      description: ""
    },
    subject: {
      title: "",
      image_url: "",
      extract: ""
    },
  };
  // TODO: I mean there is a lot to do but rather than a massive chain we could
  // do some stuff concurrently
  const data = await fnGetOpenLibraryWorkById(prediction.openlibraryid);
  if (data.covers.length > 0) {
    loadedDetails.book.cover_url_lg = fnFormatOpenLibraryCoverUrlFromCoverNumber(
      data.covers[0], "L"
    );
    loadedDetails.book.cover_url_md = fnFormatOpenLibraryCoverUrlFromCoverNumber(
      data.covers[0], "M"
    );
    loadedDetails.book.cover_url_sm = fnFormatOpenLibraryCoverUrlFromCoverNumber(
      data.covers[0], "S"
    );
  }
  loadedDetails.book.title = data.title;
  loadedDetails.book.description = typeof data.description === "string" ? data.description : (data.description as any).value;

  // TODO: We'll need to change this to load many, but one will do for now
  const author_data = await fnGetOpenLibraryAuthorByKey(
    data.authors[0].author.key
  );

  loadedDetails.book.authors.push({ personal_name: author_data.personal_name });

  const wikidata = await fnGetWikipediaSummary(prediction.wiki);
  loadedDetails.subject.title = wikidata.title;
  loadedDetails.subject.extract = wikidata.extract;

  const wikimedia = await fnGetWikipediaMedia(prediction.wiki);

  if (wikimedia.items.length > 0) {
    const featured = wikimedia.items.find((x) => x.leadImage);
    // TODO: Should probably check scalings too...
    if (featured) {
      loadedDetails.subject.image_url = "https:" + featured.srcset[0].src;
    } else {
      loadedDetails.subject.image_url =
        "https:" + wikimedia.items[0].srcset[0].src;
    }
  }

  return loadedDetails;
}
