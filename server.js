// bem130

const http = require("http");
const fs = require('fs');
const url = require('url');
const port = 80;
const server = http.createServer(server_request);
server.listen(port);
var NML = require('./nml.js');

nml = {};
nml.html = (new TextDecoder("utf-8")).decode(new Uint8Array(fs.readFileSync("./nml.html")));
nml.css = (new TextDecoder("utf-8")).decode(new Uint8Array(fs.readFileSync("./nml.css")));
nml.paleblue = (new TextDecoder("utf-8")).decode(new Uint8Array(fs.readFileSync("./nml.paleblue.css")));

let mime = {
    "txt":"text/plain; charset=UTF-8",
    "nml":"text/nml; charset=UTF-8",
    "html":"text/html; charset=UTF-8",
    "css":"text/css; charset=UTF-8",
    "nml":"text/neknajml; charset=UTF-8",
    "js":"text/javascript",
    "png":"image/png",
    "jpg":"image/jpeg",
    "jpeg":"image/jpeg",
    "gif":"image/gif",
};

function NmlRes(data,mode="html") {
    switch (mode) {
        case "html":
            let rt = new NML.NMLc((new TextDecoder("utf-8")).decode(new Uint8Array(data)));
            let tnml = rt.getHTMLtext();
            let html = nml.html.replace("[nmlbody]",tnml).replace("/*nmlstyle*/",nml.css).replace("/*nmltheme*/",nml.paleblue);
            return [html,mime.html];
        break;
        case "nml":
            return [data,mime.nml];
        break;
        case "txt":
            return [data,mime.txt];
        break;
    }
}

function server_request(req, response) {
    let head = {code:200,type:"text/plain; charset=UTF-8",filetype:"txt"};
    let res = "";

    //
    // transfer
    //
        let reqparse = url.parse(req.url);
        switch (reqparse.pathname) {
            case "/404":
            case "/404.nml":
                head.code = 404;
            break;
            case "/": // top page
                reqparse.pathname = "/index.nml";
            break;
        }
    //
    // end
    //

    //
    // get file
    //
        if (fs.existsSync("data"+reqparse.pathname)) {
            res = fs.readFileSync("data"+reqparse.pathname);
        }
        else if (fs.existsSync("data"+reqparse.pathname+".nml")) {
            res = fs.readFileSync("data"+reqparse.pathname+".nml");
            reqparse.pathname += ".nml";
        }
        else {
            res = fs.readFileSync("data/404.nml");
            reqparse.pathname += ".nml";
            head.code = 404;
        }
    //
    // end
    //

    //
    // set MIME
    //
        let fnsplit = reqparse.pathname.split(".");
        head.filetype = fnsplit[fnsplit.length-1];
        if (mime[head.filetype]!=null) {
            head.type = mime[head.filetype];
        }
    //
    // end
    //

    //
    // NML
    //
    if (head.filetype=="nml") {
        console.log("nml")
        let nml_ = NmlRes(res);
        res = nml_[0]; head.type = nml_[1];
    }
    //
    // end
    //

    //
    // response
    //
        response.writeHead(head.code, {"Content-Type": head.type});
        response.end(res);
    //
    // end
    //

    //
    // push log
    //
        console.log(`\x1b[33m${(new Date()).toString()}\x1b[39m  requrl: \x1b[34m${req.url}\x1b[39m path: \x1b[34m${reqparse.path}\x1b[39m response: \x1b[36m${head.code}\x1b[39m res: \x1b[35m${reqparse.pathname}\x1b[39m`);
    //
    // end
    //
}

console.log(`The server has started: ${port}`);