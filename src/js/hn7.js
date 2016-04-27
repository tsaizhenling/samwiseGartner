/*global Framework7, Dom7, Template7, moment, hnapi */

(function (Framework7, $$, T7, moment, hnapi) {
    'use strict';

var sensors = [
{ title : "Humidity",
  id : "humidity",
  type : "heatmap2" 
},
{ title : "Soil Moisture",
  id : "moisture",
  type : "line" 
},
{ title : "Light",
  id : "light",
  type : "heatmap" 
},
{ title : "Ultra-Violet",
  id : "ultraviolet",
  type : "heatmap" 
},
{ title : "Temperature",
  id : "temperature",
  type : "heatmap",
},
];

var auxParams = {
    temperature : {
        colorCalibration : ['#f6faaa','#FEE08B','#FDAE61','#F46D43','#D53E4F','#9E0142'],
        data : pm25
    },
    humidity : {
        data : moistureData,
        startColor : "#ffffff",
        endColor : "steelblue"
    },
    moisture : {
        data : data1,
        startColor : "steelblue",
        endColor : "navy"
    },
    light : {
        colorCalibration : ['#272901','#4f5202','#7e8203','#c5cc06','#eef527','#f1f57a'],
        data : pm25
    },
    ultraviolet : {
        colorCalibration : ['#f6defa','#f2c5fa','#f09eff','#e466fa','#b922d4','#bd00a6'],
        data : pm25
    }
};

    // Helpers
    T7.registerHelper('time_ago', function (time) {
        return moment.unix(time).fromNow();
    });
    T7.registerHelper('array_length', function (arr) {
        return arr ? arr.length : 0;
    });
    T7.registerHelper('pluralize', function (arr, options) {
        return (arr.length === 1) ? options.hash.single : arr.length + " " + options.hash.multiple;
    });
    T7.registerHelper('notEmpty', function (value) {
        return value || 0;
    });

    var app, mainView, leftView, splitView, allowCommentsInsert;

    // Init App
    app = new Framework7({
        modalTitle: 'Gardening..',
        animateNavBackIcon: true,
        precompileTemplates: true,
        template7Pages: true,
        externalLinks: 'a.external, .message a',
        router: true
    });

    // Add Right/Main View
    mainView = app.addView('.view-main', {
        dynamicNavbar: true,
        animatePages: false,
        swipeBackPage: false,
        reloadPages: true,
        preloadPreviousPage: false
    });

    // Add Left View
    leftView = app.addView('.view-left', {
        dynamicNavbar: true
    });

    function checkSplitView() {
        var activeStoryLink;
        if ($$(window).width() < 767) {
            delete leftView.params.linksView;
            if (splitView) {
                // Need to check main view history and load same page into left view
                activeStoryLink = $$('.stories-list a.item-link.active-story');
                if (mainView.history.length > 1 && activeStoryLink.length > 0) {
                    leftView.router.load({
                        animatePages: false,
                        url: activeStoryLink.attr('href'),
                        contextName: activeStoryLink.attr('data-contextName')
                    });
                }
            }
            splitView = false;
        } else {
            if (!splitView) {
                // Need to check left view history and go back
                if (leftView.history.length === 2) {
                    leftView.router.back({
                        animatePages: false
                    });
                    activeStoryLink = $$('.stories-list a.item-link.active-story');
                    // Need to load same page in main view on the right
                    mainView.router.load({
                        url: activeStoryLink.attr('href'),
                        contextName: activeStoryLink.attr('data-contextName')
                    });
                }
            }
            splitView = true;
            leftView.params.linksView = '.view-main';
        }
    }
    $$(window).resize(checkSplitView);
    checkSplitView();

    // Add active class for left view links and close panel
    $$(document).on('click', '.view-left .stories-list a.item-link', function (e) {
        $$('.stories-list a.item-link.active-story').removeClass('active-story');
        $$(this).addClass('active-story');
        if (splitView) {
            app.closePanel();
        }
    }, true);
    // Fetch Stories
    function getPlantData(refresh) {
        //app.showPreloader('Loading plant data..');
        app.pullToRefreshDone();
        $$('.refresh-link.refresh-home').removeClass('refreshing');
        app.template7Data.stories = sensors;
        $$('.page[data-page="index"] .page-content .list-block').html(T7.templates.storiesTemplate(sensors));
        return sensors;
    }

    $$(".panel.panel-right").html(T7.templates.userTemplate({}));

    // Update stories on PTR
    $$('.pull-to-refresh-content').on('refresh', function () {
        $$('.refresh-link.refresh-home').addClass('refreshing');
        getPlantData(true);
    });
    $$('.refresh-link.refresh-home').on('click', function () {
        var clicked = $$(this);
        if (clicked.hasClass('refreshing')) {
            return;
        }
        clicked.addClass('refreshing');
        getPlantData(true);
    });

    app.onPageInit('item', function (page) {
        var width = $$(window).width();
        var data = auxParams[page.query.id].data
        if (page.query.type == "line") {
            drawLineGraph(data,"chart",width);
        } else if (page.query.type == "heatmap") {
            drawHeatMap(data,"chart",auxParams[page.query.id].colorCalibration,width);
        } else if (page.query.type == "heatmap2") {
            drawHeatMap2(data,"chart",auxParams[page.query.id].startColor,auxParams[page.query.id].endColor,width);
        }
    });
    app.onPageAfterAnimation('item', function (page) {
    });
    app.onPageBack('item', function () {
        allowCommentsInsert = false;
    });
    $$(document).on('click', '.message a', function (e) {
        e.preventDefault();
        window.open($$(this).attr('href'));
    });
    // Get and parse stories on app load
    getPlantData(true);

    // Export app to global
    window.app = app;

}(Framework7, Dom7, Template7, moment, hnapi));