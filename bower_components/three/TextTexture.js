(function(a, b) { "object" == typeof exports && "undefined" != typeof module ? module.exports = b(require("three")) : "function" == typeof define && define.amd ? define(["three"], b) : (a.THREE = a.THREE || {}, a.THREE.TextTexture = b(a.THREE)) })(this, function(a) { "use strict";

    function b() { return document.createElement("canvas") }

    function c(a) { return a === void 0 }

    function d(a, b, c, d, e) { return [a, b, c, d + "px", e].join(" ") }

    function e(a) { return a ? a.split("\n") : [] }

    function f(a) { return a.reduce(function(a, b) { return Math.max(a, b) }) }

    function g(a, c) { if (a.length) { var d = b().getContext("2d"); return d.font = c, f(a.map(function(a) { return d.measureText(a).width })) } return 0 } var h = function(f) {
        function h(c) { void 0 === c && (c = {}); var d = c.autoRedraw;
            void 0 === d && (d = !0); var e = c.text;
            void 0 === e && (e = ""); var g = c.textAlign;
            void 0 === g && (g = "center"); var h = c.textLineHeight;
            void 0 === h && (h = 1.15); var i = c.fontFamily;
            void 0 === i && (i = "sans-serif"); var j = c.fontSize;
            void 0 === j && (j = 16); var k = c.fontWeight;
            void 0 === k && (k = "normal"); var l = c.fontVariant;
            void 0 === l && (l = "normal"); var m = c.fontStyle;
            void 0 === m && (m = "normal"); var n = c.fillStyle;
            void 0 === n && (n = "white"); var o = c.lineWidth;
            void 0 === o && (o = 0); var p = c.strokeStyle;
            void 0 === p && (p = "black"); var q = c.padding;
            void 0 === q && (q = .25); var r = c.magFilter;
            void 0 === r && (r = a.LinearFilter); var s = c.minFilter;
            void 0 === s && (s = a.LinearFilter); var t = c.mapping,
                u = c.wrapS,
                v = c.wrapT,
                w = c.format,
                x = c.type,
                y = c.anisotropy;
            f.call(this, b(), t, u, v, r, s, w, x, y), this.autoRedraw = d, this._text = e, this._textAlign = g, this._textLineHeight = h, this._fontFamily = i, this._fontSize = j, this._fontWeight = k, this._fontVariant = l, this._fontStyle = m, this._fillStyle = n, this._lineWidth = o, this._strokeStyle = p, this._padding = q, this.redraw() } f && (h.__proto__ = f), h.prototype = Object.create(f && f.prototype), h.prototype.constructor = h; var i = { text: { configurable: !0 }, textAlign: { configurable: !0 }, textLines: { configurable: !0 }, textLineHeight: { configurable: !0 }, textLineHeightInPixels: { configurable: !0 }, fontFamily: { configurable: !0 }, fontSize: { configurable: !0 }, fontWeight: { configurable: !0 }, fontVariant: { configurable: !0 }, fontStyle: { configurable: !0 }, font: { configurable: !0 }, fillStyle: { configurable: !0 }, lineWidth: { configurable: !0 }, lineWidthInPixels: { configurable: !0 }, strokeStyle: { configurable: !0 }, textWidthInPixels: { configurable: !0 }, textHeight: { configurable: !0 }, textHeightInPixels: { configurable: !0 }, padding: { configurable: !0 }, paddingInPixels: { configurable: !0 }, imageWidthInPixels: { configurable: !0 }, imageHeight: { configurable: !0 }, imageHeightInPixels: { configurable: !0 }, imageAspect: { configurable: !0 } }; return h.prototype.redraw = function() { var a = this,
                b = this.image.getContext("2d"); if (b.clearRect(0, 0, b.canvas.width, b.canvas.height), this.textWidthInPixels && this.textHeightInPixels) { b.canvas.width = this.imageWidthInPixels, b.canvas.height = this.imageHeightInPixels, b.font = this.font, b.textBaseline = "middle"; var c; switch (this.textAlign) {
                    case "left":
                        b.textAlign = "left", c = this.paddingInPixels + this.lineWidthInPixels / 2; break;
                    case "right":
                        b.textAlign = "right", c = this.paddingInPixels + this.lineWidthInPixels / 2 + this.textWidthInPixels; break;
                    case "center":
                        b.textAlign = "center", c = this.paddingInPixels + this.lineWidthInPixels / 4 + this.textWidthInPixels / 2; } var d = this.paddingInPixels + this.lineWidthInPixels / 2 + this.fontSize / 2;
                b.fillStyle = this.fillStyle, b.miterLimit = 1, b.lineWidth = this.lineWidthInPixels, b.strokeStyle = this.strokeStyle, this.textLines.forEach(function(e) { a.lineWidth && b.strokeText(e, c, d), b.fillText(e, c, d), d += a.textLineHeightInPixels }) } else b.canvas.width = b.canvas.height = 1;
            this.needsUpdate = !0 }, h.prototype._redrawIfAuto = function() { this.autoRedraw && this.redraw() }, i.text.get = function() { return this._text }, i.text.set = function(a) { this._text !== a && (this._text = a, this._textLines = void 0, this._textWidthInPixels = void 0, this._redrawIfAuto()) }, i.textAlign.get = function() { return this._textAlign }, i.textAlign.set = function(a) { this._textAlign !== a && (this._textAlign = a, this._redrawIfAuto()) }, i.textLines.get = function() { return c(this._textLines) && (this._textLines = e(this.text)), this._textLines }, i.textLineHeight.get = function() { return this._textLineHeight }, i.textLineHeight.set = function(a) { this._textLineHeight !== a && (this._textLineHeight = a, this._redrawIfAuto()) }, i.textLineHeightInPixels.get = function() { return this.fontSize * this.textLineHeight }, i.fontFamily.get = function() { return this._fontFamily }, i.fontFamily.set = function(a) { this._fontFamily !== a && (this._fontFamily = a, this._textWidthInPixels = void 0, this._redrawIfAuto()) }, i.fontSize.get = function() { return this._fontSize }, i.fontSize.set = function(a) { this._fontSize !== a && (this._fontSize = a, this._textWidthInPixels = void 0, this._redrawIfAuto()) }, i.fontWeight.get = function() { return this._fontWeight }, i.fontWeight.set = function(a) { this._fontWeight !== a && (this._fontWeight = a, this._textWidthInPixels = void 0, this._redrawIfAuto()) }, i.fontVariant.get = function() { return this._fontVariant }, i.fontVariant.set = function(a) { this._fontVariant !== a && (this._fontVariant = a, this._textWidthInPixels = void 0, this._redrawIfAuto()) }, i.fontStyle.get = function() { return this._fontStyle }, i.fontStyle.set = function(a) { this._fontStyle !== a && (this._fontStyle = a, this._textWidthInPixels = void 0, this._redrawIfAuto()) }, i.font.get = function() { return d(this.fontStyle, this.fontVariant, this.fontWeight, this.fontSize, this.fontFamily) }, i.fillStyle.get = function() { return this._fillStyle }, i.fillStyle.set = function(a) { this._fillStyle !== a && (this._fillStyle = a, this._redrawIfAuto()) }, i.lineWidth.get = function() { return this._lineWidth }, i.lineWidth.set = function(a) { this._lineWidth !== a && (this._lineWidth = a, this._redrawIfAuto()) }, i.lineWidthInPixels.get = function() { return this._lineWidth * this.fontSize }, i.strokeStyle.get = function() { return this._strokeStyle }, i.strokeStyle.set = function(a) { this._strokeStyle !== a && (this._strokeStyle = a, this._redrawIfAuto()) }, i.textWidthInPixels.get = function() { return c(this._textWidthInPixels) && (this._textWidthInPixels = g(this.textLines, this.font)), this._textWidthInPixels }, i.textHeight.get = function() { return this.textLineHeight * (this.textLines.length - 1) + 1 }, i.textHeightInPixels.get = function() { return this.textHeight * this.fontSize }, i.padding.get = function() { return this._padding }, i.padding.set = function(a) { this._padding !== a && (this._padding = a, this._redrawIfAuto()) }, i.paddingInPixels.get = function() { return this.padding * this.fontSize }, i.imageWidthInPixels.get = function() { return this.textWidthInPixels + this.lineWidthInPixels + 2 * this.paddingInPixels }, i.imageHeight.get = function() { return this.textHeight + this.lineWidth + 2 * this.padding }, i.imageHeightInPixels.get = function() { return this.imageHeight * this.fontSize }, i.imageAspect.get = function() { return this.image.width && this.image.height ? this.image.width / this.image.height : 1 }, Object.defineProperties(h.prototype, i), h }(a.Texture); return h });