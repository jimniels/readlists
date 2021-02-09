import { isUrlAbsolute, resolveUrl, validateReadlist } from "./utils.js";
import chai from "chai";

chai.expect(isUrlAbsolute("https://google.com")).to.equal(true);
chai.expect(isUrlAbsolute("//google.com")).to.equal(true);
chai.expect(isUrlAbsolute("google.com")).to.equal(false);
chai.expect(isUrlAbsolute("www.google.com")).to.equal(false);
chai
  .expect(isUrlAbsolute("/path/to/file.png?target=http://google.com"))
  .to.equal(false);
chai.expect(isUrlAbsolute("./images/file.png")).to.equal(false);
chai.expect(isUrlAbsolute("images/file.png")).to.equal(false);

chai
  .expect(
    resolveUrl(
      "/assets/books/shapeup/1.5/payment_form_breadboard-277e13785f0ce02963ecd00ed13178b8fa6d1694097bd240188f2f1126a1683b.png",
      "https://basecamp.com/shapeup/1.1-chapter-02"
    )
  )
  .to.equal(
    "https://basecamp.com/assets/books/shapeup/1.5/payment_form_breadboard-277e13785f0ce02963ecd00ed13178b8fa6d1694097bd240188f2f1126a1683b.png"
  );

// note the difference between having and not having a trailing slash
chai
  .expect(
    resolveUrl(
      "../path/to/image.png",
      "https://blog.jim-nielsen.com/nested/article/"
    )
  )
  .to.equal("https://blog.jim-nielsen.com/nested/path/to/image.png");
chai
  .expect(
    resolveUrl(
      "../path/to/image.png",
      "https://blog.jim-nielsen.com/nested/article"
    )
  )
  .to.equal("https://blog.jim-nielsen.com/path/to/image.png");

const BASE_READLIST = {
  title: "",
  description: "",
  date_created: "2020-06-29T19:29:23.439Z",
  date_modified: "2020-06-29T19:29:23.439Z",
  articles: [],
};
const BASE_ARTICLE = {
  title: "Musings on the Documentary “For Everyone”",
  author: null,
  date_published: null,
  dek: null,
  lead_image_url: "https://cdn.jim-nielsen.com/shared/twitter-card.jpg",
  next_page_url: null,
  url:
    "https://blog.jim-nielsen.com/2020/musings-on-the-documentary-for-everyone/",
  domain: "blog.jim-nielsen.com",
  excerpt:
    "I recently watched the documentary “For Everyone”, which tells the story about Tim Berners Lee and the creation of the World Wide Web. There were a number of nuggets in this documentary, and I would&hellip;",
  word_count: 411,
  direction: "ltr",
  total_pages: 1,
  rendered_pages: 1,
  content: "<p>Some HTML here.</p>",
};

/*
{
  let readlist = { ...BASE_READLIST };
  chai.expect(validateReadlist(readlist)).to.deep.equal(readlist);

  delete readlist.title;
  chai.expect(validateReadlist(readlist)).to.equal(null);
}

{
  const readlist = { ...BASE_READLIST, date_created: "some-random-string" };
  chai.expect(validateReadlist(readlist)).to.equal(null);
}

{
  let readlist = {
    ...BASE_READLIST,
    articles: [{ ...BASE_ARTICLE }],
  };
  chai.expect(validateReadlist(readlist)).to.deep.equal(readlist);

  delete readlist.articles[0].title;
  chai.expect(validateReadlist(readlist)).to.equal(null);
}

{
  let readlist = {
    ...BASE_READLIST,
    articles: [{ ...BASE_ARTICLE, domain: "some-random-domain.com" }],
  };
  chai.expect(validateReadlist(readlist)).to.equal(null);
}
*/
