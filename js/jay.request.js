/* requires:
 * jay.js
 * jay.crypto.js
 * jay.conf.js
 * jay.crypto.js
 */
var Jay = (function(Jay, $, undefined) {

	Jay.request = {};


	Jay.request.outside = function(link, postdata, callback, error)
	{
		$.support.cors = true

		var fulldata = "requestType="+request+"&"+$.params(postdata);
		$.ajax({
			url: link,
			type: "post",
			crossDomain: true,
			dataType: 'json',
			data : fulldata,
			async: true,
			success: callback,
			error: function (jqXHR, textStatus, errorThrown)
			{
				error(jqXHR, textStatus, errorThrown);
			}
		});
	}

	Jay.request.multiple = function(nodes, request, callback, error)
	{
		for(var a=0;a<nodes.length;a++)
		{
			Jay.request.outside
		}

	}


	Jay.request.getRandomNxtNodes = function(amount, dontinclude) {
		var allnodes = Jay.conf.getAttribute("nxtnodes");
		var randnodes = [];
		for(var a=0; a<amount; a++)
		{
			var node = allnodes[Math.ceil(Math.random() * allnodes.length)-1];
			for(var b=0; b<randnodes.length;b++)
			{
				if(node == randnodes[b])
				{
					a--;
					continue;
				}
			}
			if(dontinclude != null)
			{
				for(var b=0; b<dontinclude.length;b++)
				{
					if(node == dontinclude[b])
					{
						a--;
						continue;
					}
				}
			}
			randnodes.push(node);
		}
		return randnodes;
	}




	Jay.request.nxt = function(request, options, callback, specific) {
		// get my 3 random servers, hope they don't collude (:
		var nodes = Jay.request.getRandomNxtNodes(3);
		var addr = ":7876/nxt?requestType="+request+"&"+$.param(options);

		$.when($.getJSON("http://"+nodes[0]+addr), $.getJSON("http://"+nodes[1]+addr), $.getJSON("http://"+nodes[2]+addr))
			.then(function(node1, node2, node3) {
				// ok, so now we have data on three nodes, lets hash and compare.
				var responses = [];
				responses.push(node1[0], node2[0], node3[0]);
				if(Jay.request.objectCompare(responses[0], responses[1]) && Jay.request.objectCompare(responses[0], responses[2]))
				{
					// all nodes match , were done here, a speedy exit (:
					callback(responses[0]);
				}
				else 
				{
					// begin the edge cases, lets call two more friends to see where they side here...
					var morenodes = Jay.request.getRandomNxtNodes(2, nodes);
					$.when($.getJSON("http://"+morenodes[0]+addr), $.getJSON("http://"+morenodes[1]+addr))
						.then(function(morenode1, morenode2) {
							// ok, now we have 5 data points, add the next two
							responses.push(morenode1[0], morenode2[0]);
							var majority = Jay.request.findMajority(responses);
							if(majority != -1)
							{
								callback(responses[majority]);
							}
							else
							{
								// still no majority, lets do a final fallback... ouch..
								/*var evenmorenodes = Jay.reqest.getRandomNxtNodes(2, nodes.concat(morenodes));
								$.when($.getJSON(morenodes))*/


								// think about this area some more...
							}

						}, function() {
							// so much that can go wrong...
							
						});
				}

			}, function() {
				// on failure
				alert("fail");
			});

	}

	Jay.request.findMajority = function(hashes)
	{
		//if()

		if(maxi < Math.ceil(hashes.length/2)) return maxn;
		else return -1;

	}

	Jay.request.objectCompare = function(o1, o2, params)
	{
		if(typeof(params) != undefined)
		{
			// search for all things
			o1.requestProcessingTime = 0;
			o2.requestProcessingTime = 0;
			return objectEquals(o1, o2);
		}
		else
		{
			// compare only the objects in params..
			for(var b=0;b<params.length;b++)
			{
				if(params[b] in o1 && params[b] in o2)
				{
					if(typeof(o1[params[b]]) == Object)
					{
						if(JSON.stringify(o1[params[b]]) != JSON.stringify(o2[params[b]])) return false;
					}
					else
					{
						if(o1[params[b]] != o[params[b]]) return false;
					}
				}
				else return false;
			}
			return true;

		}
		for(var p in o1){
			alert(p + ": " + o1[p] + "  " + o2[p])
			if(p == "requestProcessingTime") continue;
	        if(o1.hasOwnProperty(p)){
	            if(o1[p] !== o2[p]){
	                return false;
	            }
	        }
	    }
	    alert("fst");
	    for(var p in o2){
	    	if(p == "requestProcessingTime") continue;
	        if(o2.hasOwnProperty(p)){
	            if(o1[p] !== o2[p]){
	                return false;
	            }
	        }
	    }
	    return true;
	}

	function objectEquals(x, y) {
    'use strict';

    if (x === null || x === undefined || y === null || y === undefined) { return x === y; }
    // after this just checking type of one would be enough
    if (x.constructor !== y.constructor) { return false; }
    // if they are functions they should exactly refer to same one
    if (x instanceof Function) { return x === y; }
    if (x === y || x.valueOf() === y.valueOf()) { return true; }
    if (Array.isArray(x) && x.length !== y.length) { return false; }

    // if they are dates, they must had equal valueOf
    if (x instanceof Date) { return false; }

    // if they are strictly equal, they both need to be object at least
    if (!(x instanceof Object)) { return false; }
    if (!(y instanceof Object)) { return false; }

    // recursive object equality check
    var p = Object.keys(x);
    return Object.keys(y).every(function (i) { return p.indexOf(i) !== -1; }) ?
            p.every(function (i) { return objectEquals(x[i], y[i]); }) :
            false;
	}

	/*
	Jay.request.nxtGet = function(server, request, options) {
		var addr = server+":7876/nxt?requestType="+request+"&"+Jay.convert.objectToPost(options);
		$.post()
	}

	Jay.request.send = function(url, callback);

	}*/

	return Jay;
}(Jay || {}, jQuery));
