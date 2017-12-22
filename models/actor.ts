
const mongoose = require('mongoose')

const Schema = mongoose.Schema
const stars = new Schema({
  douban_id: String, // 豆瓣id
  cname: String, // 中文名
  fname: String, // 外文名
  sex: Number, // 性别 「具体值含义待补充」
  constellation: String, // 星座
  birth_date: String, // 出生日期
  birth_death_date:String,// 生卒日期
  birth_place: String, // 出生地
  career: Array, // 职业
  other_cname: Array, // 更多中文名
  other_fname: Array, // 更多外文名
  family: Array, // 家庭成员
  imdb_num: String, // imdb编号
  intro: String, // 简介
  photo: String, // 照片
  awards: Array, // 获奖情况
  partners: Array, // 合作伙伴
  website: String, // 官微
  height: Number, // 身高「单位待补充」
  weight: Number, // 体重「单位待补充」
  weibo_id: String, // 微博id
  graduation: String, // 毕业院校
  fans: Number, // 粉丝数
})

export default mongoose.model('STAR', stars, 'stars')
