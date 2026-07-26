const dns = require("dns");

console.log("Start");

dns.resolveSrv("_mongodb._tcp.cluster0.yyenbmv.mongodb.net", (err, records) => {
    console.log("Callback");

    if (err) {
        console.error(err);
    } else {
        console.log(records);
    }
});