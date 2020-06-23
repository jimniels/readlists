import { isUrlAbsolute, resolveImgSrc } from "./utils.js";
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
    resolveImgSrc(
      "https://basecamp.com/shapeup/1.1-chapter-02",
      "/assets/books/shapeup/1.5/payment_form_breadboard-277e13785f0ce02963ecd00ed13178b8fa6d1694097bd240188f2f1126a1683b.png"
    )
  )
  .to.equal(
    "https://basecamp.com/assets/books/shapeup/1.5/payment_form_breadboard-277e13785f0ce02963ecd00ed13178b8fa6d1694097bd240188f2f1126a1683b.png"
  );

// note the difference between having and not having a trailing slash
chai
  .expect(
    resolveImgSrc(
      "https://blog.jim-nielsen.com/nested/article/",
      "../path/to/image.png"
    )
  )
  .to.equal("https://blog.jim-nielsen.com/nested/path/to/image.png");
chai
  .expect(
    resolveImgSrc(
      "https://blog.jim-nielsen.com/nested/article",
      "../path/to/image.png"
    )
  )
  .to.equal("https://blog.jim-nielsen.com/path/to/image.png");
