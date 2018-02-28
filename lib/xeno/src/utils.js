export async function docbs(cbs, arg1, arg2) {
  let cbret = arg1
  if(cbs || cbs.length > 0) {
    for(let cb of cbs) { cbret = await cb(cbret, arg1, arg2) }
  }
  return cbret
}