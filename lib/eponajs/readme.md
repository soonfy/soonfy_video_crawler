# epona
> A simple Node.js scraper, heavely inpired by [scrape-it].

## :cloud: Installation


```sh
$ npm i --save eponajs
```

## :clipboard: Example

```js
import Epona from "eponajs"

let urls = await Epona.get('https://ruby-china.org/topics?page=${1..5}', '.title a *::href')
urls = flatten(urls).map((x)=>'http://www.ruby-china.org' + x)

let topic = await Epona.get('https://ruby-china.org/topics/32374')
let title = topic.extract('.title a *::href')

// or 

let epona = new Epona({concurrent: 10})
epona.on("https://ruby-china.org/topics/{topicId}", {
  title: 'title',
  content: '.topic-detail .panel-body::text|trim',
  replies: {
    sels: '.reply .infos *',
    nodes: {
      name: '.user-name',
      contens: '.markdown'
    }
  }
})
.then((ret, topicId)=>{
  console.log(topicId, ":", ret)
  return ret
})

let articles = await epona.queue(urls)

console.log(articles)

```

## :memo: Documentation

### `Epona.get(urls, [iterators], [recipe], [opts])`
A simple Node.js scraper.
#### Params
- **String|Object|Array** `url`:One or Array of the page url or [request-options].
- **Object** `recipe`: The options passed to `[korok]` method, recipe's key is filed's name and value is filed's selector.

  - `<fieldName>` (Object|String): The selector or an object containing:
      - `sels` (String|array): The selector 'css/xpath(beta)/regexp selector *::attrs|filters'.
      - `join` (Boolean): If join === true, it will join all result of sels.
      - `attrs` (String|array): If provided, the value will be taken based on
        the attribute name.
      - `nodes` (Object): 
      - `filters` (Function|String|Array): 

  **Example**:
  ```js
  {
      poster:     ".name"
    , title:      ["h1", "title"]                   // if `h1` can't find, will try `title`
    , content: {
        sels:     [".articles-01", ".articles-02"]
      , attrs:    ["text()"]
      , join:     true                              // `.articles-01` and `.articles-02`'s contents will be merged
    }
    , avatar: {
        sels:     ".header img::src"                // use '::' to get a html/xml attribute, (default `text()`)
      , defaults: "default avatar url"
    }
    , replyCount: "span.reply img::text|numbers"    // use '|'  
    , replies: {
        sels:     ".reply *"                        // use ' *' to get all replies as Array
      , nodes: {
          avatar: ".avatar"                         // as '.reply .avatar'
        , post:   ".post|text | trim | filter(function(x){return x.length>0})"
      }
    }
    , nextPage: ".nextpage::href|follow"
  }
  ```

- **opts** `opts`: The throttle options.

#### Return
- **Promise** A promise object.

### `Epona.new(opts)`
A Epona instance with default opts.

### `Epona#on(opts)`
  ```js
  epona.on('http://www.ruby-china/topics/{topicId}', {
    recipes ...
  })
  .beforeParse((responseBody) => responseBody)
  .set({timeout: 3000}) // set [request-options]
  .set(encoding: 'utf8')
  .headers('user-agent' "Safari")
  .cookie('user_id=user_0042')
  .type('html')                    // html|json|json:xml|raw, default html
  .host('https://www.ruby.com')
  .then((parsedBody, topicId)=>{
    console.log(parsedBody)
  })
  .catch((err)=>{
    console.log(err)
  })
  ```
### `Epona#queue(opts)`
  ```js
  let result = await epona.queue('https://ruby-china.org/topics/32374')
  console.log(result)
  ```
### `Epona.use(fn)`
  ```js

  ```
[MIT][license] © [Karma][website]

[scrape-it]: https://github.com/IonicaBizau/scrape-it
[request-options]: https://github.com/request/request#requestoptions-callback
[korok]: https://github.com/karmaQ/korok
[license]: http://showalicense.com/?fullname=KarmaQ#license-mit
[website]: https://github.com/karmaQ