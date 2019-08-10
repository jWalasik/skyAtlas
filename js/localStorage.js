function processData(){
    //service worker registration
    if('serviceWorker' in navigator){
        navigator.serviceWorker
            .register('/data/sw.js')
            .then(function() {console.log('Service Worker Registered'); });
    }
    var db;
    let starsData = []
    queue()
        .defer(d3.csv, "https://gist.githubusercontent.com/elPaleniozord/5d96f2f5cce92366b06bea32a2625d2e/raw/8504f231ea5ee5fdef47371232c8c55256b8f045/hyg_data_sortMag.csv", function(d){
          starsData.push(d);
        })
        .defer(d3.json, "https://gist.githubusercontent.com/elPaleniozord/bb775473088f3f60c5f3ca1afeb88a82/raw/68dbc32a363d380cf9e7e57d53794c24bce4348b/bounds.json")
        .defer(d3.json, "https://gist.githubusercontent.com/elPaleniozord/ed1dd65a955c2c7e1bb6cbc30feb523f/raw/9dd2837035dde1554f20157be681d71d54a26c58/lines.json")
        .await(addData);

    //storage
    console.log('db')
    var request = window.indexedDB.open('galaxy', 1)
    console.log(request)
    request.onerror = function(){console.log('Database failed to open')};
    request.onsuccess = function(){
        console.log('Successfully opened database');
        db = request.result;
        displayData();
    };

    request.onupgradeneeded = function(e){
        db = e.target.result
        let objectStore = db.createObjectStore('galaxy', {keyPath: 'id', autoIncrement: true})

        objectStore.createIndex('stars','stars', {unique: false})
        objectStore.createIndex('bounds', 'bounds', {unique: false})
        objectStore.createIndex('lines', 'lines', {unique: false})

        console.log('database setup complete')
    }

    // Define the addData() function
    function addData(e, stars, bounds, lines) {
        // prevent default - we don't want the form to submit in the conventional way
        
        console.log(db)
    
        // open a read/write db transaction, ready for adding the data
        let transaction = db.transaction('galaxy', 'readwrite');
    
        // call an object store that's already been added to the database
        let objectStore = transaction.objectStore('stars');
    
        // Make a request to add our newItem object to the object store
        var request = objectStore.add(starsData);
        request.onsuccess = function() {
            console.log('success')
        };
    
        // Report on the success of the transaction completing, when everything is done
        transaction.oncomplete = function() {
        console.log('Transaction completed: database modification finished.');
    
        // update the display of data to show the newly added item, by running displayData() again.
        displayData();
        };
    
        transaction.onerror = function() {
        console.log('Transaction not opened due to error');
        };
    }
}