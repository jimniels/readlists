import { json } from "@remix-run/server-runtime";
import { parseReadlistFromFormData } from "../utils.js";

const F_EPUB = "epub";
const F_HTML = "html";
const F_JSON = "json";
const FORMATS = [F_EPUB, F_HTML, F_JSON];

/**
 * Handle errant requests
 */
export async function loader() {
  return json(
    { error: "Bad request. This resource is for exporting Readlists" },
    { status: 400 }
  );
}

/**
 * POST /export?format=(json|html|epub) <readlist-form-data>
 */
export async function action({ request }) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format");

  if (!FORMATS.includes(format)) {
    throw json({
      error:
        "The `format` query parameter is required and must be one of: " +
        FORMATS.join(" | "),
    });
  }

  // @TODO validate formData request
  const formData = await request.formData();

  // @TODO what if there’s no readlist
  const readlist = parseReadlistFromFormData(formData);
  readlist.date_modified = new Date().toISOString();

  // @TODO slugify the title + timestamp
  const readlistName =
    "readlist." + new Date().toISOString().replace(/:/g, "-");

  switch (format) {
    case F_JSON:
      return new Response(JSON.stringify(readlist, null, 2), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename=${readlistName}.json`,
        },
      });
    case F_HTML:
      return new Response(exportReadlistToHtml(readlist), {
        status: 200,
        headers: {
          "Content-Type": "text/html",
          "Content-Disposition": `inline; filename=${readlistName}.html`,
        },
      });
    default:
      throw json({ error: "Bad request." }, 400);
  }
}

/**
 * Take a Readlist and convert to an HTML representation
 * @param {Readlist} readlist
 * @returns {string}
 */
function exportReadlistToHtml(readlist) {
  return `<!doctype html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Readlist: ${readlist.title}</title>
    </head>
    <body>
      <h1>${readlist.title}</h1>
      <hr />
      ${readlist.articles
        .map((article) => `<h1>${article.title}</h1>${article.content}<hr />`)
        .join("")}
      <footer>Generated as a <a href="https://readlists.jim-nielsen.com">Readlist</a></footer>
    </body>
  </html>`;
}
