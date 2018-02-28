// https://github.com/fb55/css-select/blob/master/index.js
import * as DomUtils from "domutils"
import { falseFunc } from "boolbase"
import * as compileFactory from "css-select/lib/compile"
export let compile = compileFactory(DomUtils)
export let filters = compile.Pseudos.filters
export let pseudos = compile.Pseudos.pseudos

compile.compileUnsafe = function(selector, options, context){
	// var token = parse(selector, options);
	return compile.compileToken(selector, options, context);
}

function getSelectorFunc(searchFunc){
	return (query, elems, options) => {
		options = options || {}

		if(typeof query !== "function") { 
      query = compile.compileUnsafe(query, options, elems)
    }

    if(query.shouldTestNextSiblings) { 
      elems = appendNextSiblings((options && options.context) || elems);
    }

		if(!Array.isArray(elems)) { elems = DomUtils.getChildren(elems) }
		else { elems = DomUtils.removeSubsets(elems) }
		return searchFunc(query, elems, options)
	}
}

function getNextSiblings(elem){
	let siblings = DomUtils.getSiblings(elem)
	if(!Array.isArray(siblings)) return []
	siblings = siblings.slice(0)
	while(siblings.shift() !== elem)
	return siblings;
}

function appendNextSiblings(elems){
	// Order matters because jQuery seems to check the children before the siblings
	if(!Array.isArray(elems)) elems = [elems]
	let newElems = elems.slice(0);

	for(let i = 0, len = elems.length; i < len; i++){
		let nextSiblings = getNextSiblings(newElems[i])
		newElems.push.apply(newElems, nextSiblings)
	}
	return newElems
}

export let selectAll = getSelectorFunc((query, elems, options) => {
	return (query === falseFunc || !elems || elems.length === 0) 
    ? [] 
    : DomUtils.findAll(query, elems)
})

export let selectOne = getSelectorFunc((query, elems, options) => {
	return (query === falseFunc || !elems || elems.length === 0) 
    ? null 
    : DomUtils.findOne(query, elems)
})