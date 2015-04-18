﻿

/*
* @author electricessence / https://github.com/electricessence/
* Liscensing: MIT https://github.com/electricessence/TypeScript.NET/blob/master/LICENSE
*/
//system.text license above

module nSystem.Text {
    export function format(source: string, ...args: any[]) {
        for (var i = 0; i < args.length; i++)
            source = source.replace("{" + i + "}", args[i]);
        return source;
    }
}

export module stringFormatting {
    export function IsNullOrEmpty(str: string): boolean {
        return str == null || typeof str === 'undefined' || str === '';
    }
    export function Format(source: string, ...args: any[]) {
        for (var i = 0; i < args.length; i++)
            source = source.replace("{" + i + "}", args[i]);
        return source;
    }
    export var Empty = "";
}

export module EnumHelper {
    export function HasFlag(flags: number, checkFlag: number): boolean {
        return (flags & checkFlag) == checkFlag;
    }
    export function ToString(enumObj: any, checkFlag: number, includeZero: boolean = false): string {
        if ((checkFlag & (checkFlag - 1)) == 0)
            return enumObj[checkFlag];
        var ret: string[] = [];
        var diff = checkFlag;

        var largestFlag = 0;// = Math.pow(2, Math.floor(Math.pow(checkFlag, (1 / 2))));
        while (diff > 1) {
            largestFlag = Math.pow(2, Math.floor(Math.log(diff) / Math.log(2)));
            diff = diff - largestFlag;
            var largestValue = enumObj[largestFlag];
            if (largestValue === undefined) return undefined;
            ret.push(largestValue);
        }
        if (diff == 1) ret.push(enumObj[1]);
        if (includeZero && enumObj[0]) ret.push(enumObj[0]);

        ret.reverse();
        return ret.join(",");
    }
}

module object {



    function getPrototypeChain(ctor: Function): any[] {
        //unused
        //http://typescript.codeplex.com/discussions/468576
        var chain = [];
        var proto = ctor.prototype;
        while (proto) {
            chain.push(proto.constructor)
            proto = Object.getPrototypeOf(proto);
        }
        return chain;
        //var ste = JSON.stringify(ste);
    }
}

export class TypeSystem {
    static GetProperties(obj) {
        var props = new Array<string>();

        for (var s in obj) {
            if (typeof (obj[s]) != "function") {
                props[props.length] = s;
            }
        }

        return props;
    }

    static GetMethods(obj) {
        var methods = new Array<string>();

        for (var s in obj) {
            if (typeof (obj[s]) == "function") {
                methods[methods.length] = s;
            }
        }

        return methods
    }

    static GetObjectStaticPropertiesByClassName(className: string): string[] {

        var obj = this.GetObjectByClassName(className);

        //if (prototype)
        //    obj = obj.prototype;
        if (obj == null || typeof (obj) == undefined)
            return [];//throw new Error("can not determine type");



        return this.GetProperties(obj);
    }

    static GetObjectMethodsByClassName(className: string, instanceMethod: boolean = true): string[] {
        var obj = this.GetObjectByClassName(className);

        if (obj == null || typeof (obj) == undefined)
            return [];// throw new Error("can not determine type");
        else if (instanceMethod)
            obj = obj.prototype || obj;

        return this.GetMethods(obj);
    }

    static GetObjectByClassName(className: string): any {
        var obj;
        if (className.indexOf(".") > 0) {
            var objs = className.split(".");
            obj = window[objs[0]];

            for (var i = 1; i < objs.length; i++) {
                obj = obj[objs[i]];
            }
        }
        else
            obj = window[className];

        //if (prototype)
        //    obj = obj.prototype;

        return obj;
    }
}

//use this to work with node - https://github.com/jindw/xmldom - tested working with commit f053be7ceb
//var DOMParser = require('xmldom').DOMParser;
//var dom = new DOMParser().parseFromString("xml data", 'text/xml');
//console.log(JSON.stringify(xmlToJson(dom.documentElement)));

export module Parsers {
    export class xml2js {

        static parseXMLNode(xmlNode: Node, soapMode: boolean = false, xmlnsRoot: any = undefined): any {
            var obj = {};
            if (!xmlnsRoot) xmlnsRoot = obj;
            if (typeof (xmlNode) === 'undefined') return obj;
            var textNodeName = undefined;
            switch (xmlNode.nodeType) {
                case 1/*Node.ELEMENT_NODE*/:
                    if (xmlNode.prefix) obj["__prefix"] = xmlNode.prefix;
                    var nonGenericAttributeCount = 0;
                    for (var i = 0; i < xmlNode.attributes.length; i++) {
                        nonGenericAttributeCount++;
                        var attr: Attr = xmlNode.attributes.item(i);
                        if (attr.prefix)
                            if (attr.prefix === 'xmlns') {
                                this.addXMLNS(xmlnsRoot, attr.localName, attr.value);
                                nonGenericAttributeCount--;
                            }
                            else if (this.containsXMLNS(xmlnsRoot, attr.prefix))
                                obj[attr.localName] = attr.value;
                            else
                                obj[attr.name] = attr.value;
                        else if (attr.localName === 'xmlns' && xmlNode.namespaceURI !== attr.value) {
                            obj["__type"] = attr.value;
                            nonGenericAttributeCount--;
                        }
                        else
                            obj[attr.localName] = attr.value;
                    }

                    if (soapMode && xmlNode.childNodes.length === 1 && xmlNode.firstChild.nodeType === 3/*Node.TEXT_NODE*/)
                        if (xmlNode.firstChild.nodeValue.trim() !== '')
                            if (nonGenericAttributeCount === 0)
                                return xmlNode.firstChild.nodeValue.trim();
                            else {
                                obj[xmlNode.localName] = xmlNode.firstChild.nodeValue.trim();
                                return obj;
                            }

                    if (soapMode && obj["nil"] && obj["nil"] === 'true')
                        return null;

                    break;
                case 2/*Node.ATTRIBUTE_NODE*/:

                    break;
                case 3/*Node.TEXT_NODE*/:
                    return xmlNode.nodeValue;
                    break;
                default:
                    return obj;
            }


            if (xmlNode.childNodes.length > 0) {
                var skip = false;
                if (soapMode && xmlNode.childNodes.length === 1 && xmlNode.firstChild.nodeType === 3/*Node.TEXT_NODE*/)
                    skip = true;

                if (!skip) {
                    for (var i = 0; i < xmlNode.childNodes.length; i++) {
                        var node: Node = xmlNode.childNodes.item(i);
                        var localName = node.localName || "__text";
                        if (localName === "__text" && node.nodeValue.trim() === "") continue;
                        var nodeObj = this.parseXMLNode(node, soapMode, xmlnsRoot);
                        if (obj[localName])
                            if (Object.prototype.toString.call(obj[localName]) === "[object Array]")
                                obj[localName].push(nodeObj);
                            else {
                                var old = obj[localName];
                                obj[localName] = [];
                                obj[localName].push(old);
                                obj[localName].push(nodeObj);
                            }
                        else
                            obj[localName] = nodeObj;
                    }
                }
            }

            return obj;
        }

        private static addXMLNS(xmlnsObj: any, xmlnsName: string, xmlnsValue: string, xmlnsAttrName: string = "__xmlns"): void {
            if (!xmlnsObj[xmlnsAttrName]) xmlnsObj[xmlnsAttrName] = {};
            (xmlnsObj[xmlnsAttrName])[xmlnsName] = xmlnsValue;
        }
        private static containsXMLNS(obj: any, xmlnsName: string, xmlnsAttrName: string = "__xmlns"): boolean {
            if (obj[xmlnsAttrName]) return typeof ((obj[xmlnsAttrName])[xmlnsName]) !== 'undefined';
            return false;
        }
    }
    export class Uri {
        //RFC Appendix B - http://www.ietf.org/rfc/rfc3986.txt 
        /*    Appendix B.  Parsing a URI Reference with a Regular Expression
        
           As the "first-match-wins" algorithm is identical to the "greedy"
           disambiguation method used by POSIX regular expressions, it is
           natural and commonplace to use a regular expression for parsing the
           potential five components of a URI reference.
        
           The following line is the regular expression for breaking-down a
           well-formed URI reference into its components.
        
        
        
        Berners-Lee, et al.         Standards Track                    [Page 50]
        
        RFC 3986                   URI Generic Syntax               January 2005
        
        
              ^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?
               12            3  4          5       6  7        8 9
        
           The numbers in the second line above are only to assist readability;
           they indicate the reference points for each subexpression (i.e., each
           paired parenthesis).  We refer to the value matched for subexpression
           <n> as $<n>.  For example, matching the above expression to
        
              http://www.ics.uci.edu/pub/ietf/uri/#Related
        
           results in the following subexpression matches:
        
              $1 = http:
              $2 = http
              $3 = //www.ics.uci.edu
              $4 = www.ics.uci.edu
              $5 = /pub/ietf/uri/
              $6 = <undefined>
              $7 = <undefined>
              $8 = #Related
              $9 = Related
        
           where <undefined> indicates that the component is not present, as is
           the case for the query component in the above example.  Therefore, we
           can determine the value of the five components as
        
              scheme    = $2
              authority = $4
              path      = $5
              query     = $7
              fragment  = $9
        
           Going in the opposite direction, we can recreate a URI reference from
           its components by using the algorithm of Section 5.3.
        */
        static parseString(url: string) {
            var regex = RegExp("^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?");
            var parts = url.match(regex);
            return {
                scheme: parts[2],
                authority: parts[4],
                path: parts[5],
                query: parts[7],
                fragment: parts[9]
            };
        }
        static getDomain(url: string) :string{
            return Uri.parseString(url).authority;
        }
        static getHost(url: string): string {
            return Uri.getDomain(url);
        }

    }
}

declare var window;
var isNode = (typeof window === 'undefined')
var dp = undefined;

if (isNode) {
    var dr = require('xmldom');
    dp = dr.DOMParser;
} else {
    dp = window.DOMParser;
}

export var DOMParser = dp;

export function btoa(text: string): string {
    if (isNode) {
        var b = new Buffer(text);
        return b.toString('base64');
    } else {
        return window.btoa(text);
    }
}
