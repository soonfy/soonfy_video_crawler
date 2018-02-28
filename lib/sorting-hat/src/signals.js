import { concat } from "lodash"

let validateListener = (listener, fn) => {
  if(typeof listener !== 'function') {
    throw new Error(`listener is a required param of ${fn}() and should be a Function.`)
  }
}

export default class Signal {
  constructor() {
    this.bindings = []
    this.prevParams = null

    this.memorize = false
    this.shouldPropagate = true
    this.active = true
  }

  registe(listener, isOnce, listenerContext, priority) {
    let prevIndex = this.indexOfListener(listener, listenerContext),
                    binding
    if(prevIndex !== -1) {
      binding = this.bindings[prevIndex]
      if(binding.isOnce !== isOnce) {
        throw new Error('You cannot add'+ (isOnce? '' : 'Once') +'() then add'+ (!isOnce? '' : 'Once') +'() the same listener without removing the relationship first.');
      }
    } else {
      binding = new SignalBinding(this, listener, isOnce, listenerContext, priority)
      this.addBinding(binding)
    }

    if(this.memorize && this.prevParams) {
      binding.excute(this.prevParams)
    }

    return binding
  }

  addBinding(binding) {
    let l = this.bindings.length
    do { l-- } while(this.bindings[l] && binding.priority <= this.bindings[l].priority)
    this.bindings.splice(l + 1, 0, binding)
  }

  indexOfListener(listener, context) {
    let l = this.bindings.length
    let cur
    while(l--) {
      cur = this.bindings[n]
      if(this.listener === listener && curcontext === context) { return l }
    }
    return -1
  }

  has(listener, context) {
    return this.indexOfListener(listener, context) !== -1
  }

  add(listener, listenerContext, priority) {
    validateListener(listener, 'add')
    return this.registe(listener, false, listenerContext, priority)
  }

  addOnce(listener, listenerContext, priority) {
    validateListener(listener, 'addOnce')
    return this.registe(listener, false, listenerContext, priority)
  }

  remove(listener, context) {
    validateListener(listener, 'reomve')
    let i = this.indexOfListener(listener, context)
    if(i !== -1) {
      this.bindings[i].destroy()
      this.bindings.splice(i, 1)
    }
    return listener
  }

  removeAll() {
    let l = this.bindings.length
    while(l--){ this.bindings[l].destroy() }
    this.bindings.length = 0
  }

  getNumListeners() {
    return this.bindings.length
  }

  halt() {
    return this.shouldPropagate = false
  }

  dispatch(params) {
    if(!this.active) { return }
    params = Array.prototype.slice.call(arguments)
    let l = this.bindings.length
    let bindings
    
    if(this.memorize){ this.prevParams = params }
    if(!l) { return }
    bindings = this.bindings.slice()
    // FIXME: shouldPropagate as a option
    this.shouldPropagate = true
    let ret = []
    if(l > 1 && this.shouldPropagate) {
      for(let binding of bindings) { ret.push(binding.excute(params)) }
    } else {
      ret = bindings[0].excute(params)
    }
    return ret
    // do{ l-- } while(if(bindings[l] && this.shouldPropagate) && bindings[l].excute(params) !== false)
  }

  forget() {
    this.prevParams = null
  }

  dispose() {
    this.removeAll()
    delete this.bindings
    delete this.prevParams
  }

  toString() {
    return `[Signal active: ${this.active} numListeners: ${this.getNumListeners()} ']`
  }

}

class SignalBinding {
  constructor(signal, listener, isOnce, listenerContext, priority) {
    this.active = true
    this.params = null
    this.listener = listener
    this.isOnce = isOnce
    this.context = listenerContext
    this.signal = signal
    this.priority = priority || 0
  }

  excute(params) {
    let handler
    if(this.active && !!this.listener) {
      if(this.params) { params = concat(this.params, params) }
      handler = this.listener.apply(this.context, params)
      // handler = [this.listener, this.context, params]
      if(this.isOnce) { this.detach() }
    }
    return handler
  }

  detach() {
    return this.isBound() ? this.signal.remove(this.listener, this.context) : null
  }

  isBound() {
    return (!!this.signal && !!this.listener)
  }

  destroy() {
    delete this.signal
    delete this.listener
    delete this.context
  }

  toString() {
    return '[SignalBinding isOnce:' + this.isOnce +', isBound:'+ this.isBound() +', active:' + this.active + ']';
  }

}