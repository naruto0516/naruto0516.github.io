
// node_modules/imba/src/imba/utils.imba
var $23 = Symbol.for("#__initor__");
var $24 = Symbol.for("#__inited__");
var $1 = Symbol.for("#__hooks__");
var $2 = Symbol.for("#type");
var $21 = Symbol.for("#__listeners__");
function parseTime(value) {
  let typ = typeof value;
  if (typ == "number") {
    return value;
  }
  ;
  if (typ == "string") {
    if (/^\d+fps$/.test(value)) {
      return 1e3 / parseFloat(value);
    } else if (/^([-+]?[\d\.]+)s$/.test(value)) {
      return parseFloat(value) * 1e3;
    } else if (/^([-+]?[\d\.]+)ms$/.test(value)) {
      return parseFloat(value);
    }
    ;
  }
  ;
  return null;
}
function getDeepPropertyDescriptor(item, key, stop) {
  if (!item) {
    return void 0;
  }
  ;
  let desc = Object.getOwnPropertyDescriptor(item, key);
  if (desc || item == stop) {
    return desc || void 0;
  }
  ;
  return getDeepPropertyDescriptor(Reflect.getPrototypeOf(item), key, stop);
}
var emit__ = function(event, args, node) {
  let prev;
  let cb;
  let ret;
  while ((prev = node) && (node = node.next)) {
    if (cb = node.listener) {
      if (node.path && cb[node.path]) {
        ret = args ? cb[node.path].apply(cb, args) : cb[node.path]();
      } else {
        ret = args ? cb.apply(node, args) : cb.call(node);
      }
      ;
    }
    ;
    if (node.times && --node.times <= 0) {
      prev.next = node.next;
      node.listener = null;
    }
    ;
  }
  ;
  return;
};
function listen(obj, event, listener, path) {
  var $228;
  let cbs;
  let list;
  let tail;
  cbs = obj[$21] || (obj[$21] = {});
  list = cbs[event] || (cbs[event] = {});
  tail = list.tail || (list.tail = list.next = {});
  tail.listener = listener;
  tail.path = path;
  list.tail = tail.next = {};
  return tail;
}
function once(obj, event, listener) {
  let tail = listen(obj, event, listener);
  tail.times = 1;
  return tail;
}
function unlisten(obj, event, cb, meth) {
  let node;
  let prev;
  let meta = obj[$21];
  if (!meta) {
    return;
  }
  ;
  if (node = meta[event]) {
    while ((prev = node) && (node = node.next)) {
      if (node == cb || node.listener == cb) {
        prev.next = node.next;
        node.listener = null;
        break;
      }
      ;
    }
    ;
  }
  ;
  return;
}
function emit(obj, event, params) {
  let cb;
  if (cb = obj[$21]) {
    if (cb[event]) {
      emit__(event, params, cb[event]);
    }
    ;
    if (cb.all) {
      emit__(event, [event, params], cb.all);
    }
    ;
  }
  ;
  return;
}

// node_modules/imba/src/imba/scheduler.imba
function iter$__(a) {
  let v;
  return a ? (v = a.toIterable) ? v.call(a) : a : a;
}
var $12 = Symbol.for("#__init__");
var $22 = Symbol.for("#__patch__");
var $19 = Symbol.for("#__initor__");
var $20 = Symbol.for("#__inited__");
var $3 = Symbol.for("#__hooks__");
var $4 = Symbol.for("#schedule");
var $7 = Symbol.for("#frames");
var $8 = Symbol.for("#interval");
var $9 = Symbol.for("#stage");
var $10 = Symbol.for("#scheduled");
var $11 = Symbol.for("#version");
var $122 = Symbol.for("#fps");
var $13 = Symbol.for("#ticker");
var rAF = globalThis.requestAnimationFrame || function(blk) {
  return globalThis.setTimeout(blk, 1e3 / 60);
};
var SPF = 1 / 60;
var Scheduled = class {
  [$22]($$ = {}) {
    var $514;
    ($514 = $$.owner) !== void 0 && (this.owner = $514);
    ($514 = $$.target) !== void 0 && (this.target = $514);
    ($514 = $$.active) !== void 0 && (this.active = $514);
    ($514 = $$.value) !== void 0 && (this.value = $514);
    ($514 = $$.skip) !== void 0 && (this.skip = $514);
    ($514 = $$.last) !== void 0 && (this.last = $514);
  }
  constructor($$ = null) {
    this[$12]($$);
  }
  [$12]($$ = null) {
    var $610;
    this.owner = $$ && ($610 = $$.owner) !== void 0 ? $610 : null;
    this.target = $$ && ($610 = $$.target) !== void 0 ? $610 : null;
    this.active = $$ && ($610 = $$.active) !== void 0 ? $610 : false;
    this.value = $$ && ($610 = $$.value) !== void 0 ? $610 : void 0;
    this.skip = $$ && ($610 = $$.skip) !== void 0 ? $610 : 0;
    this.last = $$ && ($610 = $$.last) !== void 0 ? $610 : 0;
  }
  tick(scheduler2, source) {
    this.last = this.owner[$7];
    this.target.tick(this, source);
    return 1;
  }
  update(o, activate\u03A6) {
    let on = this.active;
    let val = o.value;
    let changed = this.value != val;
    if (changed) {
      this.deactivate();
      this.value = val;
    }
    ;
    if (this.value || on || activate\u03A6) {
      this.activate();
    }
    ;
    return this;
  }
  queue() {
    this.owner.add(this);
    return;
  }
  activate() {
    if (this.value === true) {
      this.owner.on("commit", this);
    } else if (this.value === false) {
      true;
    } else if (typeof this.value == "number") {
      let tock = this.value / (1e3 / 60);
      if (tock <= 2) {
        this.owner.on("raf", this);
      } else {
        this[$8] = globalThis.setInterval(this.queue.bind(this), this.value);
      }
      ;
    }
    ;
    this.active = true;
    return this;
  }
  deactivate() {
    if (this.value === true) {
      this.owner.un("commit", this);
    }
    ;
    this.owner.un("raf", this);
    if (this[$8]) {
      globalThis.clearInterval(this[$8]);
      this[$8] = null;
    }
    ;
    this.active = false;
    return this;
  }
};
var Scheduler = class {
  constructor() {
    var self = this;
    this.id = Symbol();
    this.queue = [];
    this.stage = -1;
    this[$9] = -1;
    this[$7] = 0;
    this[$10] = false;
    this[$11] = 0;
    this.listeners = {};
    this.intervals = {};
    self.commit = function() {
      self.add("commit");
      return self;
    };
    this[$122] = 0;
    self.$promise = null;
    self.$resolve = null;
    this[$13] = function(e) {
      self[$10] = false;
      return self.tick(e);
    };
    self;
  }
  touch() {
    return this[$11]++;
  }
  get version() {
    return this[$11];
  }
  add(item, force) {
    if (force || this.queue.indexOf(item) == -1) {
      this.queue.push(item);
    }
    ;
    if (!this[$10]) {
      this[$4]();
    }
    ;
    return this;
  }
  get committing\u03A6() {
    return this.queue.indexOf("commit") >= 0;
  }
  get syncing\u03A6() {
    return this[$9] == 1;
  }
  listen(ns, item) {
    let set = this.listeners[ns];
    let first = !set;
    set || (set = this.listeners[ns] = new Set());
    set.add(item);
    if (ns == "raf" && first) {
      this.add("raf");
    }
    ;
    return this;
  }
  unlisten(ns, item) {
    var $147;
    let set = this.listeners[ns];
    set && set.delete(item);
    if (ns == "raf" && set && set.size == 0) {
      $147 = this.listeners.raf, delete this.listeners.raf, $147;
    }
    ;
    return this;
  }
  on(ns, item) {
    return this.listen(ns, item);
  }
  un(ns, item) {
    return this.unlisten(ns, item);
  }
  get promise() {
    var self = this;
    return self.$promise || (self.$promise = new Promise(function(resolve) {
      return self.$resolve = resolve;
    }));
  }
  tick(timestamp) {
    var self = this;
    let items = this.queue;
    let frame = this[$7]++;
    if (!this.ts) {
      this.ts = timestamp;
    }
    ;
    this.dt = timestamp - this.ts;
    this.ts = timestamp;
    this.queue = [];
    this[$9] = 1;
    this[$11]++;
    if (items.length) {
      for (let i = 0, $1510 = iter$__(items), $169 = $1510.length; i < $169; i++) {
        let item = $1510[i];
        if (typeof item === "string" && this.listeners[item]) {
          self.listeners[item].forEach(function(listener) {
            if (listener.tick instanceof Function) {
              return listener.tick(self, item);
            } else if (listener instanceof Function) {
              return listener(self, item);
            }
            ;
          });
        } else if (item instanceof Function) {
          item(self.dt, self);
        } else if (item.tick) {
          item.tick(self.dt, self);
        }
        ;
      }
      ;
    }
    ;
    this[$9] = this[$10] ? 0 : -1;
    if (self.$promise) {
      self.$resolve(self);
      self.$promise = self.$resolve = null;
    }
    ;
    if (self.listeners.raf && true) {
      self.add("raf");
    }
    ;
    return self;
  }
  [$4]() {
    if (!this[$10]) {
      this[$10] = true;
      if (this[$9] == -1) {
        this[$9] = 0;
      }
      ;
      rAF(this[$13]);
    }
    ;
    return this;
  }
  schedule(item, o) {
    var $175, $187;
    o || (o = item[$175 = this.id] || (item[$175] = {value: true}));
    let state = o[$187 = this.id] || (o[$187] = new Scheduled({owner: this, target: item}));
    return state.update(o, true);
  }
  unschedule(item, o = {}) {
    o || (o = item[this.id]);
    let state = o && o[this.id];
    if (state && state.active) {
      state.deactivate();
    }
    ;
    return this;
  }
};
var scheduler = new Scheduler();
function commit() {
  return scheduler.add("commit").promise;
}
function setTimeout2(fn, ms) {
  return globalThis.setTimeout(function() {
    fn();
    commit();
    return;
  }, ms);
}
function setInterval2(fn, ms) {
  return globalThis.setInterval(function() {
    fn();
    commit();
    return;
  }, ms);
}
var clearInterval2 = globalThis.clearInterval;
var clearTimeout = globalThis.clearTimeout;
var instance = globalThis.imba || (globalThis.imba = {});
instance.commit = commit;
instance.setTimeout = setTimeout2;
instance.setInterval = setInterval2;
instance.clearInterval = clearInterval2;
instance.clearTimeout = clearTimeout;

// node_modules/imba/src/imba/manifest.web.imba
var $25 = Symbol.for("#__initor__");
var $32 = Symbol.for("#__inited__");
var $14 = Symbol.for("#__hooks__");
var Manifest = class {
  constructor() {
    this.data = {};
  }
};
var manifest = new Manifest();

// node_modules/imba/src/imba/asset.imba
var $132 = Symbol.for("#__initor__");
var $142 = Symbol.for("#__inited__");
var $15 = Symbol.for("#__hooks__");
var $26 = Symbol.for("#__init__");
var $33 = Symbol.for("#__patch__");
var $42 = Symbol.for("#warned");
var $102 = Symbol.for("#asset");
var AssetProxy = class {
  static wrap(meta) {
    let handler = new AssetProxy(meta);
    return new Proxy(handler, handler);
  }
  constructor(meta) {
    this.meta = meta;
  }
  get input() {
    return manifest.inputs[this.meta.input];
  }
  get asset() {
    return globalThis._MF_ ? this.meta : this.input ? this.input.asset : null;
  }
  set(target, key, value) {
    return true;
  }
  get(target, key) {
    if (this.meta.meta && this.meta.meta[key] != void 0) {
      return this.meta.meta[key];
    }
    ;
    if (!this.asset) {
      if (this.meta[$42] != true ? (this.meta[$42] = true, true) : false) {
        console.warn("Asset for '" + this.meta.input + "' not found");
      }
      ;
      if (key == "valueOf") {
        return function() {
          return "";
        };
      }
      ;
      return null;
    }
    ;
    if (key == "absPath" && !this.asset.absPath) {
      return this.asset.url;
    }
    ;
    return this.asset[key];
  }
};
var SVGAsset = class {
  [$33]($$ = {}) {
    var $514;
    ($514 = $$.url) !== void 0 && (this.url = $514);
    ($514 = $$.meta) !== void 0 && (this.meta = $514);
  }
  constructor($$ = null) {
    this[$26]($$);
  }
  [$26]($$ = null) {
    this.url = $$ ? $$.url : void 0;
    this.meta = $$ ? $$.meta : void 0;
  }
  adoptNode(node) {
    var _a;
    if ((_a = this.meta) == null ? void 0 : _a.content) {
      for (let $89 = this.meta.attributes, $610 = 0, $710 = Object.keys($89), $97 = $710.length, k, v; $610 < $97; $610++) {
        k = $710[$610];
        v = $89[k];
        node.setAttribute(k, v);
      }
      ;
      node.innerHTML = this.meta.content;
    }
    ;
    return this;
  }
  toString() {
    return this.url;
  }
  toStyleString() {
    return "url(" + this.url + ")";
  }
};
function asset(data) {
  var $1110, $129;
  if (data[$102]) {
    return data[$102];
  }
  ;
  if (data.type == "svg") {
    return data[$102] || (data[$102] = new SVGAsset(data));
  }
  ;
  if (data.input) {
    let extra = globalThis._MF_ && globalThis._MF_[data.input];
    if (extra) {
      Object.assign(data, extra);
      data.toString = function() {
        return this.absPath;
      };
    }
    ;
    return data[$102] || (data[$102] = AssetProxy.wrap(data));
  }
  ;
  return data;
}

// node_modules/imba/src/imba/dom/flags.imba
var $16 = Symbol.for("#toStringDeopt");
var $72 = Symbol.for("#__initor__");
var $82 = Symbol.for("#__inited__");
var $27 = Symbol.for("#__hooks__");
var $34 = Symbol.for("#symbols");
var $43 = Symbol.for("#batches");
var $5 = Symbol.for("#extras");
var $6 = Symbol.for("#stacks");
var Flags = class {
  constructor(dom) {
    this.dom = dom;
    this.string = "";
  }
  contains(ref) {
    return this.dom.classList.contains(ref);
  }
  add(ref) {
    if (this.contains(ref)) {
      return this;
    }
    ;
    this.string += (this.string ? " " : "") + ref;
    this.dom.classList.add(ref);
    return this;
  }
  remove(ref) {
    if (!this.contains(ref)) {
      return this;
    }
    ;
    let regex = new RegExp("(^|\\s)" + ref + "(?=\\s|$)", "g");
    this.string = this.string.replace(regex, "");
    this.dom.classList.remove(ref);
    return this;
  }
  toggle(ref, bool) {
    if (bool === void 0) {
      bool = !this.contains(ref);
    }
    ;
    return bool ? this.add(ref) : this.remove(ref);
  }
  incr(ref, duration = 0) {
    var self = this;
    let m = this.stacks;
    let c = m[ref] || 0;
    if (c < 1) {
      this.add(ref);
    }
    ;
    if (duration > 0) {
      setTimeout(function() {
        return self.decr(ref);
      }, duration);
    }
    ;
    return m[ref] = Math.max(c, 0) + 1;
  }
  decr(ref) {
    let m = this.stacks;
    let c = m[ref] || 0;
    if (c == 1) {
      this.remove(ref);
    }
    ;
    return m[ref] = Math.max(c, 1) - 1;
  }
  reconcile(sym, str) {
    let syms = this[$34];
    let vals = this[$43];
    let dirty = true;
    if (!syms) {
      syms = this[$34] = [sym];
      vals = this[$43] = [str || ""];
      this.toString = this.valueOf = this[$16];
    } else {
      let idx = syms.indexOf(sym);
      let val = str || "";
      if (idx == -1) {
        syms.push(sym);
        vals.push(val);
      } else if (vals[idx] != val) {
        vals[idx] = val;
      } else {
        dirty = false;
      }
      ;
    }
    ;
    if (dirty) {
      this[$5] = " " + vals.join(" ");
      this.sync();
    }
    ;
    return;
  }
  valueOf() {
    return this.string;
  }
  toString() {
    return this.string;
  }
  [$16]() {
    return this.string + (this[$5] || "");
  }
  sync() {
    return this.dom.flagSync$();
  }
  get stacks() {
    return this[$6] || (this[$6] = {});
  }
};

// node_modules/imba/src/imba/dom/context.imba
var $17 = Symbol.for("#__init__");
var $28 = Symbol.for("#__patch__");
var $73 = Symbol.for("#__initor__");
var $83 = Symbol.for("#__inited__");
var $35 = Symbol.for("#__hooks__");
var $44 = Symbol.for("#getRenderContext");
var $52 = Symbol.for("#getDynamicContext");
var $62 = Symbol();
var renderContext = {
  context: null
};
var Renderer = class {
  [$28]($$ = {}) {
    var $97;
    ($97 = $$.stack) !== void 0 && (this.stack = $97);
  }
  constructor($$ = null) {
    this[$17]($$);
  }
  [$17]($$ = null) {
    var $106;
    this.stack = $$ && ($106 = $$.stack) !== void 0 ? $106 : [];
  }
  push(el) {
    return this.stack.push(el);
  }
  pop(el) {
    return this.stack.pop();
  }
};
var renderer = new Renderer();
var RenderContext = class extends Map {
  static [$17]() {
    this.prototype[$73] = $62;
    return this;
  }
  constructor(parent, sym = null) {
    super();
    this._ = parent;
    this.sym = sym;
    this[$73] === $62 && (this[$35] && this[$35].inited(this), this[$83] && this[$83]());
  }
  pop() {
    return renderContext.context = null;
  }
  [$44](sym) {
    let out = this.get(sym);
    out || this.set(sym, out = new RenderContext(this._, sym));
    return renderContext.context = out;
  }
  [$52](sym, key) {
    return this[$44](sym)[$44](key);
  }
  run(value) {
    this.value = value;
    if (renderContext.context == this) {
      renderContext.context = null;
    }
    ;
    return this.get(value);
  }
  cache(val) {
    this.set(this.value, val);
    return val;
  }
};
RenderContext[$17]();
function createRenderContext(cache, key = Symbol(), up = cache) {
  return renderContext.context = cache[key] || (cache[key] = new RenderContext(up, key));
}
function getRenderContext() {
  let ctx = renderContext.context;
  let res = ctx || new RenderContext(null);
  if (true) {
    if (!ctx && renderer.stack.length > 0) {
      console.warn("detected unmemoized nodes in", renderer.stack, "see https://imba.io", res);
    }
    ;
  }
  ;
  if (ctx) {
    renderContext.context = null;
  }
  ;
  return res;
}

// node_modules/imba/src/imba/dom/core.web.imba
function extend$__(target, ext) {
  const descriptors = Object.getOwnPropertyDescriptors(ext);
  delete descriptors.constructor;
  Object.defineProperties(target, descriptors);
  return target;
}
function iter$__2(a) {
  let v;
  return a ? (v = a.toIterable) ? v.call(a) : a : a;
}
var $18 = Symbol.for("#parent");
var $29 = Symbol.for("#closestNode");
var $36 = Symbol.for("#parentNode");
var $45 = Symbol.for("#context");
var $53 = Symbol.for("#__init__");
var $63 = Symbol.for("##inited");
var $74 = Symbol.for("#getRenderContext");
var $84 = Symbol.for("#getDynamicContext");
var $92 = Symbol.for("#insertChild");
var $103 = Symbol.for("#appendChild");
var $112 = Symbol.for("#replaceChild");
var $123 = Symbol.for("#removeChild");
var $133 = Symbol.for("#insertInto");
var $143 = Symbol.for("#insertIntoDeopt");
var $152 = Symbol.for("#removeFrom");
var $162 = Symbol.for("#removeFromDeopt");
var $172 = Symbol.for("#replaceWith");
var $182 = Symbol.for("#replaceWithDeopt");
var $192 = Symbol.for("#placeholderNode");
var $202 = Symbol.for("#attachToParent");
var $212 = Symbol.for("#detachFromParent");
var $222 = Symbol.for("#placeChild");
var $232 = Symbol.for("#beforeReconcile");
var $242 = Symbol.for("#afterReconcile");
var $252 = Symbol.for("#afterVisit");
var $262 = Symbol.for("##parent");
var $272 = Symbol.for("##up");
var $282 = Symbol.for("##context");
var $292 = Symbol.for("#domNode");
var $30 = Symbol.for("##placeholderNode");
var $31 = Symbol.for("#domDeopt");
var $322 = Symbol.for("#isRichElement");
var $342 = Symbol.for("#src");
var $422 = Symbol.for("#htmlNodeName");
var $432 = Symbol.for("#getSlot");
var $442 = Symbol.for("#ImbaElement");
var $452 = Symbol.for("#cssns");
var $46 = Symbol.for("#cssid");
var {
  Event,
  UIEvent,
  MouseEvent,
  PointerEvent,
  KeyboardEvent,
  CustomEvent,
  Node,
  Comment,
  Text,
  Element,
  HTMLElement,
  HTMLHtmlElement,
  HTMLSelectElement,
  HTMLInputElement,
  HTMLTextAreaElement,
  HTMLButtonElement,
  HTMLOptionElement,
  HTMLScriptElement,
  SVGElement,
  DocumentFragment,
  ShadowRoot,
  Document,
  Window,
  customElements
} = globalThis.window;
var descriptorCache = {};
function getDescriptor(item, key, cache) {
  if (!item) {
    return cache[key] = null;
  }
  ;
  if (cache[key] !== void 0) {
    return cache[key];
  }
  ;
  let desc = Object.getOwnPropertyDescriptor(item, key);
  if (desc !== void 0 || item == SVGElement) {
    return cache[key] = desc || null;
  }
  ;
  return getDescriptor(Reflect.getPrototypeOf(item), key, cache);
}
var CustomTagConstructors = {};
var CustomTagToElementNames = {};
var TYPES = {};
var CUSTOM_TYPES = {};
var contextHandler = {
  get(target, name) {
    let ctx = target;
    let val = void 0;
    while (ctx && val == void 0) {
      if (ctx = ctx[$18]) {
        val = ctx[name];
      }
      ;
    }
    ;
    return val;
  },
  set(target, name, value) {
    let ctx = target;
    let val = void 0;
    while (ctx && val == void 0) {
      let desc = getDeepPropertyDescriptor(ctx, name, Element);
      if (desc) {
        ctx[name] = value;
        return true;
      } else {
        ctx = ctx[$18];
      }
      ;
    }
    ;
    return true;
  }
};
var Extend$Document$af = class {
  get flags() {
    return this.documentElement.flags;
  }
};
extend$__(Document.prototype, Extend$Document$af.prototype);
var Extend$Node$ag = class {
  get [$18]() {
    return this[$262] || this.parentNode || this[$272];
  }
  get [$29]() {
    return this;
  }
  get [$36]() {
    return this[$18][$29];
  }
  get [$45]() {
    return this[$282] || (this[$282] = new Proxy(this, contextHandler));
  }
  [$53]() {
    return this;
  }
  [$63]() {
    return this;
  }
  [$74](sym) {
    return createRenderContext(this, sym);
  }
  [$84](sym, key) {
    return this[$74](sym)[$74](key);
  }
  [$92](newnode, refnode) {
    return newnode[$133](this, refnode);
  }
  [$103](newnode) {
    return newnode[$133](this, null);
  }
  [$112](newnode, oldnode) {
    let res = this[$92](newnode, oldnode);
    this[$123](oldnode);
    return res;
  }
  [$123](node) {
    return node[$152](this);
  }
  [$133](parent, before = null) {
    if (before) {
      parent.insertBefore(this, before);
    } else {
      parent.appendChild(this);
    }
    ;
    return this;
  }
  [$143](parent, before) {
    if (before) {
      parent.insertBefore(this[$292] || this, before);
    } else {
      parent.appendChild(this[$292] || this);
    }
    ;
    return this;
  }
  [$152](parent) {
    return parent.removeChild(this);
  }
  [$162](parent) {
    return parent.removeChild(this[$292] || this);
  }
  [$172](other, parent) {
    return parent[$112](other, this);
  }
  [$182](other, parent) {
    return parent[$112](other, this[$292] || this);
  }
  get [$192]() {
    return this[$30] || (this[$30] = globalThis.document.createComment("placeholder"));
  }
  set [$192](value) {
    let prev = this[$30];
    this[$30] = value;
    if (prev && prev != value && prev.parentNode) {
      prev[$172](value);
    }
    ;
  }
  [$202]() {
    let ph = this[$292];
    let par = ph && ph.parentNode;
    if (ph && par && ph != this) {
      this[$292] = null;
      this[$133](par, ph);
      ph[$152](par);
    }
    ;
    return this;
  }
  [$212]() {
    if (this[$31] != true ? (this[$31] = true, true) : false) {
      this[$172] = this[$182];
      this[$152] = this[$162];
      this[$133] = this[$143];
    }
    ;
    let ph = this[$192];
    if (this.parentNode && ph != this) {
      ph[$133](this.parentNode, this);
      this[$152](this.parentNode);
    }
    ;
    this[$292] = ph;
    return this;
  }
  [$222](item, f, prev) {
    let type = typeof item;
    if (type === "undefined" || item === null) {
      if (prev && prev instanceof Comment) {
        return prev;
      }
      ;
      let el = globalThis.document.createComment("");
      return prev ? prev[$172](el, this) : el[$133](this, null);
    }
    ;
    if (item === prev) {
      return item;
    } else if (type !== "object") {
      let res;
      let txt = item;
      if (f & 128 && f & 256 && false) {
        this.textContent = txt;
        return;
      }
      ;
      if (prev) {
        if (prev instanceof Text) {
          prev.textContent = txt;
          return prev;
        } else {
          res = globalThis.document.createTextNode(txt);
          prev[$172](res, this);
          return res;
        }
        ;
      } else {
        this.appendChild(res = globalThis.document.createTextNode(txt));
        return res;
      }
      ;
    } else {
      if (true) {
        if (!item[$133]) {
          console.warn("Tried to insert", item, "into", this);
          throw new TypeError("Only DOM Nodes can be inserted into DOM");
        }
        ;
      }
      ;
      return prev ? prev[$172](item, this) : item[$133](this, null);
    }
    ;
    return;
  }
};
extend$__(Node.prototype, Extend$Node$ag.prototype);
var Extend$Element$ah = class {
  log(...params) {
    console.log(...params);
    return this;
  }
  emit(name, detail, o = {bubbles: true, cancelable: true}) {
    if (detail != void 0) {
      o.detail = detail;
    }
    ;
    let event = new CustomEvent(name, o);
    let res = this.dispatchEvent(event);
    return event;
  }
  text$(item) {
    this.textContent = item;
    return this;
  }
  [$232]() {
    return this;
  }
  [$242]() {
    return this;
  }
  [$252]() {
    if (this.render) {
      this.render();
    }
    ;
    return;
  }
  get flags() {
    if (!this.$flags) {
      this.$flags = new Flags(this);
      if (this.flag$ == Element.prototype.flag$) {
        this.flags$ext = this.className;
      }
      ;
      this.flagDeopt$();
    }
    ;
    return this.$flags;
  }
  flag$(str) {
    let ns = this.flags$ns;
    this.className = ns ? ns + (this.flags$ext = str) : this.flags$ext = str;
    return;
  }
  flagDeopt$() {
    var self = this;
    this.flag$ = this.flagExt$;
    self.flagSelf$ = function(str) {
      return self.flagSync$(self.flags$own = str);
    };
    return;
  }
  flagExt$(str) {
    return this.flagSync$(this.flags$ext = str);
  }
  flagSelf$(str) {
    this.flagDeopt$();
    return this.flagSelf$(str);
  }
  flagSync$() {
    return this.className = (this.flags$ns || "") + (this.flags$ext || "") + " " + (this.flags$own || "") + " " + (this.$flags || "");
  }
  set$(key, value) {
    let desc = getDeepPropertyDescriptor(this, key, Element);
    if (!desc || !desc.set) {
      this.setAttribute(key, value);
    } else {
      this[key] = value;
    }
    ;
    return;
  }
  get richValue() {
    return this.value;
  }
  set richValue(value) {
    this.value = value;
  }
};
extend$__(Element.prototype, Extend$Element$ah.prototype);
Element.prototype.setns$ = Element.prototype.setAttributeNS;
Element.prototype[$322] = true;
function createElement(name, parent, flags, text) {
  let el = globalThis.document.createElement(name);
  if (flags) {
    el.className = flags;
  }
  ;
  if (text !== null) {
    el.text$(text);
  }
  ;
  if (parent && parent[$103]) {
    parent[$103](el);
  }
  ;
  return el;
}
var Extend$SVGElement$ai = class {
  set$(key, value) {
    var $332;
    let cache = descriptorCache[$332 = this.nodeName] || (descriptorCache[$332] = {});
    let desc = getDescriptor(this, key, cache);
    if (!desc || !desc.set) {
      this.setAttribute(key, value);
    } else {
      this[key] = value;
    }
    ;
    return;
  }
  flag$(str) {
    let ns = this.flags$ns;
    this.setAttribute("class", ns ? ns + (this.flags$ext = str) : this.flags$ext = str);
    return;
  }
  flagSelf$(str) {
    var self = this;
    self.flag$ = function(str2) {
      return self.flagSync$(self.flags$ext = str2);
    };
    self.flagSelf$ = function(str2) {
      return self.flagSync$(self.flags$own = str2);
    };
    return self.flagSelf$(str);
  }
  flagSync$() {
    return this.setAttribute("class", (this.flags$ns || "") + (this.flags$ext || "") + " " + (this.flags$own || "") + " " + (this.$flags || ""));
  }
};
extend$__(SVGElement.prototype, Extend$SVGElement$ai.prototype);
var Extend$SVGSVGElement$aj = class {
  set src(value) {
    if (this[$342] != value ? (this[$342] = value, true) : false) {
      if (value) {
        if (value.adoptNode) {
          value.adoptNode(this);
        } else if (value.content) {
          for (let $372 = value.attributes, $353 = 0, $363 = Object.keys($372), $382 = $363.length, k, v; $353 < $382; $353++) {
            k = $363[$353];
            v = $372[k];
            this.setAttribute(k, v);
          }
          ;
          this.innerHTML = value.content;
        }
        ;
      }
      ;
    }
    ;
    return;
  }
};
extend$__(SVGSVGElement.prototype, Extend$SVGSVGElement$aj.prototype);
function createComment(text) {
  return globalThis.document.createComment(text);
}
function createTextNode(text) {
  return globalThis.document.createTextNode(text);
}
var navigator = globalThis.navigator;
var vendor = navigator && navigator.vendor || "";
var ua = navigator && navigator.userAgent || "";
var isSafari = vendor.indexOf("Apple") > -1 || ua.indexOf("CriOS") >= 0 || ua.indexOf("FxiOS") >= 0;
var supportsCustomizedBuiltInElements = !isSafari;
var CustomDescriptorCache = new Map();
var CustomHook = class extends HTMLElement {
  connectedCallback() {
    if (supportsCustomizedBuiltInElements) {
      return this.parentNode.removeChild(this);
    } else {
      return this.parentNode.connectedCallback();
    }
    ;
  }
  disconnectedCallback() {
    if (!supportsCustomizedBuiltInElements) {
      return this.parentNode.disconnectedCallback();
    }
    ;
  }
};
window.customElements.define("i-hook", CustomHook);
function getCustomDescriptors(el, klass) {
  let props = CustomDescriptorCache.get(klass);
  if (!props) {
    props = {};
    let proto = klass.prototype;
    let protos = [proto];
    while (proto = proto && Object.getPrototypeOf(proto)) {
      if (proto.constructor == el.constructor) {
        break;
      }
      ;
      protos.unshift(proto);
    }
    ;
    for (let $393 = 0, $40 = iter$__2(protos), $412 = $40.length; $393 < $412; $393++) {
      let item = $40[$393];
      let desc = Object.getOwnPropertyDescriptors(item);
      Object.assign(props, desc);
    }
    ;
    CustomDescriptorCache.set(klass, props);
  }
  ;
  return props;
}
function createComponent(name, parent, flags, text, ctx) {
  let el;
  if (typeof name != "string") {
    if (name && name.nodeName) {
      name = name.nodeName;
    }
    ;
  }
  ;
  let cmpname = CustomTagToElementNames[name] || name;
  if (CustomTagConstructors[name]) {
    let cls = CustomTagConstructors[name];
    let typ = cls.prototype[$422];
    if (typ && supportsCustomizedBuiltInElements) {
      el = globalThis.document.createElement(typ, {is: name});
    } else if (cls.create$ && typ) {
      el = globalThis.document.createElement(typ);
      el.setAttribute("is", cmpname);
      let props = getCustomDescriptors(el, cls);
      Object.defineProperties(el, props);
      el.__slots = {};
      el.appendChild(globalThis.document.createElement("i-hook"));
    } else if (cls.create$) {
      el = cls.create$(el);
      el.__slots = {};
    } else {
      console.warn("could not create tag " + name);
    }
    ;
  } else {
    el = globalThis.document.createElement(CustomTagToElementNames[name] || name);
  }
  ;
  el[$262] = parent;
  el[$53]();
  el[$63]();
  if (text !== null) {
    el[$432]("__").text$(text);
  }
  ;
  if (flags || el.flags$ns) {
    el.flag$(flags || "");
  }
  ;
  return el;
}
function createDynamic(value, parent, flags, text) {
  if (value == null || value == void 0) {
    return createComment("");
  } else if (value instanceof Node) {
    return value;
  } else if (value[$322]) {
    return value;
  } else if (typeof value == "string" || value && value.prototype instanceof Node) {
    return createComponent(value, parent, flags, text);
  }
  ;
}
function defineTag(name, klass, options = {}) {
  TYPES[name] = CUSTOM_TYPES[name] = klass;
  klass.nodeName = name;
  let componentName = name;
  let proto = klass.prototype;
  if (name.indexOf("-") == -1) {
    componentName = "" + name + "-tag";
    CustomTagToElementNames[name] = componentName;
  }
  ;
  if (options.cssns) {
    let ns = (proto._ns_ || proto[$452] || "") + " " + (options.cssns || "");
    proto._ns_ = ns.trim() + " ";
    proto[$452] = options.cssns;
  }
  ;
  if (options.cssid) {
    let ids = (proto.flags$ns || "") + " " + options.cssid;
    proto[$46] = options.cssid;
    proto.flags$ns = ids.trim() + " ";
  }
  ;
  if (proto[$422] && !options.extends) {
    options.extends = proto[$422];
  }
  ;
  if (options.extends) {
    proto[$422] = options.extends;
    CustomTagConstructors[name] = klass;
    if (supportsCustomizedBuiltInElements) {
      window.customElements.define(componentName, klass, {extends: options.extends});
    }
    ;
  } else {
    window.customElements.define(componentName, klass);
  }
  ;
  return klass;
}
var instance2 = globalThis.imba || (globalThis.imba = {});
instance2.document = globalThis.document;

// node_modules/imba/src/imba/dom/fragment.imba
function iter$__3(a) {
  let v;
  return a ? (v = a.toIterable) ? v.call(a) : a : a;
}
function extend$__2(target, ext) {
  const descriptors = Object.getOwnPropertyDescriptors(ext);
  delete descriptors.constructor;
  Object.defineProperties(target, descriptors);
  return target;
}
var $110 = Symbol.for("#parent");
var $210 = Symbol.for("#closestNode");
var $37 = Symbol.for("#isRichElement");
var $47 = Symbol.for("#afterVisit");
var $153 = Symbol.for("#__initor__");
var $163 = Symbol.for("#__inited__");
var $54 = Symbol.for("#__hooks__");
var $64 = Symbol.for("#appendChild");
var $75 = Symbol.for("#removeChild");
var $85 = Symbol.for("#insertInto");
var $93 = Symbol.for("#replaceWith");
var $104 = Symbol.for("#insertChild");
var $113 = Symbol.for("#removeFrom");
var $124 = Symbol.for("#placeChild");
var $144 = Symbol.for("#__init__");
var $173 = Symbol.for("#registerFunctionalSlot");
var $183 = Symbol.for("#getFunctionalSlot");
var $193 = Symbol.for("#getSlot");
var $203 = Symbol.for("##parent");
var $213 = Symbol.for("##up");
var $223 = Symbol.for("##flags");
var $233 = Symbol.for("#domFlags");
var $243 = Symbol.for("#end");
var $253 = Symbol.for("#textContent");
var $293 = Symbol.for("#textNode");
var $362 = Symbol.for("#functionalSlots");
var $134 = Symbol();
function use_slots() {
  return true;
}
var Fragment = class {
  constructor() {
    this.childNodes = [];
  }
  log(...params) {
    return;
  }
  hasChildNodes() {
    return false;
  }
  set [$110](value) {
    this[$203] = value;
  }
  get [$110]() {
    return this[$203] || this[$213];
  }
  get [$210]() {
    return this[$110][$210];
  }
  get [$37]() {
    return true;
  }
  get flags() {
    return this[$223] || (this[$223] = new Flags(this));
  }
  flagSync$() {
    return this;
  }
  [$47]() {
    return this;
  }
};
var counter = 0;
var VirtualFragment = class extends Fragment {
  static [$144]() {
    this.prototype[$153] = $134;
    return this;
  }
  constructor(flags, parent) {
    super(...arguments);
    this[$213] = parent;
    this.parentNode = null;
    this[$233] = flags;
    this.childNodes = [];
    this[$243] = createComment("slot" + counter++);
    if (parent) {
      parent[$64](this);
    }
    ;
    this[$153] === $134 && (this[$54] && this[$54].inited(this), this[$163] && this[$163]());
  }
  get [$110]() {
    return this[$203] || this.parentNode || this[$213];
  }
  set textContent(text) {
    this[$253] = text;
  }
  get textContent() {
    return this[$253];
  }
  hasChildNodes() {
    for (let $265 = 0, $274 = iter$__3(this.childNodes), $284 = $274.length; $265 < $284; $265++) {
      let item = $274[$265];
      if (item instanceof Fragment) {
        if (item.hasChildNodes()) {
          return true;
        }
        ;
      }
      ;
      if (item instanceof Comment) {
        true;
      } else if (item instanceof Node) {
        return true;
      }
      ;
    }
    ;
    return false;
  }
  text$(item) {
    if (!this[$293]) {
      this[$293] = this[$124](item);
    } else {
      this[$293].textContent = item;
    }
    ;
    return this[$293];
  }
  appendChild(child) {
    if (this.parentNode) {
      child[$85](this.parentNode, this[$243]);
    }
    ;
    return this.childNodes.push(child);
  }
  [$64](child) {
    if (this.parentNode) {
      child[$85](this.parentNode, this[$243]);
    }
    ;
    return this.childNodes.push(child);
  }
  insertBefore(node, refnode) {
    if (this.parentNode) {
      this.parentNode[$104](node, refnode);
    }
    ;
    let idx = this.childNodes.indexOf(refnode);
    if (idx >= 0) {
      this.childNodes.splice(idx, 0, node);
    }
    ;
    return node;
  }
  [$75](node) {
    if (this.parentNode) {
      this.parentNode[$75](node);
    }
    ;
    let idx = this.childNodes.indexOf(node);
    if (idx >= 0) {
      this.childNodes.splice(idx, 1);
    }
    ;
    return;
  }
  [$85](parent, before) {
    let prev = this.parentNode;
    if (this.parentNode != parent ? (this.parentNode = parent, true) : false) {
      if (this[$243]) {
        before = this[$243][$85](parent, before);
      }
      ;
      for (let $304 = 0, $314 = iter$__3(this.childNodes), $325 = $314.length; $304 < $325; $304++) {
        let item = $314[$304];
        item[$85](parent, before);
      }
      ;
    }
    ;
    return this;
  }
  [$93](node, parent) {
    let res = node[$85](parent, this[$243]);
    this[$113](parent);
    return res;
  }
  [$104](node, refnode) {
    if (this.parentNode) {
      this.insertBefore(node, refnode || this[$243]);
    }
    ;
    if (refnode) {
      let idx = this.childNodes.indexOf(refnode);
      if (idx >= 0) {
        this.childNodes.splice(idx, 0, node);
      }
      ;
    } else {
      this.childNodes.push(node);
    }
    ;
    return node;
  }
  [$113](parent) {
    for (let $332 = 0, $343 = iter$__3(this.childNodes), $353 = $343.length; $332 < $353; $332++) {
      let item = $343[$332];
      item[$113](parent);
    }
    ;
    if (this[$243]) {
      this[$243][$113](parent);
    }
    ;
    this.parentNode = null;
    return this;
  }
  [$124](item, f, prev) {
    let par = this.parentNode;
    let type = typeof item;
    if (type === "undefined" || item === null) {
      if (prev && prev instanceof Comment) {
        return prev;
      }
      ;
      let el = createComment("");
      if (prev) {
        let idx = this.childNodes.indexOf(prev);
        this.childNodes.splice(idx, 1, el);
        if (par) {
          prev[$93](el, par);
        }
        ;
        return el;
      }
      ;
      this.childNodes.push(el);
      if (par) {
        el[$85](par, this[$243]);
      }
      ;
      return el;
    }
    ;
    if (item === prev) {
      return item;
    }
    ;
    if (type !== "object") {
      let res;
      let txt = item;
      if (prev) {
        if (prev instanceof Text) {
          prev.textContent = txt;
          return prev;
        } else {
          res = createTextNode(txt);
          let idx = this.childNodes.indexOf(prev);
          this.childNodes.splice(idx, 1, res);
          if (par) {
            prev[$93](res, par);
          }
          ;
          return res;
        }
        ;
      } else {
        this.childNodes.push(res = createTextNode(txt));
        if (par) {
          res[$85](par, this[$243]);
        }
        ;
        return res;
      }
      ;
    } else if (prev) {
      let idx = this.childNodes.indexOf(prev);
      this.childNodes.splice(idx, 1, item);
      if (par) {
        prev[$93](item, par);
      }
      ;
      return item;
    } else {
      this.childNodes.push(item);
      if (par) {
        item[$85](par, this[$243]);
      }
      ;
      return item;
    }
    ;
  }
};
VirtualFragment[$144]();
function createSlot(bitflags, par) {
  const el = new VirtualFragment(bitflags, null);
  el[$213] = par;
  return el;
}
var Extend$Node$af = class {
  [$173](name) {
    let map = this[$362] || (this[$362] = {});
    return map[name] || (map[name] = createSlot(0, this));
  }
  [$183](name, context) {
    let map = this[$362];
    return map && map[name] || this[$193](name, context);
  }
  [$193](name, context) {
    var $372;
    if (name == "__" && !this.render) {
      return this;
    }
    ;
    return ($372 = this.__slots)[name] || ($372[name] = createSlot(0, this));
  }
};
extend$__2(Node.prototype, Extend$Node$af.prototype);

// node_modules/imba/src/imba/dom/component.imba
function iter$__4(a) {
  let v;
  return a ? (v = a.toIterable) ? v.call(a) : a : a;
}
var $111 = Symbol.for("#__init__");
var $211 = Symbol.for("#__patch__");
var $38 = Symbol.for("##inited");
var $48 = Symbol.for("#afterVisit");
var $55 = Symbol.for("#beforeReconcile");
var $65 = Symbol.for("#afterReconcile");
var $114 = Symbol.for("#count");
var $154 = Symbol.for("#__hooks__");
var $164 = Symbol.for("#autorender");
var hydrator = new class {
  [$211]($$ = {}) {
    var $710;
    ($710 = $$.items) !== void 0 && (this.items = $710);
    ($710 = $$.current) !== void 0 && (this.current = $710);
    ($710 = $$.lastQueued) !== void 0 && (this.lastQueued = $710);
    ($710 = $$.tests) !== void 0 && (this.tests = $710);
  }
  constructor($$ = null) {
    this[$111]($$);
  }
  [$111]($$ = null) {
    var $89;
    this.items = $$ && ($89 = $$.items) !== void 0 ? $89 : [];
    this.current = $$ && ($89 = $$.current) !== void 0 ? $89 : null;
    this.lastQueued = $$ && ($89 = $$.lastQueued) !== void 0 ? $89 : null;
    this.tests = $$ && ($89 = $$.tests) !== void 0 ? $89 : 0;
  }
  flush() {
    let item = null;
    if (false) {
    }
    ;
    while (item = this.items.shift()) {
      if (!item.parentNode || item.hydrated\u03A6) {
        continue;
      }
      ;
      let prev = this.current;
      this.current = item;
      item.__F |= 1024;
      item.connectedCallback();
      this.current = prev;
    }
    ;
    return;
  }
  queue(item) {
    var self = this;
    let len = this.items.length;
    let idx = 0;
    let prev = this.lastQueued;
    this.lastQueued = item;
    let BEFORE = Node.DOCUMENT_POSITION_PRECEDING;
    let AFTER = Node.DOCUMENT_POSITION_FOLLOWING;
    if (len) {
      let prevIndex = this.items.indexOf(prev);
      let index = prevIndex;
      let compare = function(a, b) {
        self.tests++;
        return a.compareDocumentPosition(b);
      };
      if (prevIndex == -1 || prev.nodeName != item.nodeName) {
        index = prevIndex = 0;
      }
      ;
      let curr = self.items[index];
      while (curr && compare(curr, item) & AFTER) {
        curr = self.items[++index];
      }
      ;
      if (index != prevIndex) {
        curr ? self.items.splice(index, 0, item) : self.items.push(item);
      } else {
        while (curr && compare(curr, item) & BEFORE) {
          curr = self.items[--index];
        }
        ;
        if (index != prevIndex) {
          curr ? self.items.splice(index + 1, 0, item) : self.items.unshift(item);
        }
        ;
      }
      ;
    } else {
      self.items.push(item);
      if (!self.current) {
        globalThis.queueMicrotask(self.flush.bind(self));
      }
      ;
    }
    ;
    return;
  }
  run(item) {
    var $147, $129;
    if (this.active) {
      return;
    }
    ;
    this.active = true;
    let all = globalThis.document.querySelectorAll(".__ssr");
    console.log("running hydrator", item, all.length, Array.from(all));
    for (let $97 = 0, $106 = iter$__4(all), $137 = $106.length; $97 < $137; $97++) {
      let item2 = $106[$97];
      item2[$114] || (item2[$114] = 1);
      item2[$114]++;
      let name = item2.nodeName;
      let typ = ($129 = this.map)[name] || ($129[name] = globalThis.window.customElements.get(name.toLowerCase()) || HTMLElement);
      console.log("item type", name, typ, !!CUSTOM_TYPES[name.toLowerCase()]);
      if (!item2.connectedCallback || !item2.parentNode || item2.hydrated\u03A6) {
        continue;
      }
      ;
      console.log("hydrate", item2);
    }
    ;
    return this.active = false;
  }
}();
var Component = class extends HTMLElement {
  constructor() {
    super();
    if (this.flags$ns) {
      this.flag$ = this.flagExt$;
    }
    ;
    this.setup$();
    this.build();
  }
  setup$() {
    this.__slots = {};
    return this.__F = 0;
  }
  [$111]() {
    this.__F |= 1 | 2;
    return this;
  }
  [$38]() {
    if (this[$154]) {
      return this[$154].inited(this);
    }
    ;
  }
  flag$(str) {
    this.className = this.flags$ext = str;
    return;
  }
  build() {
    return this;
  }
  awaken() {
    return this;
  }
  mount() {
    return this;
  }
  unmount() {
    return this;
  }
  rendered() {
    return this;
  }
  dehydrate() {
    return this;
  }
  hydrate() {
    this.autoschedule = true;
    return this;
  }
  tick() {
    return this.commit();
  }
  visit() {
    return this.commit();
  }
  commit() {
    if (!this.render\u03A6) {
      this.__F |= 8192;
      return this;
    }
    ;
    this.__F |= 256;
    this.render && this.render();
    this.rendered();
    return this.__F = (this.__F | 512) & ~256 & ~8192;
  }
  get autoschedule() {
    return (this.__F & 64) != 0;
  }
  set autoschedule(value) {
    value ? this.__F |= 64 : this.__F &= ~64;
  }
  set autorender(value) {
    let o = this[$164] || (this[$164] = {});
    o.value = value;
    if (this.mounted\u03A6) {
      scheduler.schedule(this, o);
    }
    ;
    return;
  }
  get render\u03A6() {
    return !this.suspended\u03A6;
  }
  get mounting\u03A6() {
    return (this.__F & 16) != 0;
  }
  get mounted\u03A6() {
    return (this.__F & 32) != 0;
  }
  get awakened\u03A6() {
    return (this.__F & 8) != 0;
  }
  get rendered\u03A6() {
    return (this.__F & 512) != 0;
  }
  get suspended\u03A6() {
    return (this.__F & 4096) != 0;
  }
  get rendering\u03A6() {
    return (this.__F & 256) != 0;
  }
  get scheduled\u03A6() {
    return (this.__F & 128) != 0;
  }
  get hydrated\u03A6() {
    return (this.__F & 2) != 0;
  }
  get ssr\u03A6() {
    return (this.__F & 1024) != 0;
  }
  schedule() {
    scheduler.on("commit", this);
    this.__F |= 128;
    return this;
  }
  unschedule() {
    scheduler.un("commit", this);
    this.__F &= ~128;
    return this;
  }
  async suspend(cb = null) {
    let val = this.flags.incr("_suspended_");
    this.__F |= 4096;
    if (cb instanceof Function) {
      await cb();
      this.unsuspend();
    }
    ;
    return this;
  }
  unsuspend() {
    let val = this.flags.decr("_suspended_");
    if (val == 0) {
      this.__F &= ~4096;
      this.commit();
      ;
    }
    ;
    return this;
  }
  [$48]() {
    return this.visit();
  }
  [$55]() {
    if (this.__F & 1024) {
      this.__F = this.__F & ~1024;
      this.classList.remove("_ssr_");
      if (this.flags$ext && this.flags$ext.indexOf("_ssr_") == 0) {
        this.flags$ext = this.flags$ext.slice(5);
      }
      ;
      if (!(this.__F & 512)) {
        this.innerHTML = "";
      }
      ;
    }
    ;
    if (true) {
      renderer.push(this);
    }
    ;
    return this;
  }
  [$65]() {
    if (true) {
      renderer.pop(this);
    }
    ;
    return this;
  }
  connectedCallback() {
    let flags = this.__F;
    let inited = flags & 1;
    let awakened = flags & 8;
    if (!inited && !(flags & 1024)) {
      hydrator.queue(this);
      return;
    }
    ;
    if (flags & (16 | 32)) {
      return;
    }
    ;
    this.__F |= 16;
    if (!inited) {
      this[$111]();
    }
    ;
    if (!(flags & 2)) {
      this.flags$ext = this.className;
      this.__F |= 2;
      this.hydrate();
      this.commit();
    }
    ;
    if (!awakened) {
      this.awaken();
      this.__F |= 8;
    }
    ;
    emit(this, "mount");
    let res = this.mount();
    if (res && res.then instanceof Function) {
      res.then(scheduler.commit);
    }
    ;
    flags = this.__F = (this.__F | 32) & ~16;
    if (flags & 64) {
      this.schedule();
    }
    ;
    if (this[$164]) {
      scheduler.schedule(this, this[$164]);
    }
    ;
    return this;
  }
  disconnectedCallback() {
    this.__F = this.__F & (~32 & ~16);
    if (this.__F & 128) {
      this.unschedule();
    }
    ;
    emit(this, "unmount");
    this.unmount();
    if (this[$164]) {
      return scheduler.unschedule(this, this[$164]);
    }
    ;
  }
};

// node_modules/imba/src/imba/dom/mount.imba
var $115 = Symbol.for("#insertInto");
var $214 = Symbol.for("#removeFrom");
function mount(mountable, into) {
  if (false) {
  }
  ;
  let parent = into || globalThis.document.body;
  let element = mountable;
  if (mountable instanceof Function) {
    let ctx = new RenderContext(parent, null);
    let tick = function() {
      let prev = renderContext.context;
      renderContext.context = ctx;
      let res = mountable(ctx);
      if (renderContext.context == ctx) {
        renderContext.context = prev;
      }
      ;
      return res;
    };
    element = tick();
    scheduler.listen("commit", tick);
  } else {
    element.__F |= 64;
  }
  ;
  element[$115](parent);
  return element;
}
function unmount(el) {
  if (el && el[$214]) {
    el[$214](el.parentNode);
  }
  ;
  return el;
}
var instance3 = globalThis.imba || (globalThis.imba = {});
instance3.mount = mount;
instance3.unmount = unmount;

// node_modules/imba/src/imba/events/keyboard.imba
function extend$__3(target, ext) {
  const descriptors = Object.getOwnPropertyDescriptors(ext);
  delete descriptors.constructor;
  Object.defineProperties(target, descriptors);
  return target;
}
function use_events_keyboard() {
  return true;
}
var Extend$KeyboardEvent$af = class {
  \u03B1esc() {
    return this.keyCode == 27;
  }
  \u03B1tab() {
    return this.keyCode == 9;
  }
  \u03B1enter() {
    return this.keyCode == 13;
  }
  \u03B1space() {
    return this.keyCode == 32;
  }
  \u03B1up() {
    return this.keyCode == 38;
  }
  \u03B1down() {
    return this.keyCode == 40;
  }
  \u03B1left() {
    return this.keyCode == 37;
  }
  \u03B1right() {
    return this.keyCode == 39;
  }
  \u03B1del() {
    return this.keyCode == 8 || this.keyCode == 46;
  }
  \u03B1key(code) {
    if (typeof code == "string") {
      return this.key == code;
    } else if (typeof code == "number") {
      return this.keyCode == code;
    }
    ;
  }
};
extend$__3(KeyboardEvent.prototype, Extend$KeyboardEvent$af.prototype);

// node_modules/imba/src/imba/events/mouse.imba
function extend$__4(target, ext) {
  const descriptors = Object.getOwnPropertyDescriptors(ext);
  delete descriptors.constructor;
  Object.defineProperties(target, descriptors);
  return target;
}
function use_events_mouse() {
  return true;
}
var Extend$MouseEvent$af = class {
  \u03B1left() {
    return this.button == 0;
  }
  \u03B1middle() {
    return this.button == 1;
  }
  \u03B1right() {
    return this.button == 2;
  }
  \u03B1shift() {
    return !!this.shiftKey;
  }
  \u03B1alt() {
    return !!this.altKey;
  }
  \u03B1ctrl() {
    return !!this.ctrlKey;
  }
  \u03B1meta() {
    return !!this.metaKey;
  }
  \u03B1mod() {
    let nav = globalThis.navigator.platform;
    return /^(Mac|iPhone|iPad|iPod)/.test(nav || "") ? !!this.metaKey : !!this.ctrlKey;
  }
};
extend$__4(MouseEvent.prototype, Extend$MouseEvent$af.prototype);

// node_modules/imba/src/imba/events/core.imba
function extend$__5(target, ext) {
  const descriptors = Object.getOwnPropertyDescriptors(ext);
  delete descriptors.constructor;
  Object.defineProperties(target, descriptors);
  return target;
}
function iter$__5(a) {
  let v;
  return a ? (v = a.toIterable) ? v.call(a) : a : a;
}
var $116 = Symbol.for("#extendType");
var $215 = Symbol.for("#modifierState");
var $39 = Symbol.for("#sharedModifierState");
var $49 = Symbol.for("#onceHandlerEnd");
var $254 = Symbol.for("#__initor__");
var $263 = Symbol.for("#__inited__");
var $56 = Symbol.for("#__hooks__");
var $66 = Symbol.for("#extendDescriptors");
var $94 = Symbol.for("#context");
var $145 = Symbol.for("#self");
var $155 = Symbol.for("#target");
var $224 = Symbol.for("#stopPropagation");
var $234 = Symbol.for("#defaultPrevented");
use_events_keyboard();
use_events_mouse();
var Extend$CustomEvent$af = class {
  [$116](kls) {
    var $89, desc, $710;
    let ext = kls[$66] || (kls[$66] = (desc = Object.getOwnPropertyDescriptors(kls.prototype), $710 = desc.constructor, delete desc.constructor, $710, desc));
    return Object.defineProperties(this, ext);
  }
};
extend$__5(CustomEvent.prototype, Extend$CustomEvent$af.prototype);
var Extend$Event$ag = class {
  get [$215]() {
    var $1110, $106;
    return ($1110 = this[$94])[$106 = this[$94].step] || ($1110[$106] = {});
  }
  get [$39]() {
    var $137, $129;
    return ($137 = this[$94].handler)[$129 = this[$94].step] || ($137[$129] = {});
  }
  [$49](cb) {
    return once(this[$94], "end", cb);
  }
  \u03B1sel(selector) {
    return !!this.target.matches(String(selector));
  }
  \u03B1closest(selector) {
    return !!this.target.closest(String(selector));
  }
  \u03B1log(...params) {
    console.info(...params);
    return true;
  }
  \u03B1trusted() {
    return !!this.isTrusted;
  }
  \u03B1if(expr) {
    return !!expr;
  }
  \u03B1wait(time = 250) {
    return new Promise(function(_0) {
      return setTimeout(_0, parseTime(time));
    });
  }
  \u03B1self() {
    return this.target == this[$94].element;
  }
  \u03B1cooldown(time = 250) {
    let o = this[$39];
    if (o.active) {
      return false;
    }
    ;
    o.active = true;
    o.target = this[$94].element;
    o.target.flags.incr("cooldown");
    this[$49](function() {
      return setTimeout(function() {
        o.target.flags.decr("cooldown");
        return o.active = false;
      }, parseTime(time));
    });
    return true;
  }
  \u03B1throttle(time = 250) {
    let o = this[$39];
    if (o.active) {
      if (o.next) {
        o.next(false);
      }
      ;
      return new Promise(function(r) {
        return o.next = function(val) {
          o.next = null;
          return r(val);
        };
      });
    }
    ;
    o.active = true;
    o.el || (o.el = this[$94].element);
    o.el.flags.incr("throttled");
    once(this[$94], "end", function() {
      let delay = parseTime(time);
      return o.interval = setInterval(function() {
        if (o.next) {
          o.next(true);
        } else {
          clearInterval(o.interval);
          o.el.flags.decr("throttled");
          o.active = false;
        }
        ;
        return;
      }, delay);
    });
    return true;
  }
  \u03B1debounce(time = 250) {
    let o = this[$39];
    let e = this;
    o.queue || (o.queue = []);
    o.queue.push(o.last = e);
    return new Promise(function(resolve) {
      return setTimeout(function() {
        if (o.last == e) {
          e.debounced = o.queue;
          o.last = null;
          o.queue = [];
          return resolve(true);
        } else {
          return resolve(false);
        }
        ;
      }, parseTime(time));
    });
  }
  \u03B1flag(name, sel) {
    const {element, step, state, id, current} = this[$94];
    let el = sel instanceof Element ? sel : sel ? element.closest(sel) : element;
    if (!el) {
      return true;
    }
    ;
    this[$94].commit = true;
    state[step] = id;
    el.flags.incr(name);
    let ts = Date.now();
    once(current, "end", function() {
      let elapsed = Date.now() - ts;
      let delay = Math.max(250 - elapsed, 0);
      return setTimeout(function() {
        return el.flags.decr(name);
      }, delay);
    });
    return true;
  }
  \u03B1busy(sel) {
    return this["\u03B1flag"]("busy", sel);
  }
  \u03B1mod(name) {
    return this["\u03B1flag"]("mod-" + name, globalThis.document.documentElement);
  }
  \u03B1outside() {
    const {handler} = this[$94];
    if (handler && handler[$145]) {
      return !handler[$145].parentNode.contains(this.target);
    }
    ;
  }
};
extend$__5(Event.prototype, Extend$Event$ag.prototype);
function use_events() {
  return true;
}
var EventHandler = class {
  constructor(params, closure) {
    this.params = params;
    this.closure = closure;
  }
  getHandlerForMethod(el, name) {
    if (!el) {
      return null;
    }
    ;
    return el[name] ? el : this.getHandlerForMethod(el.parentNode, name);
  }
  emit(name, ...params) {
    return emit(this, name, params);
  }
  on(name, ...params) {
    return listen(this, name, ...params);
  }
  once(name, ...params) {
    return once(this, name, ...params);
  }
  un(name, ...params) {
    return unlisten(this, name, ...params);
  }
  get passive\u03A6() {
    return this.params.passive;
  }
  get capture\u03A6() {
    return this.params.capture;
  }
  get silent\u03A6() {
    return this.params.silent;
  }
  get global\u03A6() {
    return this.params.global;
  }
  async handleEvent(event) {
    let element = this[$155] || event.currentTarget;
    let mods = this.params;
    let error = null;
    let silence = mods.silence || mods.silent;
    this.count || (this.count = 0);
    this.state || (this.state = {});
    let state = {
      element,
      event,
      modifiers: mods,
      handler: this,
      id: ++this.count,
      step: -1,
      state: this.state,
      commit: null,
      current: null
    };
    state.current = state;
    if (event.handle$mod) {
      if (event.handle$mod.apply(state, mods.options || []) == false) {
        return;
      }
      ;
    }
    ;
    let guard = Event[this.type + "$handle"] || Event[event.type + "$handle"] || event.handle$mod;
    if (guard && guard.apply(state, mods.options || []) == false) {
      return;
    }
    ;
    this.currentEvents || (this.currentEvents = new Set());
    this.currentEvents.add(event);
    for (let $169 = 0, $175 = Object.keys(mods), $246 = $175.length, handler, val; $169 < $246; $169++) {
      handler = $175[$169];
      val = mods[handler];
      state.step++;
      if (handler[0] == "_") {
        continue;
      }
      ;
      if (handler.indexOf("~") > 0) {
        handler = handler.split("~")[0];
      }
      ;
      let modargs = null;
      let args = [event, state];
      let res = void 0;
      let context = null;
      let m;
      let negated = false;
      let isstring = typeof handler == "string";
      if (handler[0] == "$" && handler[1] == "_" && val[0] instanceof Function) {
        handler = val[0];
        if (!handler.passive) {
          state.commit = true;
        }
        ;
        args = [event, state].concat(val.slice(1));
        context = element;
      } else if (val instanceof Array) {
        args = val.slice();
        modargs = args;
        for (let i = 0, $187 = iter$__5(args), $2112 = $187.length; i < $2112; i++) {
          let par = $187[i];
          if (typeof par == "string" && par[0] == "~" && par[1] == "$") {
            let name = par.slice(2);
            let chain = name.split(".");
            let value = state[chain.shift()] || event;
            for (let i2 = 0, $197 = iter$__5(chain), $205 = $197.length; i2 < $205; i2++) {
              let part = $197[i2];
              value = value ? value[part] : void 0;
            }
            ;
            args[i] = value;
          }
          ;
        }
        ;
      }
      ;
      if (typeof handler == "string" && (m = handler.match(/^(emit|flag|mod|moved|pin|fit|refit|map|remap|css)-(.+)$/))) {
        if (!modargs) {
          modargs = args = [];
        }
        ;
        args.unshift(m[2]);
        handler = m[1];
      }
      ;
      if (handler == "trap") {
        event[$224] = true;
        event.stopImmediatePropagation();
        event[$234] = true;
        event.preventDefault();
      } else if (handler == "stop") {
        event[$224] = true;
        event.stopImmediatePropagation();
      } else if (handler == "prevent") {
        event[$234] = true;
        event.preventDefault();
      } else if (handler == "commit") {
        state.commit = true;
      } else if (handler == "once") {
        element.removeEventListener(event.type, this);
      } else if (handler == "options" || handler == "silence" || handler == "silent") {
        continue;
      } else if (handler == "emit") {
        let name = args[0];
        let detail = args[1];
        let e = new CustomEvent(name, {bubbles: true, detail});
        e.originalEvent = event;
        let customRes = element.dispatchEvent(e);
      } else if (typeof handler == "string") {
        if (handler[0] == "!") {
          negated = true;
          handler = handler.slice(1);
        }
        ;
        let path = "\u03B1" + handler;
        let fn = event[path];
        fn || (fn = this.type && Event[this.type + "$" + handler + "$mod"]);
        fn || (fn = event[handler + "$mod"] || Event[event.type + "$" + handler] || Event[handler + "$mod"]);
        if (fn instanceof Function) {
          handler = fn;
          context = state;
          args = modargs || [];
          if (event[path]) {
            context = event;
            event[$94] = state;
          }
          ;
        } else if (handler[0] == "_") {
          handler = handler.slice(1);
          context = this.closure;
        } else {
          context = this.getHandlerForMethod(element, handler);
        }
        ;
      }
      ;
      try {
        if (handler instanceof Function) {
          res = handler.apply(context || element, args);
        } else if (context) {
          res = context[handler].apply(context, args);
        }
        ;
        if (res && res.then instanceof Function && res != scheduler.$promise) {
          if (state.commit && !silence) {
            scheduler.commit();
          }
          ;
          res = await res;
        }
        ;
      } catch (e) {
        error = e;
        break;
      }
      ;
      if (negated && res === true) {
        break;
      }
      ;
      if (!negated && res === false) {
        break;
      }
      ;
      state.value = res;
    }
    ;
    emit(state, "end", state);
    if (state.commit && !silence) {
      scheduler.commit();
    }
    ;
    this.currentEvents.delete(event);
    if (this.currentEvents.size == 0) {
      this.emit("idle");
    }
    ;
    if (error) {
      throw error;
    }
    ;
    return;
  }
};
var Extend$Element$ah2 = class {
  on$(type, mods, scope) {
    let check = "on$" + type;
    let handler;
    handler = new EventHandler(mods, scope);
    let capture = mods.capture || false;
    let passive = mods.passive;
    let o = capture;
    if (passive) {
      o = {passive, capture};
    }
    ;
    if (this[check] instanceof Function) {
      handler = this[check](mods, scope, handler, o);
    } else {
      this.addEventListener(type, handler, o);
    }
    ;
    return handler;
  }
};
extend$__5(Element.prototype, Extend$Element$ah2.prototype);

// app/components/home.imba
var $216 = Symbol.for("#beforeReconcile");
var $50 = Symbol.for("#afterReconcile");
var $57 = Symbol();
var HomeComponent = class extends Component {
  render() {
    var $120, $311, $411, $610 = this._ns_ || "", $710, $89, $97, $106, $1110, $129, $137, $147, $1510, $169, $175, $187, $197, $205, $2112, $228, $236, $246, $258, $265, $274, $284, $295, $304, $314, $325, $332, $343, $353, $363, $372, $382, $393, $40, $412, $423, $433, $444, $453, $464, $472, $482, $492;
    $120 = this;
    $120[$216]();
    ($311 = $411 = 1, $120[$57] === 1) || ($311 = $411 = 0, $120[$57] = 1);
    (!$311 || $411 & 2) && $120.flagSelf$("left home");
    $311 || ($710 = createElement("div", $120, `iframe-container ${$610}`, null));
    $311 || ($89 = createElement("iframe", $710, `${$610}`, null));
    $311 || ($89.src = "https://player.vimeo.com/video/334506441?color=ff9933");
    $311 || ($89.allow = "fullscreen");
    ;
    ;
    $311 || ($97 = createElement("p", $120, `cy-ai ${$610}`, null));
    $311 || ($106 = createElement("strong", $97, `${$610}`, "A businessman walks into the elevator for another day at work\u2026"));
    ;
    ;
    $311 || ($1110 = createElement("ul", $120, `${$610}`, null));
    $311 || ($129 = createElement("li", $1110, `${$610}`, "US Competition Winner//GLAS"));
    ;
    $311 || ($137 = createElement("li", $1110, `${$610}`, "Best Sound//Fantoche"));
    ;
    $311 || ($147 = createElement("li", $1110, `${$610}`, "Best Student Film//Animation Chico"));
    ;
    $311 || ($1510 = createElement("li", $1110, `${$610}`, "Best Student Animation//Silk Road International Film Festival"));
    ;
    $311 || ($169 = createElement("li", $1110, `${$610}`, "Winner Student Experimental Short//Los Angeles Animation Festival"));
    ;
    $311 || ($175 = createElement("li", $1110, `${$610}`, "Finalist//Black Maria Film Festival"));
    ;
    ;
    $311 || ($187 = createElement("ul", $120, `${$610}`, null));
    $311 || ($197 = createElement("li", $187, `${$610}`, "Kaboom Animation Festival//Amsterdam, Netherlands 2021"));
    ;
    $311 || ($205 = createElement("li", $187, `${$610}`, "Animatricks//Helsinki, Finland 2021"));
    ;
    $311 || ($2112 = createElement("li", $187, `${$610}`, "London International Animation Festival//London, England 2020"));
    ;
    $311 || ($228 = createElement("li", $187, `${$610}`, "GIRAF International Festival of Independent Animation//Calgary, Canada 2020"));
    ;
    $311 || ($236 = createElement("li", $187, `${$610}`, "Cardiff Animation Nights//Cardiff, Wales 2020"));
    ;
    $311 || ($246 = createElement("li", $187, `${$610}`, "San Diego Underground Film Festival//San Diego, CA 2020"));
    ;
    $311 || ($258 = createElement("li", $187, `${$610}`, "Ottawa International Animation Festival//Ottawa, Canada 2020"));
    ;
    $311 || ($265 = createElement("li", $187, `${$610}`, "Lausanne Underground Film Festival//Lausanne, Switzerland 2020"));
    ;
    $311 || ($274 = createElement("li", $187, `${$610}`, "New Chitose Airport International Animation Festival//Hokkaido, Japan 2020"));
    ;
    $311 || ($284 = createElement("li", $187, `${$610}`, "Kuandu International Animation Festival//Taipei, Taiwan 2020"));
    ;
    $311 || ($295 = createElement("li", $187, `${$610}`, "Fantoche//Baden, Switzerland 2020"));
    ;
    $311 || ($304 = createElement("li", $187, `${$610}`, "Supertoon//Sibenik, Croatia 2020"));
    ;
    $311 || ($314 = createElement("li", $187, `${$610}`, "Fluxus Animation Film Festival//Zaandam, Netherlands 2020"));
    ;
    $311 || ($325 = createElement("li", $187, `${$610}`, "Mammoth Lakes Film Festival//Mammoth Lakes, CA 2020"));
    ;
    $311 || ($332 = createElement("li", $187, `${$610}`, "Maryland Film Festival//Baltimore, MD 2020"));
    ;
    $311 || ($343 = createElement("li", $187, `${$610}`, "Animafest Zagreb//Zagreb, Croatia 2020"));
    ;
    $311 || ($353 = createElement("li", $187, `${$610}`, "Anifilm//Liberec, Czech Republic 2020"));
    ;
    $311 || ($363 = createElement("li", $187, `${$610}`, "GLAS//Berkeley, CA 2020"));
    ;
    $311 || ($372 = createElement("li", $187, `${$610}`, "Animac//Lleida, Spain 2020"));
    ;
    $311 || ($382 = createElement("li", $187, `${$610}`, "Ann Arbor Film Festival//Ann Arbor, MI 2020"));
    ;
    $311 || ($393 = createElement("li", $187, `${$610}`, "Toronto Animation Arts Festival International// Toronto, Canada 2020"));
    ;
    $311 || ($40 = createElement("li", $187, `${$610}`, "Silk Road International Film Festival//Dublin. Ireland 2020"));
    ;
    $311 || ($412 = createElement("li", $187, `${$610}`, "Los Angeles Animation Festival//Los Angeles, CA 2019"));
    ;
    $311 || ($423 = createElement("li", $187, `${$610}`, "Animateka//Ljubljana, Slovenia 2019"));
    ;
    $311 || ($433 = createElement("li", $187, `${$610}`, "Animation Marathon//Athens, Greece 2019"));
    ;
    $311 || ($444 = createElement("li", $187, `${$610}`, "Primanima//Buda\xF6rs, Hungary 2019"));
    ;
    $311 || ($453 = createElement("li", $187, `${$610}`, "P\xD6FF Shorts//Talinn, Estonia 2019"));
    ;
    $311 || ($464 = createElement("li", $187, `${$610}`, "Animation Chico//Chico, CA 2019"));
    ;
    $311 || ($472 = createElement("li", $187, `${$610}`, "YOUKI International Youth Media Festival//Wels, Austria 2019"));
    ;
    $311 || ($482 = createElement("li", $187, `${$610}`, "NewFilmmakers NY//New York, NY 2019"));
    ;
    $311 || ($492 = createElement("li", $187, `${$610}`, "Indie Short Fest//Los Angeles, CA 2019"));
    ;
    ;
    $120[$50]($411);
    return $120;
  }
};
defineTag("home", HomeComponent, {});

// app/img/bryan.png
var bryan_default = "./__assets__/bryan-U6CR2OQH.png"        ;

// img:app/img/bryan.png
var bryan_default2 = asset({
  url: bryan_default,
  type: "image",
  width: 1e3,
  height: 1085,
  toString: function() {
    return this.url;
  }
});

// app/components/about.imba
var $217 = Symbol.for("#beforeReconcile");
var $135 = Symbol.for("#placeChild");
var $323 = Symbol.for("#afterReconcile");
var $58 = Symbol();
var $125 = Symbol();
var $165 = Symbol();
var $218 = Symbol();
var $244 = Symbol();
var $273 = Symbol();
var $302 = Symbol();
var AboutComponent = class extends Component {
  render() {
    var $120, $311, $411, $610 = this._ns_ || "", $710, $97, $106, $1110, $147, $1510, $175, $187, $197, $205, $228, $236, $258, $265, $284, $295, $314;
    $120 = this;
    $120[$217]();
    ($311 = $411 = 1, $120[$58] === 1) || ($311 = $411 = 0, $120[$58] = 1);
    (!$311 || $411 & 2) && $120.flagSelf$("left about");
    $311 || ($710 = createElement("img", $120, `cw-ag ${$610}`, null));
    $311 || ($710.src = bryan_default2);
    ;
    $311 || ($97 = createElement("p", $120, `${$610}`, "Christian. Storyteller. Bryan Lee enjoys exploring the many flavors of animation and film, often delving into the surreal and absurd with sprinkles of humor. He received a BA in animation from USC in 2019. He has worked with Bento Box Entertainment, Laundry TV and directed music videos for the musician Low Hum. Currently residing in Los Angeles, he is pursuing freelance animation with the hopes of directing more projects!"));
    ;
    $311 || ($106 = createElement("ul", $120, `${$610}`, null));
    ($1110 = $120[$125]) || ($120[$125] = $1110 = createElement("li", $106, `${$610}`, null));
    $311 || $1110[$135]("Contact: ");
    $311 || ($147 = createElement("a", $1110, `link ${$610}`, "15bryan.lee@gmail.com"));
    $311 || ($147.href = "mailto:15bryan.lee@gmail.com");
    $311 || ($147.target = "_top");
    ;
    ;
    ($1510 = $120[$165]) || ($120[$165] = $1510 = createElement("li", $106, `${$610}`, null));
    $311 || $1510[$135]("Instagram: ");
    $311 || ($175 = createElement("a", $1510, `link ${$610}`, "@tagawee"));
    $311 || ($175.href = "https://www.instagram.com/tagawee");
    $311 || ($175.target = "_blank");
    ;
    ;
    ;
    $311 || ($187 = createElement("p", $120, `cw-an ${$610}`, null));
    $311 || ($197 = createElement("li", $187, `${$610}`, "Press:"));
    ;
    ($205 = $120[$218]) || ($120[$218] = $205 = createElement("li", $187, `${$610}`, null));
    $311 || $205[$135]("It's Nice That: ");
    $311 || ($228 = createElement("a", $205, `link ${$610}`, "\u201CThe delicious, the silly and the strange...\u201D"));
    $311 || ($228.href = "https://www.itsnicethat.com/articles/bryan-lee-illustration-080222");
    $311 || ($228.target = "_blank");
    ;
    ;
    ($236 = $120[$244]) || ($120[$244] = $236 = createElement("li", $187, `${$610}`, null));
    $311 || $236[$135]("Quickdraw Animation Society: ");
    $311 || ($258 = createElement("a", $236, `link ${$610}`, "Monday Shorts: Cage Match"));
    $311 || ($258.href = "https://quickdrawanimation.ca/discover/monday-shorts/cage-match");
    $311 || ($258.target = "_blank");
    ;
    ;
    ($265 = $120[$273]) || ($120[$273] = $265 = createElement("li", $187, `${$610}`, null));
    $311 || $265[$135]("Cartoon Brew: ");
    $311 || ($284 = createElement("a", $265, `link ${$610}`, "Short Pick of the Day: 'Cage Match' by Bryan Lee"));
    $311 || ($284.href = "https://www.cartoonbrew.com/cartoon-brew-pick/short-pick-of-the-day-cage-match-by-bryan-lee-196484.html");
    $311 || ($284.target = "_blank");
    ;
    ;
    ($295 = $120[$302]) || ($120[$302] = $295 = createElement("li", $187, `${$610}`, null));
    $311 || $295[$135]("Voyage LA: ");
    $311 || ($314 = createElement("a", $295, `link ${$610}`, "Check out Bryan Lee's Artwork"));
    $311 || ($314.href = "http://voyagela.com/interview/check-bryan-lees-artwork/");
    $311 || ($314.target = "_blank");
    ;
    ;
    ;
    $120[$323]($411);
    return $120;
  }
};
defineTag("about", AboutComponent, {});

// app/img/ls1.png
var ls1_default = "./__assets__/ls1-KTYTF2TD.png"        ;

// img:app/img/ls1.png
var ls1_default2 = asset({
  url: ls1_default,
  type: "image",
  width: 3e3,
  height: 1941,
  toString: function() {
    return this.url;
  }
});

// app/img/ls2.png
var ls2_default = "./__assets__/ls2-U7MF5TLT.png"        ;

// img:app/img/ls2.png
var ls2_default2 = asset({
  url: ls2_default,
  type: "image",
  width: 3e3,
  height: 1941,
  toString: function() {
    return this.url;
  }
});

// app/components/projects.imba
var $219 = Symbol.for("#beforeReconcile");
var $194 = Symbol.for("#getSlot");
var $225 = Symbol.for("#afterVisit");
var $235 = Symbol.for("#appendChild");
var $312 = Symbol.for("#afterReconcile");
var $59 = Symbol();
var $156 = Symbol();
var $255 = Symbol();
use_slots();
var ProjectsComponent = class extends Component {
  render() {
    var $120, $311, $411, $610 = this._ns_ || "", $710, $89, $97, $106, $1110, $129, $137, $147, $169, $175, $187, $205, $246, $265, $274, $284, $295;
    $120 = this;
    $120[$219]();
    ($311 = $411 = 1, $120[$59] === 1) || ($311 = $411 = 0, $120[$59] = 1);
    (!$311 || $411 & 2) && $120.flagSelf$("left projects");
    $311 || ($710 = createElement("h3", $120, `${$610}`, "STRANGE LOVE MUSIC VIDEO FOR LOW HUM"));
    ;
    $311 || ($89 = createElement("div", $120, `iframe-container ${$610}`, null));
    $311 || ($97 = createElement("iframe", $89, `${$610}`, null));
    $311 || ($97.width = "560");
    $311 || ($97.height = "315");
    $311 || ($97.src = "https://www.youtube.com/embed/1GXzFdhYds4");
    $311 || ($97.allow = "fullscreen");
    ;
    ;
    $311 || ($106 = createElement("h3", $120, `${$610}`, "IDKMLYD MUSIC VIDEO FOR LOW HUM"));
    ;
    $311 || ($1110 = createElement("div", $120, `iframe-container ${$610}`, null));
    $311 || ($129 = createElement("iframe", $1110, `${$610}`, null));
    $311 || ($129.width = "560");
    $311 || ($129.height = "315");
    $311 || ($129.src = "https://www.youtube.com/embed/V0lB-kIooOg");
    $311 || ($129.allow = "fullscreen");
    ;
    ;
    $311 || ($137 = createElement("h3", $120, `${$610}`, "LOVE SAMURAI (PERSONAL PROJECT)"));
    ;
    ($169 = $175 = 1, $147 = $120[$156]) || ($169 = $175 = 0, $120[$156] = $147 = createComponent("magnify", $120, `${$610}`, null));
    $187 = $147[$194]("__", $120);
    $169 || ($205 = createElement("img", $187, `${$610}`, null));
    $169 || ($205.src = ls1_default2);
    ;
    $169 || !$147.setup || $147.setup($175);
    $147[$225]($175);
    $169 || $120[$235]($147);
    ;
    ($265 = $274 = 1, $246 = $120[$255]) || ($265 = $274 = 0, $120[$255] = $246 = createComponent("magnify", $120, `${$610}`, null));
    $284 = $246[$194]("__", $120);
    $265 || ($295 = createElement("img", $284, `${$610}`, null));
    $265 || ($295.src = ls2_default2);
    ;
    $265 || !$246.setup || $246.setup($274);
    $246[$225]($274);
    $265 || $120[$235]($246);
    ;
    $120[$312]($411);
    return $120;
  }
};
defineTag("projects", ProjectsComponent, {});

// app/img/1.png
var __default = "./__assets__/1-HRCDLFPA.png"        ;

// img:app/img/1.png
var __default2 = asset({
  url: __default,
  type: "image",
  width: 3e3,
  height: 1936,
  toString: function() {
    return this.url;
  }
});

// app/img/2.png
var __default3 = "./__assets__/2-IOT4QXFE.png"        ;

// img:app/img/2.png
var __default4 = asset({
  url: __default3,
  type: "image",
  width: 2323,
  height: 1410,
  toString: function() {
    return this.url;
  }
});

// app/img/3.png
var __default5 = "./__assets__/3-R2QRVLLU.png"        ;

// img:app/img/3.png
var __default6 = asset({
  url: __default5,
  type: "image",
  width: 1108,
  height: 680,
  toString: function() {
    return this.url;
  }
});

// app/img/4.png
var __default7 = "./__assets__/4-ZLMRY5GA.png"        ;

// img:app/img/4.png
var __default8 = asset({
  url: __default7,
  type: "image",
  width: 3e3,
  height: 1941,
  toString: function() {
    return this.url;
  }
});

// app/img/5.png
var __default9 = "./__assets__/5-IJSP4QWL.png"        ;

// img:app/img/5.png
var __default10 = asset({
  url: __default9,
  type: "image",
  width: 3e3,
  height: 1941,
  toString: function() {
    return this.url;
  }
});

// app/img/6.png
var __default11 = "./__assets__/6-BUWFXBX4.png"        ;

// img:app/img/6.png
var __default12 = asset({
  url: __default11,
  type: "image",
  width: 3e3,
  height: 1941,
  toString: function() {
    return this.url;
  }
});

// app/components/illustrations.imba
var $220 = Symbol.for("#beforeReconcile");
var $126 = Symbol.for("#getSlot");
var $157 = Symbol.for("#afterVisit");
var $166 = Symbol.for("#appendChild");
var $522 = Symbol.for("#afterReconcile");
var $510 = Symbol();
var $86 = Symbol();
var $184 = Symbol();
var $256 = Symbol();
var $324 = Symbol();
var $392 = Symbol();
var $462 = Symbol();
use_slots();
var IllustrationsComponent = class extends Component {
  render() {
    var $120, $311, $411, $610 = this._ns_ || "", $710, $97, $106, $1110, $137, $175, $197, $205, $2112, $228, $246, $265, $274, $284, $295, $314, $332, $343, $353, $363, $382, $40, $412, $423, $433, $453, $472, $482, $492, $503;
    $120 = this;
    $120[$220]();
    ($311 = $411 = 1, $120[$510] === 1) || ($311 = $411 = 0, $120[$510] = 1);
    (!$311 || $411 & 2) && $120.flagSelf$("left");
    ($97 = $106 = 1, $710 = $120[$86]) || ($97 = $106 = 0, $120[$86] = $710 = createComponent("magnify", $120, `${$610}`, null));
    $1110 = $710[$126]("__", $120);
    $97 || ($137 = createElement("img", $1110, `${$610}`, null));
    $97 || ($137.src = __default2);
    ;
    $97 || !$710.setup || $710.setup($106);
    $710[$157]($106);
    $97 || $120[$166]($710);
    ;
    ($197 = $205 = 1, $175 = $120[$184]) || ($197 = $205 = 0, $120[$184] = $175 = createComponent("magnify", $120, `${$610}`, null));
    $2112 = $175[$126]("__", $120);
    $197 || ($228 = createElement("img", $2112, `${$610}`, null));
    $197 || ($228.src = __default4);
    ;
    $197 || !$175.setup || $175.setup($205);
    $175[$157]($205);
    $197 || $120[$166]($175);
    ;
    ($265 = $274 = 1, $246 = $120[$256]) || ($265 = $274 = 0, $120[$256] = $246 = createComponent("magnify", $120, `${$610}`, null));
    $284 = $246[$126]("__", $120);
    $265 || ($295 = createElement("img", $284, `${$610}`, null));
    $265 || ($295.src = __default6);
    ;
    $265 || !$246.setup || $246.setup($274);
    $246[$157]($274);
    $265 || $120[$166]($246);
    ;
    ($332 = $343 = 1, $314 = $120[$324]) || ($332 = $343 = 0, $120[$324] = $314 = createComponent("magnify", $120, `${$610}`, null));
    $353 = $314[$126]("__", $120);
    $332 || ($363 = createElement("img", $353, `${$610}`, null));
    $332 || ($363.src = __default8);
    ;
    $332 || !$314.setup || $314.setup($343);
    $314[$157]($343);
    $332 || $120[$166]($314);
    ;
    ($40 = $412 = 1, $382 = $120[$392]) || ($40 = $412 = 0, $120[$392] = $382 = createComponent("magnify", $120, `${$610}`, null));
    $423 = $382[$126]("__", $120);
    $40 || ($433 = createElement("img", $423, `${$610}`, null));
    $40 || ($433.src = __default10);
    ;
    $40 || !$382.setup || $382.setup($412);
    $382[$157]($412);
    $40 || $120[$166]($382);
    ;
    ($472 = $482 = 1, $453 = $120[$462]) || ($472 = $482 = 0, $120[$462] = $453 = createComponent("magnify", $120, `${$610}`, null));
    $492 = $453[$126]("__", $120);
    $472 || ($503 = createElement("img", $492, `${$610}`, null));
    $472 || ($503.src = __default12);
    ;
    $472 || !$453.setup || $453.setup($482);
    $453[$157]($482);
    $472 || $120[$166]($453);
    ;
    $120[$522]($411);
    return $120;
  }
};
defineTag("illustrations", IllustrationsComponent, {});

// app/components/goodbye.imba
var $221 = Symbol.for("#beforeReconcile");
var $95 = Symbol.for("#afterReconcile");
var $511 = Symbol();
var GoodbyeComponent = class extends Component {
  render() {
    var $120, $311, $411, $610 = this._ns_ || "", $710, $89;
    $120 = this;
    $120[$221]();
    ($311 = $411 = 1, $120[$511] === 1) || ($311 = $411 = 0, $120[$511] = 1);
    (!$311 || $411 & 2) && $120.flagSelf$("left");
    $311 || ($710 = createElement("div", $120, `cz-ag ${$610}`, null));
    $311 || ($89 = createElement("p", $710, `${$610}`, "Goodbye!"));
    ;
    ;
    $120[$95]($411);
    return $120;
  }
};
defineTag("goodbye", GoodbyeComponent, {});

// app/components/magnify.imba
var $226 = Symbol.for("#beforeReconcile");
var $158 = Symbol.for("##up");
var $195 = Symbol.for("#placeChild");
var $204 = Symbol.for("#appendChild");
var $2110 = Symbol.for("#afterReconcile");
var $512 = Symbol();
var $87 = Symbol();
var $117 = Symbol();
var $127 = Symbol();
var $167 = Symbol();
var $185 = Symbol();
use_events(), use_events_mouse();
var MagnifyComponent = class extends Component {
  get $container() {
    let el = createElement("div", null, `cu_af ${this._ns_ || ""} ref--container`, null);
    return Object.defineProperty(this, "$container", {value: el}), el;
  }
  get zoomed_in\u03A6() {
    return this.$container.style.transform !== "";
  }
  setup() {
    window.addEventListener("resize", this.zoom_out.bind(this));
    return window.addEventListener("scroll", this.zoom_out.bind(this));
  }
  zoom_out() {
    this.$container.style.transform = "";
    this.style.cursor = "zoom-in";
    return commit();
  }
  zoom_in() {
    let {x, y, width, height} = this.$container.getBoundingClientRect();
    let scale_by_height = window.innerWidth / window.innerHeight > width / height;
    let ds = scale_by_height ? window.innerHeight / height : window.innerWidth / width;
    let dx = window.innerWidth / 2 - width / 2 - x;
    let dy = window.innerHeight / 2 - height / 2 - y;
    this.$container.style.transform = "translate(" + dx + "px, " + dy + "px) scale(" + ds + ")";
    return this.style.cursor = "zoom-out";
  }
  handle_click() {
    if (this.zoomed_in\u03A6) {
      return this.zoom_out();
    } else {
      return this.zoom_in();
    }
    ;
  }
  render() {
    var self = this, $120, $311, $411, $610 = this._ns_ || "", $710, $97, $106, $137, $147, $175;
    $120 = this;
    $120[$226]();
    ($311 = $411 = 1, $120[$512] === 1) || ($311 = $411 = 0, $120[$512] = 1);
    $311 || $120.on$(`click`, {$_: [function(e, $$) {
      return self.handle_click(e);
    }]}, this);
    (!$311 || $411 & 2) && $120.flagSelf$("cu-af");
    ($97 = $106 = 1, $710 = $120[$87]) || ($97 = $106 = 0, $120[$87] = $710 = createElement("div", $120, `bg cu_af ${$610}`, null));
    $137 = self.zoomed_in\u03A6 || void 0, $137 === $120[$127] || ($106 |= 2, $120[$127] = $137);
    $106 & 2 && $710.flag$(`bg cu_af ${$610} ` + ($120[$127] ? `active` : ""));
    ;
    ($147 = $120[$167]) || ($120[$167] = ($147 = this.$container, $147[$158] = $120, $147));
    $175 = $120.__slots.__;
    $120[$185] = $147[$195]($175, 384, $120[$185]);
    ;
    $311 || $120[$204]($147);
    ;
    $120[$2110]($411);
    return $120;
  }
};
defineTag("magnify", MagnifyComponent, {});

// app/client.imba
var $118;
var $227 = getRenderContext();
var $310 = Symbol();
var $410;
var $513;
var $88;
var $96 = Symbol();
var $105;
var $119;
var $128;
var $136 = Symbol();
var $146;
var $159;
var $168;
var $174 = Symbol();
var $186;
var $196;
var $245 = Symbol();
var $257 = Symbol();
var $264 = Symbol();
var $283 = Symbol();
var $294 = Symbol();
var $352 = Symbol();
var $41 = Symbol();
var $463 = Symbol();
var $502 = Symbol();
var $542 = Symbol();
var $582 = Symbol();
var $622 = Symbol();
var $642 = Symbol();
var $652 = Symbol();
var $68 = Symbol();
var $70 = Symbol();
var $742 = Symbol();
var $77 = Symbol();
var $78;
var $79 = Symbol();
var $80;
var $81;
var $67 = Symbol.for("##up");
var $76 = Symbol.for("#afterVisit");
var $2111 = Symbol.for("#beforeReconcile");
var $303 = Symbol.for("#placeChild");
var $313 = Symbol.for("#afterReconcile");
var $443 = Symbol.for("#appendChild");
var $69 = Symbol.for("#getRenderContext");
var $732 = Symbol.for("#isRichElement");
use_events(), use_events_mouse();
var view = "YOU ARE HERE";
var views = {
  ABOUT: (($410 = $513 = 1, $118 = $227[$310]) || ($410 = $513 = 0, $118 = $227[$310] = $118 = createComponent("about", null, null, null)), $410 || ($118[$67] = $227._), $410 || $227.sym || !$118.setup || $118.setup($513), $227.sym || $118[$76]($513), $118),
  PROJECTS: (($105 = $119 = 1, $88 = $227[$96]) || ($105 = $119 = 0, $88 = $227[$96] = $88 = createComponent("projects", null, null, null)), $105 || ($88[$67] = $227._), $105 || $227.sym || !$88.setup || $88.setup($119), $227.sym || $88[$76]($119), $88),
  ILLUSTRATIONS: (($146 = $159 = 1, $128 = $227[$136]) || ($146 = $159 = 0, $128 = $227[$136] = $128 = createComponent("illustrations", null, null, null)), $146 || ($128[$67] = $227._), $146 || $227.sym || !$128.setup || $128.setup($159), $227.sym || $128[$76]($159), $128),
  "GOODBYE!": (($186 = $196 = 1, $168 = $227[$174]) || ($186 = $196 = 0, $168 = $227[$174] = $168 = createComponent("goodbye", null, null, null)), $186 || ($168[$67] = $227._), $186 || $227.sym || !$168.setup || $168.setup($196), $227.sym || $168[$76]($196), $168)
};
var quotes = {
  "YOU ARE HERE": "\u201CHellooo.\u201D -Bryan Lee",
  ABOUT: "\u201CGood vibrations\u2026\u201D -Pegasus",
  PROJECTS: "\u201CGo big or go home.\u201D -Abraham Lincoln",
  ILLUSTRATIONS: "\u201CVariety is the spice of life.\u201D -Paulette Chandler",
  "GOODBYE!": "\u201CGoodbye!\u201D -Steve Martin"
};
var Tab = class extends Component {
  render() {
    var self = this, $205, $228, $236, $274;
    $205 = this;
    $205[$2111]();
    ($228 = $236 = 1, $205[$245] === 1) || ($228 = $236 = 0, $205[$245] = 1);
    $228 || $205.on$(`click`, {$_: [function(e, $$) {
      return view = self.name;
    }]}, this);
    $274 = view == self.name || void 0, $274 === $205[$264] || ($236 |= 2, $205[$264] = $274);
    (!$228 || $236 & 2) && $205.flagSelf$("ci-aj red-hover " + ($205[$264] ? `active` : ""));
    $274 = self.name, $274 === $205[$294] && $228 || ($205[$283] = $205[$303]($205[$294] = $274, 384, $205[$283]));
    $205[$313]($236);
    return $205;
  }
};
defineTag("tab-ci-ak", Tab, {});
var AppComponent = class extends Component {
  render() {
    var $662, $325, $332, $343, $363 = this._ns_ || "", $372, $382, $393, $40, $423, $433, $453, $472, $482, $492, $51, $523, $532, $552, $562, $572, $592, $60, $61, $632, $672, $71, $722, $752, $762;
    $325 = this;
    $325[$2111]();
    ($332 = $343 = 1, $325[$352] === 1) || ($332 = $343 = 0, $325[$352] = 1);
    (!$332 || $343 & 2) && $325.flagSelf$("container");
    $332 || ($372 = createElement("div", $325, `right ${$363}`, null));
    $332 || ($382 = createElement("h1", $372, `ci-am red-hover ${$363}`, "BRYAN LEE"));
    $332 || $382.on$(`click`, {$_: [function(e, $$) {
      return view = "YOU ARE HERE";
    }]}, this);
    ;
    $332 || ($393 = createElement("ul", $372, `tabs ${$363}`, null));
    ($423 = $433 = 1, $40 = $325[$41]) || ($423 = $433 = 0, $325[$41] = $40 = createComponent(Tab, $393, `${$363}`, null));
    $423 || ($40.name = "YOU ARE HERE");
    $423 || !$40.setup || $40.setup($433);
    $40[$76]($433);
    $423 || $393[$443]($40);
    ;
    ($472 = $482 = 1, $453 = $325[$463]) || ($472 = $482 = 0, $325[$463] = $453 = createComponent(Tab, $393, `${$363}`, null));
    $472 || ($453.name = "ABOUT");
    $472 || !$453.setup || $453.setup($482);
    $453[$76]($482);
    $472 || $393[$443]($453);
    ;
    ($51 = $523 = 1, $492 = $325[$502]) || ($51 = $523 = 0, $325[$502] = $492 = createComponent(Tab, $393, `${$363}`, null));
    $51 || ($492.name = "PROJECTS");
    $51 || !$492.setup || $492.setup($523);
    $492[$76]($523);
    $51 || $393[$443]($492);
    ;
    ($552 = $562 = 1, $532 = $325[$542]) || ($552 = $562 = 0, $325[$542] = $532 = createComponent(Tab, $393, `${$363}`, null));
    $552 || ($532.name = "ILLUSTRATIONS");
    $552 || !$532.setup || $532.setup($562);
    $532[$76]($562);
    $552 || $393[$443]($532);
    ;
    ($592 = $60 = 1, $572 = $325[$582]) || ($592 = $60 = 0, $325[$582] = $572 = createComponent(Tab, $393, `${$363}`, null));
    $592 || ($572.name = "GOODBYE!");
    $592 || !$572.setup || $572.setup($60);
    $572[$76]($60);
    $592 || $393[$443]($572);
    ;
    ;
    ($61 = $325[$622]) || ($325[$622] = $61 = createElement("p", $372, `quote ${$363}`, null));
    $632 = quotes[view], $632 === $325[$652] && $332 || ($325[$642] = $61[$303]($325[$652] = $632, 384, $325[$642]));
    ;
    ;
    $662 = null;
    if (views.hasOwnProperty(view)) {
      $672 = $325[$69]($70);
      ($71 = $722 = 1, $662 = $672.run(views[view])) || ($71 = $722 = 0, $672.cache($662 = createDynamic($672.value, null, `${$363}`, null)));
      $71 || ($662[$67] = $325);
      if ($662[$732]) {
        (!$71 || $722 & 2) && $662.flags.reconcile($68, `${$363}`);
        $71 || !$662.setup || $662.setup($722);
        $662[$76]($722);
      }
      ;
    } else {
      ($752 = $762 = 1, $662 = $325[$742]) || ($752 = $762 = 0, $325[$742] = $662 = createComponent("home", null, `${$363}`, null));
      $752 || ($662[$67] = $325);
      $752 || !$662.setup || $662.setup($762);
      $662[$76]($762);
    }
    ;
    $325[$77] = $325[$303]($662, 0, $325[$77]);
    $325[$313]($343);
    return $325;
  }
};
defineTag("app", AppComponent, {});
mount((($80 = $81 = 1, $78 = $227[$79]) || ($80 = $81 = 0, $78 = $227[$79] = $78 = createComponent("app", null, null, null)), $80 || ($78[$67] = $227._), $80 || $227.sym || !$78.setup || $78.setup($81), $227.sym || $78[$76]($81), $78));
//__FOOT__
