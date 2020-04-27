//@TODO get dropbox as es module?

const dbx = new window.Dropbox.Dropbox({
  accessToken: "",
  fetch: window.fetch,
});

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
                .then((file) => file.fileBlob.text())
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

export function getListz() {
  return new Promise((resolve, reject) => {
    try {
      dbx
        .filesListFolder({ path: "" })
        // list of files, get just the .list.json
        .then((res) =>
          res.entries.filter(({ path_lower }) =>
            path_lower.endsWith(".list.json")
          )
        )
        // get each .list.json file in dropbox
        .then((dbxFiles) =>
          Promise.all(
            dbxFiles.map(({ path_lower }) =>
              dbx.filesDownload({ path: path_lower })
            )
          )
        )
        // get the contents of each .list.json file in dropbox
        .then((filesProperties) =>
          Promise.all(filesProperties.map((file) => file.fileBlob.text()))
        )
        // convert file contents to JSON
        .then((fileContents) => fileContents.map((file) => JSON.parse(file)))
        // now you have your lists
        .then((Lists) => {
          resolve(Lists);
          console.log(Lists);
        });
    } catch (e) {
      console.error(e);
      reject();
    }
  });
}

export function getList(id) {
  return new Promise((resolve, reject) => {
    try {
      console.log("fire");
      dbx.filesDownload({ path: `/test/${id}/list.json` }).then((file) => {
        console.log(file);
        var reader = new FileReader();
        reader.onload = () => {
          console.log(reader.result);
          resolve(JSON.parse(reader.result));
        };
        reader.onerror = () => {
          reject();
        };
        reader.readAsText(file.fileBlob);
      });
      // .then((fileContents) => JSON.parse(fileContents))
      // .then((json) => {
      //   resolve(json);
      // });
    } catch (e) {
      console.error(e);
      reject();
    }
    // setTimeout(() => {
    //   fetch(`./data/${id}.list.json`)
    //     .then((res) => res.json())
    //     .then((json) => {
    //       resolve(json);
    //     });
    // }, 2000);
  });
}
