const chai = require("chai");
const { resolveImgPathsInHtml } = require("./utils.js");

chai
  .expect(
    resolveImgPathsInHtml({
      url: "https://jim-nielsen.com/path/to/resource",
      html: `<img src="/path/to/image.png">`,
    })
  )
  .to.equal(`<img src="https://jim-nielsen.com/path/to/image.png">`);

chai
  .expect(
    resolveImgPathsInHtml({
      url: "https://www.jim-nielsen.com/path/to/resource/",
      html: `<img src="./path/to/image.png">`,
    })
  )
  .to.equal(
    `<img src="https://www.jim-nielsen.com/path/to/resource/path/to/image.png">`
  );

chai
  .expect(
    resolveImgPathsInHtml({
      url: "https://jim-nielsen.com/path/to/resource/",
      html: `<img src="https://jim-nielsen.com/path/to/image.png">`,
    })
  )
  .to.equal(`<img src="https://jim-nielsen.com/path/to/image.png">`);

chai
  .expect(
    resolveImgPathsInHtml({
      url: "https://jim-nielsen.com/path/to/resource/",
      html: `<img src="../image.png">`,
    })
  )
  .to.equal(`<img src="https://jim-nielsen.com/path/to/image.png">`);

chai
  .expect(
    resolveImgPathsInHtml({
      url: "https://jim-nielsen.com/path/to/resource",
      html: `<img src="./image.png">`,
    })
  )
  .to.equal(`<img src="https://jim-nielsen.com/path/to/image.png">`);

chai
  .expect(
    resolveImgPathsInHtml({
      url: "https://jim-nielsen.com/path/to/resource",
      html: `<img src="//google.com/path/to/image.png">`,
    })
  )
  .to.equal(`<img src="https://google.com/path/to/image.png">`);
