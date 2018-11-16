function makeDatabase(){//service worker registration
    if('serviceWorker' in navigator){
        navigator.serviceWorker
            .register('/data/sw.js')
            .then(function() {console.log('Service Worker Registered'); });
    }

    //storage
    var db;

    window.onload = function(){
        var request = window.indexedDB.open('stars', 1)

        request.onerror = function(){console.log('Database failed to open')};
        request.onsuccess = function(){
            console.log('Successfully opened database');
            db = request.result;
            displayData();
        };

        request.onupgradeneeded = function(e){
            let db = e.target.result
            let objectStore = db.createObjectStore('stars', {keyPath: 'id', autoIncrement: true})

            objectStore.createIndex('name','name', {unique: false})
            objectStore.createIndex('body', 'body', {unique: false})

            console.log('database setup complete')
        }
    }

    // Define the addData() function
    function addData(e) {
        // prevent default - we don't want the form to submit in the conventional way
        e.preventDefault();
    
        // grab the values entered into the form fields and store them in an object ready for being inserted into the DB
        let newItem = { title: titleInput.value, body: bodyInput.value };
    
        // open a read/write db transaction, ready for adding the data
        let transaction = db.transaction(['notes'], 'readwrite');
    
        // call an object store that's already been added to the database
        let objectStore = transaction.objectStore('notes');
    
        // Make a request to add our newItem object to the object store
        var request = objectStore.add(newItem);
        request.onsuccess = function() {
        // Clear the form, ready for adding the next entry
        titleInput.value = '';
        bodyInput.value = '';
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
    }}