/*clear storage - just run this snippet in console
window.indexedDB.databases().then((r) => {
    for (var i = 0; i < r.length; i++) window.indexedDB.deleteDatabase(r[i].name);
}).then(() => {
    alert('All data cleared.');
});
*/
const downloadData = () =>{
    console.log('downloading content')
    let data = {
        stars: [],
        bounds: [],
        lines: []
    }
    queue()
        .defer(d3.csv, "https://gist.githubusercontent.com/elPaleniozord/5d96f2f5cce92366b06bea32a2625d2e/raw/8504f231ea5ee5fdef47371232c8c55256b8f045/hyg_data_sortMag.csv", function(d){
            data.stars.push(d);
        })
        .defer(d3.json, "https://gist.githubusercontent.com/elPaleniozord/bb775473088f3f60c5f3ca1afeb88a82/raw/68dbc32a363d380cf9e7e57d53794c24bce4348b/bounds.json", function(d){
            data.bounds.push(d);
            })
        .defer(d3.json, "https://gist.githubusercontent.com/elPaleniozord/ed1dd65a955c2c7e1bb6cbc30feb523f/raw/9dd2837035dde1554f20157be681d71d54a26c58/lines.json",function(d){
            data.lines.push(d);
            })
    return data 
}

function processData(){
    //service worker registration
    if('serviceWorker' in navigator){
        navigator.serviceWorker
            .register('/data/sw.js')
            .then(function() {console.log('Service Worker Registered'); });
    }
    var IDB;

    var IDBSetting = {
        name: 'indexedDBName',
        version: 1,
        tables: [{
            tableName: 'stars',
            keyPath: 'seq',
            autoIncrement: true,
            index: ['key', 'value'],
            unique: [false, false]
        }]
    }

    ! function () {
        console.log('indexedDB init')

        var request = indexedDB.open(IDBSetting.name, IDBSetting.version)
        
        request.onsuccess = () => console.log('Successfully opened database')
        request.onerror = () => console.log('Database failed to open')

        request.onupgradeneeded = (event) => {
            console.log('upgrading IDB', event)
            IDB = downloadData()
            var db = event.target.result
            for (var i in IDBSetting.tables){
                var objectStore = db.createObjectStore(IDBSetting.tables[i].tableName, {
                    keyPath: IDBSetting.tables[i].keyPath,
                    autoIncrement: IDBSetting.tables[i].autoIncrement
                })
                for (var j in IDBSetting.tables[i].index) {
                    objectStore.createIndex(IDBSetting.tables[i].index[j], IDBSetting.tables[i].index[j], {
                        unique: IDBSetting.tables[i].unique[j]
                    })
                }
            }
            console.log('add data')
            for(var i in IDB){
                console.log('adding data:', i, IDB[i])
                IDBFuncSet.addData(i, IDB[i])
            }
        }
    }();

    //add data
    var IDBFuncSet = {
        addData: function(table, data){
            var request = indexedDB.open(IDBSetting.name, IDBSetting.version)
            request.onsuccess = (event) => {
                try {
                    console.log('addData IDB opened')
                    var db=request.result
                    var transaction = db.transaction([table], 'readwrite')
                    var objectStore = transaction.objectStore(table)
                    var objectStoreReq = objectStore.add(data)
                } catch (e) {
                    console.log('error', e)
                }
                objectStoreReq.onsuccess = () => {
                    console.log('data added to IDB')
                }
                objectStoreReq.onerror = () => {
                    console.log('data add failure')
                }
            }
            request.onerror = (event) => console.log('addData IDB opening failure')
        }
    }
    

    IDBFuncSet.getAllData = function(arr, table) {
        try {
            var req = indexedDB.open(IDBSetting.name, IDBSetting.version);
    
            req.onsuccess = function(event) {
                var db = req.result;
                var transaction = db.transaction([table], "readonly");
                var objectStore = transaction.objectStore(table);
    
                var objectStoreRequest = objectStore.openCursor();
    
                objectStoreRequest.onsuccess = function(event) {
                    var cursor = event.target.result;
                    if (cursor) {
                        arr.push(cursor.value);
                        cursor.continue();
                    } else {
    
                    }
                }
            };
            req.onerror = function(event) {
                console.log("getAllData indexed DB open fail");
            };
        } catch (e) {
            console.log(e);
        }
    }
    var IDBdata = [];
    for(var i in IDB){
        IDBFuncSet.getAllData(IDBdata, i)
    }
    return IDBdata
    /*
    var db
    //storage
    var request = window.indexedDB.open('galaxyDB', 1)
    request.onerror = function(){console.log('Database failed to open')};
    request.onsuccess = function(){
        console.log('Successfully opened database');
        db = request.result;
        return db;
    };

    request.onupgradeneeded = function(e){
        db = e.target.result
        let objectStore = db.createObjectStore('galaxy', {keyPath: 'id', autoIncrement: true})

        objectStore.createIndex('stars','stars', {unique: false})
        objectStore.createIndex('bounds', 'bounds', {unique: false})
        objectStore.createIndex('lines', 'lines', {unique: false})
        db = objectStore

        let starsData = []
        queue()
            .defer(d3.csv, "https://gist.githubusercontent.com/elPaleniozord/5d96f2f5cce92366b06bea32a2625d2e/raw/8504f231ea5ee5fdef47371232c8c55256b8f045/hyg_data_sortMag.csv", function(d){
            starsData.push(d);
            })
            .defer(d3.json, "https://gist.githubusercontent.com/elPaleniozord/bb775473088f3f60c5f3ca1afeb88a82/raw/68dbc32a363d380cf9e7e57d53794c24bce4348b/bounds.json")
            .defer(d3.json, "https://gist.githubusercontent.com/elPaleniozord/ed1dd65a955c2c7e1bb6cbc30feb523f/raw/9dd2837035dde1554f20157be681d71d54a26c58/lines.json")
            .await(addData);
        
        console.log(db, objectStore)
        console.log('database setup complete')
    }

    // Define the addData() function
    function addData(e, stars, bounds, lines) {        
        
        
        // console.log('db: ', db)    
        // // open a read/write db transaction, ready for adding the data
        // let transaction = db.transaction('galaxy', 'readwrite');
        // console.log('transaction: ', transaction)

        // // call an object store that's already been added to the database
        // let objectStore = transaction.objectStore('galaxy');
        // console.log('obect store: ', objectStore)
        // let starsStore = objectStore.transaction('stars')
        // console.log(starsStore)
        // // Make a request to add our newItem object to the object store
        // var request = objectStore.add(starsData);
        // request.onsuccess = function() {
        //     console.log(request)
        // };
    
        // // Report on the success of the transaction completing, when everything is done
        // transaction.oncomplete = function() {
        // console.log('Transaction completed: database modification finished.');
    
        // // update the display of data to show the newly added item, by running displayData() again.
        // //displayData();
        // console.log(objectStore)
        // return db
    };
    
        transaction.onerror = function() {
        console.log('Transaction not opened due to error');
        };
    }
    */
}