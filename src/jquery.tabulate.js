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

    var nothing,

    /* Helper functions */
    escapeHtml = function (str) {
        $('<div/>').text(str).html(); 
    },

    /* Defaults */
    noSrc = function () {
        var dfd = new $.Deferred(),
            dummy = {
                        items: [],
                        total: 0,
                        page: 1
        };

        dfd.resolve(dummy);
        return dfd;
    },

    noop = function (arg) {
        return arg;
    },

    defaultRenderer = function (row, col, item) {

        return escapeHtml(item+'');
    },

    goToPage = function (event) {

        if($(this).hasClass('disabled')) {
            return;
        }

        var pg = $(this).data('page'),
            self = event.data.tabulator;

        self.$el.trigger('pagechange', {page: pg, __self__: true});
        self.moveTo(pg);
    },

    initPager = function () {

        var nextStr = this.options.pagesI18n('next') || 'Next',
            prevStr = this.options.pagesI18n('prev') || 'Previous',
            dom;

        dom = '<li data-page="next"><a href="#">'+nextStr+'</a></li>';
        dom += '<li data-page="prev"><a href="#">'+prevStr+'</a></li>';

        this.$paging.html(dom);

    },


    initPagination = function () {

        var firstStr = this.options.pagesI18n('first') || 'First',
            lastStr = this.options.pagesI18n('last') || 'Last',
            dom;

        dom = '<li data-page="first"><a href="#">'+firstStr+'</a></li>';
        dom += '<li data-page="last"><a href="#">'+lastStr+'</a></li>';

        this.$paging.html(dom);

    },

    //TODO: Combine following two functions into one
    adjustPager = function () {
        var currpage = this.dataSet.currPage, 
            totalpages = this.dataSet.totalPages,
            next = this.dataSet.next,
            prev = this.dataSet.prev;

        if(next || prev) {
            this.enablePage('next', !!next);
            this.enablePage('prev', !!prev);
        }
        else if(currpage && totalpages) {
            this.enablePage('next', (currpage < totalpages));
            this.enablePage('prev', (currpage > 1));
        }
    };

    adjustPagination = function () {
        var currPage = this.dataSet.currPage, 
            totalPages = this.dataSet.totalPages;

        if(currPage && totalPages) {
            this.enablePage('last', (currPage < totalPages));
            this.enablePage('first', (currPage > 1));
            this.enablePage(currPage, false);
        }
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
        pagesI18n: $.noop

    };

    Tabulator.prototype = {

        init: function (options) {
            this.options = this.getOptions(options);

            this.$tableBody = this.$el.find('tbody');

            if(!this.$tableBody) {
                this.$el.find('thead').after('<tbody></tbody>');
                this.$tableBody = this.$el.find('tbody');
            }

            this.$paging = this.options.pagination || this.options.pager;
            if(this.$paging) {
                this.initPaging();
            }
            this.initHandlers();
        },

        initHandlers: function () {

            var self = this,
                opts = {
                            options:{page: 1}
                        };

            this.$el.on('load', opts, $.proxy(this.fetch, this));

            if(this.$paging) {
                this.$paging.on('click', 'li',  {tabulator: this}, goToPage);
                this.$el.on('pagechange', function (e) {
                    var pg = e.data.page;
                    if(e.data.__self__ === true) {
                        return;
                    } else {
                        self.moveTo(pg);
                    }
                });
            }
        },

        fetch: function (config) {
            this.cols = this.$el.find('thead th').length;

            var dfd = this.options.source(config.data.options);
            dfd.done($.proxy(this.afterFetch, this))
            .fail($.proxy(this.loadFailure, this));
        },

        afterFetch: function () {

            this.dataSet = this.options.transpose.apply(this, arguments);
            this.renderRows();
            this.renderPageButtons();
            if(this.$paging) {
                this.adjustPaging();
            }
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

        renderPageButtons: function () {

            var start, end, i, currPage, totalPages,
                pgs = [],
                pgDom = '';

            if(this.options.pagination) {
                this.$paging.find('li[data-page-type="actual"]').remove();
                
                currPage = this.dataSet.currPage;
                totalPages = this.dataSet.totalPages;
                start = Math.max(1, currPage - 2);
                end = Math.min(currPage + 2, totalPages);

                for(i = start; i <= end; i++) {
                    pgDom += '<li data-page="'+i+'" data-page-type="actual">';
                    pgDom += '<a href="#">'+i+'</a></li>';

                }
                this.$paging.find('li[data-page="first"]').after(pgDom);
            }
        },

        moveTo: function (pg) {

            this.fetch({
                    options: {
                        page: pg,
                        next: this.dataSet.next
                    }
                });

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
        },

        initPaging: function () {
            if(this.options.pager) {
                initPager.call(this);
            } else {
                initPagination.call(this);
            }
        },


        adjustPaging: function () {

            if(this.options.pager) {
                adjustPager.call(this);
            }
            else if(this.options.pagination) {
                adjustPagination.call(this);
            }
        },

        enablePage: function (pg, enable) {
            var $pg = this.$paging.find('li[data-page="'+pg+'"]');
            if(typeof enable === 'undefined' || enable) {
                $pg.removeClass('disabled');
            } else {
                $pg.addClass('disabled');
            }
        }

    };

    $.fn.extend({

        'tabulate': function (options) {
            this.each(function () {

                var tabl = new Tabulator($(this));
                tabl.init(options);

            });
            return $(this);
        }
    });

})(jQuery, window);