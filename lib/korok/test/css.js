import { expect } from 'chai'
import { pseudos, selectAll, selectOne } from "../src/parser/css"
import * as fs from "fs"
import * as htmlparser from 'htmlparser2'

let html = fs.readFileSync("./test/statics/index.html").toString()
