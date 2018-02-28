import * as Epona from "../index"

Epona.get("http://maoyan.com/board/{1..8}", {
  films: {
    sels: '.board-item-content *',
    attrs: {
      name: '.name',
      releasetime: '.releasetime',
      // num: {
      //   sels: '.total-wish .stonefont',
      // }
    }
  }
  // actors: '.ac'
}).then((x)=>{
  x.map(y=>console.log(y))
})
