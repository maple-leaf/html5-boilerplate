require.config({
    baseUrl: 'js',
    urlArgs: "bust=" +  (new Date()).getTime(), // cachebreaker
    paths: {
        modules: 'modules',
        vendor: 'vendor',
        jquery: 'vendor/jquery.1.11.1.min'
    },
    shim: {
        //'vendor/jquery.bxslider.min': ['jquery'],
    }
});

require(['jquery'], function($) {
    $(function() {
    });
});

