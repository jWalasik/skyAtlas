//service worker registration
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
}