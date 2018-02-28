import * as Epona from "../index"
import { flatten } from "lodash"
let run = async ()=>{

  let urls = await Epona.get('https://ruby-china.org/topics?page={1..1}', '.title a *::href')
  let articles = await Epona.get(flatten(urls).map((x)=>'http://www.ruby-china.org' + x), {
    title: 'title',
    content: '.topic-detail .panel-body|trimAll',
    replays: {
      sels: '.reply .infos *',
      nodes: {
        name: '.user-name',
        contens: '.markdown'
      }
    }
  })
  console.log(articles)
  // try {
  //   let ret = await Epona
  //     .get('http://cache.video.qiyi.com/jp/sdlst/6/202462901/')
  //     .beforeParse(function(x){ return "<title>123123</title>" })
  //   console.log("ret >", ret.extract("title"))
  //   // let a = await Epona.get('http://cache.video.qiyi.com/jp/sdlst/6/202462901/')
  //   // console.log(a)
  // }catch(e) {
  //   console.log(e)
  // }
  // console.log(a.html)
}
run()