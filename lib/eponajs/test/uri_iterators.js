console.log(isNeededIterators('http://www.github.com/{abc}/{0..2}'))
console.log(isNeededIterators('http://www.github.com/{abc}'))
console.log(isNeededIterators('http://www.github.com/'))
console.log(isNeededIterators('http://www.github.com/{1..0}/{2..5}'))