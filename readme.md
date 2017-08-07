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

## exporters

### 根据剧目 id 导出一段时间的总量和增量
  ```
  1. 在 input 文件夹下输入需求文件xlsx。例如 文件“20170806-增量需求.xlsx”
  2. 执行脚本。例如 node main/exporters/export_sum\_play.js 20170806-增量需求
  3. 输出文件在 output 文件夹下。例如 文件“20170806-增量需求-sum-result.xlsx”
  ```

### 根据剧目 id 导出一段时间的每天总量
  ```
  1. 在 input 文件夹下输入需求文件xlsx。例如 文件“20170806-分天需求.xlsx”
  2. 执行脚本。例如 node main/exporters/export_daily\_play.js 20170806-分天需求
  3. 输出文件在 output 文件夹下。例如 文件“20170806-分天需求-daily-result.xlsx”
  ```

### 根据剧目类型导出一段时间的总量和增量
  ```
  1. 在 input 文件夹下输入需求文件xlsx。例如 文件“20170806-类型需求.xlsx”
  2. 执行脚本。例如 node main/exporters/export_cate\_play.js 20170806-类型需求
  3. 输出文件在 output 文件夹下。例如 文件“20170806-类型需求-category-result.xlsx”
  ```
  
## remark
  1. import package  
  ```
  npm i ../thracia/lib/sorting-hat
  npm i typhoeus
  ```
  