//wiki lookup
async function getWikiData(name){
  var url = 'https://en.wikipedia.org/w/api.php?action=query&titles='+name+'_(constellation)&prop=extracts&origin=*&rvprop=content&format=json&formatversion=2&redirects';
  const endpoint = url;

  await fetch(endpoint)
    .then(response => response.json())
    .then(data => {

      document.getElementById('description-container').innerHTML = data.query.pages[0].extract;
    })
    .catch(() => console.log("error"));
}
