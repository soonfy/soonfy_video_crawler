const signalScoreCalculate = require('./src/calculate')
const natural = require('natural');
const tokenizer = new natural.WordTokenizer();

const ScoreCalculation = (s_doc, t_doc) => {

    if (s_doc.website && t_doc.website) {
        if (s_doc.website === t_doc.website) {
            return 100
        }
    }
    if (s_doc.phone && t_doc.phone) {
        if (s_doc.phone.length >= t_doc.phone.length) {
            const re = new RegExp(`${t_doc.phone}`, 'gim');
            if (s_doc.phone.match(re)) return 100
        } else {
            const re = new RegExp(`${s_doc.phone}`, 'gim');
            if (t_doc.phone.match(re)) return 100
        }
    }

    const nameScore = signalScoreCalculate(s_doc.name, t_doc.name)
    const trafficScore = s_doc.traffic && t_doc.traffic ? signalScoreCalculate(s_doc.traffic, t_doc.traffic) : 1
    const addrScore = signalScoreCalculate(s_doc.address, t_doc.address)

    const coordinateScore = s_doc.coordinate && t_doc.coordinate ? natural.JaroWinklerDistance(s_doc.coordinate, t_doc.coordinate) : 1
        //const coordinateScore = similarCalculate(s_doc.coordinate, t_doc.coordinate)
    const abstractScore = signalScoreCalculate(s_doc.abstract, t_doc.abstract)
    const total = addrScore * 60 + trafficScore * 5 + nameScore * 20 + coordinateScore * 10 + abstractScore * 5
        // console.log('景点名字相似度得分:%s', nameScore)
        // console.log('景点交通相似度得分:%s', trafficScore)
        // console.log('景点地址相似度得分:%s', addrScore)
        // console.log('景点坐标相似度得分:%s', coordinateScore)
        // console.log('景点简介相似度得分:%s', abstractScore)
        // console.log('景点相似度总分:%s', total)
    return total.toFixed(2)
}




// const __main__ = () => {
//     const sight = require('./src/test_data').sights
//         //console.log(sight)
//     console.log('qunar and other:')
//     console.log(ScoreCalculation(sight.qunar, sight.tuniu))
// }

// __main__()

export default ScoreCalculation;