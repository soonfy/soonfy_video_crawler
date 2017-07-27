# video-crawler

## video site
1. iqiyi  
2. qq  
3. letv  
4. sohu  
5. youku  
6. mgtv  
7. pptv  
8. acfun  
9. bilibili  

## ready
在当前目录下新建 config.json 文件, 示例如下.  
  ```
  {
    "db":{
      "uris": [dburl],
      "monitor": [dburl]
    }
  }
  ```

## process
  site + uri --> vid, cid --> vids/uris --> plays

## scripts

### daily crawlers
  ```
  tsc
  node main/scripts/daily_crawl.js
  ```

### check plays
  ```
  1. 当前目录下新建 logs 文件夹
  2. 执行如下脚本
  tsc
  node main/scripts/check_play.js
  ```

### export error films
  ```
  1. 当前目录下新建 logs 文件夹
  2. 执行如下脚本
  tsc
  node main/scripts/export_film.js
  ```

### export error plays
  ```
  1. 当前目录下新建 logs 文件夹
  2. 执行如下脚本
  tsc
  node main/scripts/export_play.js
  ```
  
## remark
  1. import package  
  ```
  npm i ../thracia/lib/sorting-hat
  npm i typhoeus
  ```
  