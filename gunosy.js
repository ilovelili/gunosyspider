var casper = require('casper').create({
    verbose: true,
    logLevel: "debug"
}), config = require('./config.json').gunosy,
    options = casper.cli.options,
    loading = false,
    filename = (options['name'] === undefined ? 'gunosy' + new Date().toLocaleDateString() + '.csv' : options['name'] + '.csv'),
    fromDate = options['from'],
    toDate = options['to'];

var getFormatedToday = function () {
    return new Date().toISOString().slice(0, 10).replace(/-/g, "/");
};

var resloveDownloadUrl = function () {
    var today = new Date();
    var urlTemplate = 'https://ads.gunosy.com/media/reports?utf8=✓&date_range=custom&span_from={{begin}}&span_to={{end}}&type=csv&commit=CSVダウンロード',
        start = fromDate || getFormatedToday(),
        end = toDate || getFormatedToday();

    return urlTemplate.replace(/{{begin}}/g, start).replace(/{{end}}/g, end);
};

casper.start();
casper.userAgent(config.userAgent);

//ページ起動のため、実行処理を配列化
var steps = [
    function () {
        console.log('Opening login page');
        casper.open(config.loginPage);
    },
    //ログイン
    function () {
        console.log('Login');
        casper.evaluate(function (username, password) {
            var form = document.forms[0];
            form.elements['client[email]'].value = username;
            form.elements['client[password]'].value = password;
            // submit
            form.elements['commit'].click();
        }, config.username, config.password);
    },
    // ダウンロードpage
    function () {
        console.log('download');
        var downloadUrl = resloveDownloadUrl();
        casper.download(downloadUrl, filename);
    },
    function () {
        console.log('Ending casper');
        casper.exit();
    }
];

//ページが起動中かどうか
casper.on('load.started', function () {
    loading = true;
    console.log('load started');
});

//ページが起動完了かどうか。完了じゃないと次のアクションを行わない
casper.on('load.finished', function () {
    loading = false;
    console.log('load started');
});

var index = 0;

setInterval(function () {
    //ページ起動が完了になったら次の処理
    if (!loading && typeof steps[index] == 'function') {
        console.log('step ' + (index + 1));
        steps[index]();
        index++;
    }

    if (index == steps.length) {
        console.log('Finished at ' + index);
        casper.run();
    }
}, 100);