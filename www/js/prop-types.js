import pt from "prop-types";

/**
 * @typedef Readlist
 * @param {string} title
 * @param {description} description
 * @param {string} dateCreated - ISO8601 date
 * @param {string} dateModified - ISO8601 date
 * @param {Array.<MercuryArticle>}
 */

/**
 * FYI: If mercury can't find a field, it returns null.
 * @typedef MercuryArticle
 * @param {string} author
 * @param {string} content - HTML string
 * @param {string} date_published - ISO8601 string
 * @param {} dek
 * @param {string} direction - "ltr"
 * @param {string} domain - "trackchanges.postlight.com",
 * @param {string} excerpt
 * @param {string} lead_image_url
 * @param {string} next_page_url - optional
 * @param {number} rendered_pages
 * @param {string} title
 * @param {number} total_pages
 * @param {string} url
 * @param {number} word_count
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
