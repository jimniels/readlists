import { PropTypes as pt } from "./deps.js";

/**
 * @typedef Readlist
 * @property {string} version
 * @property {string} title
 * @property {string} home_page_url - readlists.jim-nielsen.com
 * @property {string} feed_url - readlists.jim-nielsen.com/feedgen?url=<item1-url>&url=<item2-url>
 * @property {string} description
 * @property {Object} _readlist
 * @property {string} _readlist.date_published - ISO8601 date
 * @property {string} _readlist.date_modified - ISO8601 date
 * @property {ReadlistArticle[]} items
 */

/**
 * FYI: If mercury can't find a field, it returns null.
 * @typedef ReadlistArticle
 * @property {string} id - URL of article
 * @property {string?} content_html - String of HTML
 * @property {string?} date_published - ISO8601 string
 * @property {string?} title
 * @property {string?} url - URL of article
 * @property {Authors[]?} authors
 * @property {string?} summary
 * @property {string?} lead_image_url
 *
 * @property {Object?} _readlist
 * @property {(ParserMetaMercury | ParserMetaMozilla)?} _readlist.parser_meta - Extra fields provided by the parser that was used
 */

/**
 * Mercury parser metadata
 * @typedef ParserMetaMercury
 * @property {"mercury"} name
 * @property {string?} dek
 * @property {string?} direction - "ltr"
 * @property {string?} domain - "trackchanges.postlight.com",
 * @property {string?} next_page_url
 * @property {number?} rendered_pages
 * @property {number?} total_pages
 * @property {number?} word_count
 */

/**
 * Mozilla parser metadata
 * @typedef ParserMetaMozilla
 * @property {"mozilla"} name
 */

/**
 * Authors object
 * @typedef Authors
 * @property {string?} name
 * @property {string?} url
 * @property {string?} avatar
 */

export const readlistArticlePropTypes = pt.shape({
  author: pt.string,
  content: pt.string.isRequired,
  date_published: pt.string,
  dek: pt.string,
  direction: pt.string,
  domain: pt.string,
  lead_image_url: pt.string,
  next_page_url: pt.string,
  rendered_pages: pt.number,
  title: pt.string.isRequired,
  total_page: pt.string,
  url: pt.string.isRequired,
  // sometimes this is a string, that seems like a bug...
  word_count: pt.oneOfType([pt.number, pt.string]),
});
