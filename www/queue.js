function uploadReadlist(list, doIt) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (doIt) {
        reject();
      } else {
        resolve();
      }
    }, 1000);
  });
}

class ReadlistSync {
  constructor() {
    this.readlistsToSync = [];
    this.isSyncing = false;
  }
  addReadlistToSync(readlist) {
    this.readlistsToSync.push(readlist);
    if (!this.isSyncing) {
      console.log("--> Start sync queue...");
      this.sync();
    }
  }

  sync() {
    this.isSyncing = true;
    const list = this.readlistsToSync[0];
    console.log("Start syncing %s", list);
    uploadReadlist(list, list === "third")
      .then(() => {
        console.log("Done syncing %s", list);
        this.readlistsToSync.shift();
        if (this.readlistsToSync.length === 0) {
          console.log("--> Paused sync queue...");
          this.isSyncing = false;
        } else {
          this.sync();
        }
      })
      .catch((err) => {
        console.log("just stop", err);
      });
  }
}

const thing = new ReadlistSync();

thing.addReadlistToSync("first-1");
thing.addReadlistToSync("first-2");
thing.addReadlistToSync("first-3");
const t = setTimeout(() => {
  thing.addReadlistToSync("third");
}, 5001);
const a = setTimeout(() => {
  thing.addReadlistToSync("second");
  thing.addReadlistToSync("second-1");
}, 2000);
thing.addReadlistToSync("first-4");
