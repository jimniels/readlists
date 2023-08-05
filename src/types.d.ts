type Readlist = {
  version: string;
  title: string;
  home_page_url: "https://readlists.jim-nielsen.com";
  expired: true;
  // TODO automatically generate and point at `/api/new?url=<url1>&url=<url2>
  // feed_url: string;
  description: string;
  items: ReadlistArticle[];
};

type ReadlistArticle = {
  /** URL of article */
  id: string;
  url: string;

  content_html: string;

  /** ISO8601 string */
  date_published?: string;
  title?: string;
  authors?: Authors[];
  summary?: string;
  image?: string;
  /**
   * Provides extra information about the parser and meta from the parser
   * that's not part of the feed.
   */
  _readlist: {
    parser: ParserMercury | ParserMozilla;
  };
};

/**
 * Mercury parser metadata
 * FYI: If mercury can't find a field, it returns null.
 */
type ParserMercury = {
  name: "mercury";
  url: "https://github.com/postlight/parser";
  meta: {
    dek?: string;
    direction?: string; // "ltr"
    domain?: string; // "trackchanges.postlight.com",
    next_page_url?: string;
    rendered_pages?: number;
    total_pages?: number;
    // sometimes this is a string, that seems like a bug...
    word_count?: string | number;
  };
};

/**
 * Mozilla parser metadata
 *
 */
type ParserMozilla = {
  name: "mozilla-readability";
  url: "https://github.com/mozilla/readability";
  meta: {
    dir?: string;
  };
};

type Authors = {
  name?: string;
  url?: string;
  avatar?: string;
};

type OldReadlist = {
  title: string;
  description: string;
  date_created: string; // ISO8601 date
  date_modified: string; // ISO8601 date
  articles: MercuryArticle[];
};

/**
 * FYI: If mercury can't find a field, it returns null.
 */
type MercuryArticle = {
  author?: string;
  content?: string; // HTML string
  date_published?: string; // ISO8601 string
  dek?: string;
  direction?: string; // "ltr"
  domain?: string; // "trackchanges.postlight.com",
  excerpt?: string;
  lead_image_url?: string;
  next_page_url?: string; // optional
  rendered_pages?: number;
  title?: string;
  total_pages?: number;
  url?: string;
  word_count?: number;
};
