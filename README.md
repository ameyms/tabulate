Tabulate
========

A jquery plugin for working with paginated tables with emphasis on [Bootstrap](http://getbootstrap.com "Twitter Bootstrap")

__WARNING: This is currently only a stub and not ready for use__


Final API Goal:

```javascript

$('#mytable').tabulate({
    
    // Function that returns a jquery deferred
    source: xhrSource,
    
    //A Function that accepts row, column and cell item and returns tds content as html
    renderer: renderer,

    // String or Function that accepts row, column and cell item and returns class string
    cellClass: foo, 

    // String or Function that accepts row, column and cell item 
    // and returns an object that is set as $.data() for the td
    cellMeta: bar,

    pagination: $('#mypagination') //Bootstrap 'pagination' control
});

```




License
------
This library is available under the [MIT license](https://github.com/ameyms/tabulate/blob/master/LICENSE "License")
