let adapterMethods = [ '' ]

export function xenoproxy(Xeno) {
  return new Proxy(Xeno, {
    get: function (target, key, receiver) {
      return Reflect.get(target, key, receiver);
    }
  })
}