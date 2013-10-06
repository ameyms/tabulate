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
            this.$tableBody = this.$el.find('tbody');

            if(!this.$tableBody) {
                this.$el.find('thead').after('<tbody></tbody>');
                this.$tableBody = this.$el.find('tbody');
            }
        },

        initHandlers: function () {
            this.$el.on('load', $.proxy(this.fetch, this));
        },

        fetch: function () {
            this.cols = this.$el.find('thead th').length;

            var dfd = this.options.source();
            dfd.done($.proxy(this.afterFetch, this))
            .fail($.proxy(this.loadFailure, this));
        },

        afterFetch: function () {

            this.dataSet = this.options.transpose.apply(this, arguments);
            this.renderRows();
        },

        loadFailure: function () {
            this.$el.trigger('loadfailure', arguments);
        },

        renderRows: function () {

            var self = this;
            this.$tableBody.html('');

            $.each(this.dataSet.items, function (row, item) {
                
                var $tr = $('<tr>');

                for(var i = 0; i < self.cols; i++) {
                    var cellDom = self.options.renderer(row, i, item, self.dataSet),
                        klasses = self.options.cellClass(row, i, item, self.dataSet),
                        cellAttrs = self.options.cellMeta(row, i, item, self.dataSet),
                        $cell = $('<td>');

                    $cell.html(cellDom).addClass(klasses).data(cellAttrs);
                    $tr.append($cell);
                }

                self.$tableBody.append($tr);
                
            });

            this.$el.trigger('render');
        },

        getDefaults: function () {
            return Tabulator.DEFAULTS;
        },

        getOptions: function (options) {
            var klass; 

            options = $.extend({}, this.getDefaults(), this.$el.data(), options);
            if(! $.isFunction(options.cellClass)) {
                klass = options.cellClass;
                options.cellClass = function () {
                    return klass;
                };
            }
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