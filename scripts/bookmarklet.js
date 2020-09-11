javascript: (() => {
  let $div = document.createElement("div");
  $div.setAttribute(
    "style",
    `
      position: fixed;
      z-index: 1000000;
      width: 200px;
      background: green;
      color: white;
      padding: 10px;
      text-align: center;
      top: 0;
      left: 50%;
      margin-left: -100px;
      transition: .3s ease all;
      background: gray;
    `
  );
  $div.innerHTML = "Loading...";
  document.body.appendChild($div);

  navigator.clipboard
    .writeText(window.location.href + "|" + document.documentElement.outerHTML)
    .then(() => {
      $div.innerHTML =
        "Copied to clipboard! Go paste it in to readlists.jim-nielsen.com";
      $div.style.backgroundColor = "green";
    })
    .catch((err) => {
      console.error(err);
      $div.innerHTML = "Bookmarklet failed.";
      $div.style.backgroundColor = "red";
    })
    .then(() => {
      setTimeout(() => {
        $div.style.opacity = "0";
        $div.style.visibility = "hidden";
      }, 3000);
    });
})();
