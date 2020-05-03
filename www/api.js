// @TODO get dropbox as es module?
// @TODO dropbox access token has to be entered, like a password, then stored
//       in session storage for easy access later on

// import { Dropbox } from "https://unpkg.com/dropbox@4.0.30/es/index.es6.js?module";

export const dbx = new window.Dropbox.Dropbox({
  accessToken: "", // we'll set this when we auth
  fetch: window.fetch,
});

/**
 * Delete a list by removing the entire folder and its contents from dropbox
 * @param {string} listId
 */
export function deleteList(listId) {
  return dbx.filesDelete({ path: `/test/${listId}` });
}

/**
 * Delete an article.
 * Must be deleted from the list itself, then the correspnoding .html file deleted
 * @param {string} articleId
 * @param {List} list
 * @returns {List}
 */
export function deleteArticle(articleId, list) {
  const modifiedList = {
    ...list,
    articles: list.articles.filter((article) => article.id != articleId),
  };

  return dbx
    .filesDelete({
      path: `/test/${list.id}/${articleId}.article.html`,
    })
    .then(() => putList(modifiedList))
    .then(() => modifiedList);
}

/**
 * 1. Retrieve an article from mercury
 * 2. Store the HTML contents of the article separately
 * 3. Create an `article` type and add it to our list
 * 4. Post the list to dropbox
 * @param {string} url
 * @param {List} list
 * @returns {List}
 */
export function putArticle(url, list) {
  let articleHtml = "";
  let modifiedList = {};

  // @TODO validate params

  return fetch(`/api/mercury/?url=${url}`)
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error("Mercury failed to parse the given URL.");
      }
    })
    .then((mercuryArticle) => {
      const { content, ...restOfarticle } = mercuryArticle;
      articleHtml = content;
      const article = {
        id: Date.now(),
        ...restOfarticle,
      };

      modifiedList = {
        ...list,
        articles: list.articles.concat(article),
      };

      return Promise.all([
        putFile(
          `/test/${modifiedList.id}/list.json`,
          JSON.stringify(modifiedList, null, 2)
        ),
        putFile(
          `/test/${modifiedList.id}/${article.id}.article.html`,
          articleHtml
        ),
      ]);
    })
    .then(() => {
      return modifiedList;
    });
}

/**
 * Generic file upload
 * @param {*} path
 * @param {*} contents
 */
function putFile(path, contents) {
  // Get the filename from the path
  const filename = path.slice(path.lastIndexOf("/") + 1, path.length);
  // Upload!
  return dbx.filesUpload({
    path,
    contents: new File([contents], filename, {
      type: "text",
    }),
    mode: { ".tag": "overwrite" },
    autorename: false,
  });
}

/**
 * Put a list to dropbox.
 * @param {List} list
 */
export function putList(list) {
  return putFile(`/test/${list.id}/list.json`, JSON.stringify(list, null, 2));
  // return dbx.filesUpload({
  //   path: `/test/${list.id}/list.json`,
  //   contents: new File([JSON.stringify(list, null, 2)], "list.json", {
  //     type: "application/json",
  //   }),
  //   mode: { ".tag": "overwrite" },
  //   autorename: false,
  // });
}

export function createList() {
  const id = Date.now();
  // Apr 27, 2020
  const prettyDate = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(id));
  const contents = {
    id,
    title: `My Readlist (${prettyDate})`,
    description: "[[ description ]]",
    articles: [],
  };
  return new Promise((resolve, reject) => {
    try {
      dbx
        .filesUpload({
          path: `/test/${id}/list.json`,
          contents: new File([JSON.stringify(contents, null, 2)], "list.json", {
            type: "application/json",
          }),
          mode: { ".tag": "add" },
          autorename: false,
        })
        .then((res) => {
          resolve(id);
        });
    } catch (e) {
      reject();
    }
  });
}

export function getLists() {
  return new Promise((resolve, reject) => {
    try {
      dbx
        .filesListFolder({ path: "/test/" })
        // list of files, get just the .list.json
        .then((res) => {
          const listFolderIds = res.entries
            .filter((entry) => entry[".tag"] === "folder")
            .map((entry) => entry.path_lower.replace("/test/", ""));
          return Promise.all(
            listFolderIds.map((folderId) =>
              dbx
                .filesDownload({ path: `/test/${folderId}/list.json` })
                .then((file) => {
                  console.log(file);
                  return file.fileBlob.text();
                })
                .then((fileContents) => JSON.parse(fileContents))
            )
          );
        })
        .then((Lists) => {
          resolve(Lists);
        });
    } catch (e) {
      console.error(e);
      reject();
    }
  });
}

export function getList(id) {
  return new Promise((resolve, reject) => {
    dbx
      .filesDownload({ path: `/test/${id}/list.json` })
      .then((file) => {
        var reader = new FileReader();
        reader.onload = () => {
          resolve(JSON.parse(reader.result));
        };
        reader.onerror = () => {
          // reject(); // @TODO this isn't handled
        };
        reader.readAsText(file.fileBlob);
      })
      .catch((err) => reject(err));
  });
}

/**
 * @typedef MercuryArticle
 * Example:
 * author: "Jeremy Mack",
 * content: "<div class="body__content"> <p><a href="https://github.com/postlight/awesome-cms">Awesome CMS</a> is…an awesome list of awesome content management systems, grouped by language and ordered by popularity. It’s on GitHub, so anyone can add to it via a pull request.</p>↵<p>Check it out:</p>↵<blockquote class="embedly-card"> <p>📚 A collection of open and closed source Content Management Systems (CMS) for your perusal. – postlight/awesome-cms</p>↵</blockquote> <p>Here are some notes on how and why Awesome CMS came to be.</p>↵<h3>Compilation</h3>↵<p>GitHub has a <a href="https://help.github.com/articles/search-syntax/">set of powerful commands</a> for narrowing search results. In seeking out modern content management tools, I used queries like this:</p>↵<p><a href="https://github.com/search?o=desc&amp;q=cms+OR+%22content+management%22+OR+admin+pushed%3A%3E2016-01-01+stars%3A%3E50&amp;ref=searchresults&amp;s=stars&amp;type=Repositories&amp;utf8=%E2%9C%93">cms OR “content management” OR admin pushed:&gt;2016–01–01 stars:&gt;50</a></p>↵<p>Sorting by stars, I worked my way backwards. I was able to quickly spot relevant CMS projects. I also started to notice some trends.</p>↵<ul>↵<li>Modern and popular content management systems are written in PHP, JavaScript, Python, and Ruby. There are also a few content management systems written in&nbsp;.NET (C#), but they are much less popular on GitHub.</li>↵<li>Headless content management systems are gaining popularity. Simply presenting the UI for users to edit content, and relying on the end user to create the user-facing site by ingesting the API. <a href="http://getdirectus.com/">Directus</a> and <a href="https://www.cloudcms.com/">Cloud CMS</a> are headless CMS options.</li>↵<li>Static content management systems don’t host pages for you. Instead they help generate your CMS, using static files. <a href="https://github.com/netlify/netlify-cms">Netlify CMS</a>, <a href="https://respondcms.com/">Respond CMS</a>, and <a href="https://www.getlektor.com/">Lektor</a> are a few of the options in the static CMS space.</li>↵</ul>↵<h3>Tooling</h3>↵<p>I knew the list of all popular content management systems would be huge. I didn’t want to put that data into Markdown directly, as it would be difficult to maintain and to augment with extra data (stars on GitHub, last push date, tags, etc).</p>↵<p>Instead, I opted to store the data in <a href="https://github.com/toml-lang/toml">TOML</a>, a human-friendly configuration file language. You can view all of the data that powers Awesome CMS in the <a href="https://github.com/postlight/awesome-cms/tree/97216ef432963d4dfb2238340e2ebf9a4127fb1e/data">data folder</a>. Here’s WordPress’ entry in that file:</p>↵<pre>[[cms]]↵name = "WordPress"↵description = "WordPress is a free and open-source content management system (CMS) based on PHP and MySQL."↵url = "https://wordpress.org"↵github_repo = "WordPress/WordPress"↵awesome_repo = "miziomon/awesome-wordpress"↵language = "php"</pre>↵<p>I process this file using JavaScript in <a href="https://github.com/postlight/awesome-cms/blob/97216ef432963d4dfb2238340e2ebf9a4127fb1e/scripts/generateReadme.js">generateReadme.js</a>. It handles processing the TOML, fetching information from GitHub, and generating the final README.md file using the <a href="https://github.com/postlight/awesome-cms/blob/master/README.md.hbs">Handlebars template</a>. I’m scraping GitHub for star counts because GitHub’s API only allows for 60 requests an hour for authenticated users. We want to make it as easy as possible for anyone to contribute. Requiring users to generate a GitHub authentication token to generate the README wasn’t an option.</p>↵<div id="attachment_2200" class="wp-caption alignnone"><img class="wp-image-2200 size-full" src="https://13c27d41k2ud2vkddp226w55-wpengine.netdna-ssl.com/wp-content/uploads/2016/10/03-building-awesome-cms-1.gif" width="360"><p class="wp-caption-text">I heard you like content management systems</p></div>↵<p>By storing the data in TOML at generating the README.md using JavaScript, I’ve essentially created an incredibly light-weight, GitHub-backed, static CMS – to power Awesome CMS.</p>↵<p><em><a href="https://postlight.com/trackchanges/author/jeremy-mack">Jeremy Mack</a> is a Director of Engineering at Postlight. Need a better CMS? Get in touch: <a href="https://trackchanges.postlight.com/cdn-cgi/l/email-protection#7b131e1717143b0b14080f17121c130f55181416"><span class="__cf_email__">[email&nbsp;protected]</span></a>.</em></p> </div>",
 * date_published: "2016-10-03T16:48:58.000Z",
 * dek: null,
 * direction: "ltr",
 * domain: "trackchanges.postlight.com",
 * excerpt: "Awesome CMS is…an awesome list of awesome content management systems, grouped by language and ordered by popularity. It’s on GitHub, so anyone can add to ...",
 * lead_image_url: "https://postlight.com/wp-content/uploads/2016/10/03-building-awesome-cms-0.png",
 * next_page_url: null,
 * rendered_pages: 1,
 * title: "Building Awesome CMS — Postlight — Digital product studio",
 * total_pages: 1,
 * url: "https://trackchanges.postlight.com/building-awesome-cms-f034344d8ed",
 * word_count: 465,
 */
