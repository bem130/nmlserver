class NMLc {
    constructor (text="") {
        this.text = text.replace(/\r\n/g,"\n");
        this.parse = this.P_parse(text);
    }
    P_parse(text) {
        let t = text;
        let i = 0;
        let ret = [];
        let nstxt = "";
        while (t.length>i) {
            if (t[i-1]!="\\"&&(t[i]=="#"||(t[i]=="{"&&t[i+1]=="{"))) { // structure
                if (nstxt.length>0) {
                    let child = this.P_block(nstxt);
                    for (let chd of child) {
                        ret.push(chd);
                    }
                    nstxt = "";
                }
                if (t[i]=="#") { // title
                    let size = -1;
                    i++;
                    if (t[i]==" ") {i++;}
                    else {
                        size = ["1","2","3","4"].indexOf(t[i])+1;
                        i++;
                        if (t[i]==" ") {i++;}
                    }
                    let content = "";
                    while (t[i]!="\n"&&t.length>i) {
                        content += t[i];
                        i++;
                    }
                    if (size==-1) {
                        ret.push({type:"dtitle",text:content});
                    }
                    else {
                        ret.push({type:"title",size:size,text:content});
                    }
                }
                else if (t[i]=="{"&&t[i+1]=="{") { // block
                    i+=2;
                    let type = "";
                    while (t[i]!="\n"&&t.length>i) {
                        type += t[i];
                        i++;
                    }
                    i++;
                    let content = "";
                    while (t.length>i) {
                        if (t[i]=="\n"&&t[i+1]=="}"&&t[i+2]=="}") {i+=3;break;}
                        i++;
                        content += t[i-1];
                        if (t[i]=="\n"&&t[i+1]=="\\"&&t[i+2]=="}"&&t[i+3]=="}") {
                            i+=2;
                            content += "\n";
                        }
                    }
                    if (type.startsWith("embed:")) {
                        ret.push({type:"embed",text:type.slice(6),content:content});
                    }
                    else if (type.startsWith("code:")) {
                        ret.push({type:"cblock",text:type.slice(5),content:content});
                    }
                }
            }
            else {
                i++;
                if (t[i-1]=="\\"&&(t[i]=="#"||(t[i]=="{"&&t[i+1]=="{"))) {
                    i++;
                }
                i--;
                if (!(t[i]=="#"||(t[i]=="{"&&t[i+1]=="{"))) {
                    nstxt+=t[i];
                }
                i++;
            }
        }
        if (nstxt.length>0) {
            let child = this.P_block(nstxt);
            for (let chd of child) {
                ret.push(chd);
            }
            nstxt = "";
        }
        return ret;
    }
    P_block(block) {
        if (block[0]=="\n") {
            block = block.slice(1);
        }
        if (block[block.length-1]=="\n") {
            block = block.slice(0,block.length-1);
        }
        let i = 0;
        let t = block;
        let nstxt = "";
        let cblk = [];
        let tag = "";
        while (t.length>i) {
            if ((t[i]=="{")) { // structure
                if (nstxt.length>0) {
                    cblk.push({type:"text",child:[nstxt]});
                    nstxt = "";
                }
                i++;
                while (t.length>i) {
                    if (t[i]==":") {
                        console.log(tag)
                        break;
                    }
                    tag+=t[i];
                    i++;
                }
                let child = [];
                let ctxt = "";
                i++;
                while (t.length>i) {
                    if (t[i]=="}") {
                        child.push(ctxt);
                        cblk.push({type:tag,child:child})
                        break;
                    }
                    else if (t[i]==";") {
                        child.push(ctxt);
                        i++;
                        ctxt = "";
                    }
                    ctxt+=t[i];
                    i++;
                }
            }
            else {
                nstxt+=t[i];
            }
            tag = "";
            i++;
        }
        if (nstxt.length>0) {
            cblk.push({type:"text",child:[nstxt]});
            nstxt = "";
        }
        return cblk;
    }
    getHTMLtext() {
        let ret = "";
        let t = this.parse;
        for (let cnt=0;cnt<t.length;cnt++) {
            switch (t[cnt].type) {
                case "text":
                    ret+=`<span>${t[cnt].child[0]}</span>`;
                break;
                case "alias":
                    ret+=`<span title="${t[cnt].child.join(",")}">${t[cnt].child[0]}</span>`;
                break;
                case "url":
                    if (t[cnt].child.length>1) {
                        ret+=`<a href="${t[cnt].child[1]}">${t[cnt].child[0]}</a>`;
                    }
                    else {
                        ret+=`<a href="${t[cnt].child[0]}">${t[cnt].child[0]}</a>`;
                    }
                break;
                case "code":
                    ret+=`<code>${t[cnt].child[0]}</code>`;
                break;
                case "dtitle":
                    ret+=`<h1>${t[cnt].text}</h1>`;
                break;
                case "title":
                    ret+=`<h${1+t[cnt].size}>${t[cnt].text}</h${1+t[cnt].size}>`;
                break;
                case "cblock":
                    ret+=`<pre><code class="${t[cnt].text}">${t[cnt].content}</code></pre>`;
                break;
                case "image":
                    ret+=`<img src="${t[cnt].child[0]}"></img>`;
                break;
                case "embed":
                break;
            }
        }
        return `<div class="nml">${ret}</div>`;
    }
}
exports.NMLc = NMLc;