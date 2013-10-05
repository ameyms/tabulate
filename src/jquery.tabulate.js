/*
* jquery.tabulate.js by @ameyms
* The MIT License (MIT)
* http://ameyms.github.com/tabulate
*
* Copyright (c) 2013 Amey Sakhadeo
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in
* all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
* THE SOFTWARE.
*/

if (!jQuery) { throw new Error("Tabulate requires jQuery"); }

(function($, window){


    /* Helper functions */
    var escapeHtml = function (str) {
        $('<div/>').text(str).html(); 
    };

    /* Defaults */
    var noSrc = function () {
        var dfd = new $.Deferred(),
            dummy = {
                        items: [],
                        total: 0,
                        page: 1
        };

        dfd.resolve(dummy);
        return dfd;
    };

    var noop = function (arg) {
        return arg;
    };

    var defaultRenderer = function (row, col, item) {

        return escapeHtml(item+'');
    };


    var Tabulator = function (el) {

        this.$el = el;
    };

    Tabulator.DEFAULTS = {

        source: noSrc,
        renderer: defaultRenderer,
        cellClass: 'item-cell',
        cellMeta: $.noop,
        transpose: noop,
        pageI18n: noop

    };

    Tabulator.prototype = {

        init: function (options) {
            this.options = this.getOptions(options);
            this.initHandlers();
        },

        initHandlers: function () {
            this.$el.on('load', $.proxy(this.fetch, this));
        },

        fetch: function () {
            this.cols = this.$el.find('thead th').length;

            var dfd = this.options.source();
            dfd.done($.proxy(this.renderRows, this));
        },

        renderRows: function () {
            //TODO
        },

        getDefaults: function () {
            return Tabulator.DEFAULTS;
        },

        getOptions: function (options) {
            options = $.extend({}, this.getDefaults(), this.$el.data(), options);
            return options;
        }

    };

    $.fn.extend({

        'tabulate': function (options) {
            this.each(function () {

                var tabl = new Tabulator($(this));
                tabl.init(options);

            });
        }
    });

})(jQuery, window);