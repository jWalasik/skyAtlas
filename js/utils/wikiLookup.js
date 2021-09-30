
//wiki lookup
export async function getWikiData(name){
  var url = 'https://en.wikipedia.org/w/api.php?action=query&titles='+name+'&prop=extracts&origin=*&rvprop=content&format=json&formatversion=2&redirects';
  const endpoint = url;

  return await fetch(endpoint)
    .then(response => response.json())
    .then(res => {
      console.log(res)
      return res
    })
    .catch(err => console.log(err));
}