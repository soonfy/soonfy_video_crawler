const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const nodejieba = require("nodejieba");
const _ = require('lodash')

nodejieba.load({
    stopWordDict: nodejieba.DEFAULT_STOP_WORD_DICT,
});

const countbyAndGenerateVect = (starnds, targets) => {
    const counts = []
    let x = 0;
    for (let i of starnds) {
        for (let j of targets) {
            if (i === j) { x += 1 };
        }
        counts.push(x)
        x = 0;
    }
    return counts
}


const similarCalculate = (v1, v2) => {
    let s = 0;
    let v1_2 = 0;
    let v2_2 = 0;
    for (let i = 0; i < v1.length; i++) {
        s += v1[i] * v2[i]
        v1_2 += v1[i] * v1[i]
    }
    for (let j = 0; j < v2.length; j++) {
        v2_2 += v2[j] * v2[j]
    }
    return s / (Math.sqrt(v1_2) * Math.sqrt(v2_2))
}

const signalScoreCalculate = (s_str, t_str) => {
    if (s_str && t_str) {
        const s1_str = nodejieba.cut(s_str) //原词
        const s2_str = nodejieba.cut(t_str)
        const k1_str = nodejieba.extract(s_str, 100).map((x) => { return x.word }); //关键词
        const k2_str = nodejieba.extract(t_str, 100).map((x) => { return x.word });
        const k1_vector = countbyAndGenerateVect(new Set(k1_str.concat(k2_str)), s1_str)
        const k2_vector = countbyAndGenerateVect(new Set(k1_str.concat(k2_str)), s2_str)
        return similarCalculate(k1_vector, k2_vector);
    } else {
        return 0;
    }

}


module.exports = signalScoreCalculate;