import * as Epona from "../index"

async let run = async ()=>{
  // let urls = await Epona.get("https://news.ycombinator.com/?p=${1..5}", ".title>a *::text:title,href:url")
  let urls = await Epona.get({ 
    url: 'http://apis.web.pptv.com/show/videoList?pid=9042083&vt=22', headers: {cookie: 'ppi=302c31;'} }, 
    'data::total')
  console.log(urls)
}

run()