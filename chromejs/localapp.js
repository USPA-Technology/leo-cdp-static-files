
if(typeof jQuery === 'undefined' ) {
	var jsSrc = 'https://code.jquery.com/jquery-3.5.1.min.js';
    var jsNode = document.createElement('script');
    jsNode.async = true;
    jsNode.src = jsSrc;
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(jsNode, s);
}


function addLeoCdpPurchasingButton(source, productId, idType) {
	console.log("addLeoCdpPurchasingButton",source, productId, idType);
	
	var leoBuyBtnStyle = 'button.leocdp_buy_btn { border: none; color: white; padding: 12px 30px; text-align: center; font-size: 18px; margin: 4px 2px; cursor: pointer; background-color: #4CAF50;}';
	leoBuyBtnStyle += 'button.leocdp_buy_btn:hover{background-color:orange} button.leocdp_buy_btn:focus{background-color:gray} ';
	var bodyNode = jQuery("body");
	bodyNode.prepend('<style> '+ leoBuyBtnStyle + '</style>');
	bodyNode.prepend('<div id="leo_test_holder" style="padding:20px;text-align:right;"></div>');
	
	var btn = jQuery('<button class="leocdp_buy_btn" type="button" onclick="leoPurchasingSimulation(this)"> LEO CDP - Purchasing Simulation Test Button </button> ');
	btn.data('source',source);
	btn.data('productId',productId);
	btn.data('idType',idType);
	jQuery('#leo_test_holder').append(btn)
}

// 
var crUrl = location.href;
var referrerUrl = document.referrer;

function leoPurchasingSimulation(node){
	var source = jQuery(node).data('source');
	var productId =  jQuery(node).data('productId');
	var idType =  jQuery(node).data('idType');
	
	console.log("leoPurchasingSimulation",source, productId, idType)
	
	if(source === 'amazon') {
		var transactionId = "AmazonLeoCdpDemo_"+ new Date().getTime();
		var purchasedItems = [{"itemtId": productId, "idType" : idType, quantity : 1}];
		
		leoTrackEventOnlinePurchasedOK(transactionId, purchasedItems);
	}
}

function dataTracking() {
	
	// Amazon 
	if(crUrl.indexOf('.amazon.com') > 0 ) {
		// product-view tracking
		if(crUrl.indexOf('/gp/product/') > 0 || crUrl.indexOf('/dp/') > 0 ) {
			var productId = jQuery('#printEditionIsbn_feature_div > div > div:nth-child(1) > span:nth-child(2)').text().trim();
			var idType = 'ISBN-13';
			if(productId === '') {
				var arr = jQuery('#detailBullets_feature_div ul:first li').text().trim().split('\n');
				arr.forEach(function(item, index){
					var toks = item.split('-');
					if( toks.length === 2 && item.length === 14 ) {
						if( parseInt(toks[0]) > 0) {
							productId = item;
						}
					}
				});
				if(productId === ''){
					productId = jQuery('input[name^="ASIN"]').val();
					idType = 'ASIN';
				}
			}
			console.log("Amazon productId " + productId)
			if(productId !== '') {
				
				leoTrackEventProductView([productId], idType);
				
				jQuery('#add-to-wishlist-button-submit').click(function(){
					leoTrackEventLikeProduct([productId], idType)
				})
				jQuery('#add-to-cart-button').click(function(){
					leoTrackEventAddToCart([productId], idType)
				})
				
				addLeoCdpPurchasingButton('amazon', productId, idType);
				
			} else {
				leoTrackEventPageView();
			}
		} 
		// listing page tracking
		else {
			leoTrackEventPageView();
		}
		return true;
	} 
	
	// Manning Book Publisher
	else if (crUrl.indexOf('https://www.manning.com') === 0 ) { 
		// product-view tracking
		if(crUrl.indexOf('https://www.manning.com/books/') === 0 ) {
			if(typeof viewContentPayload === "object" ) {
				var idType = 'ISBN-13';
				var productId = viewContentPayload.isbn;
				
				leoTrackEventProductView([productId], idType);
				
				jQuery('button.add-to-cart').click(function(){
					leoTrackEventAddToCart([productId], idType)
				});
			}
		} 
		// listing page tracking
		else {
			leoTrackEventPageView();
		}
		return true;
	}
	
	// AEON shop
	else if (crUrl.indexOf('https://aeoneshop.com') === 0) {
		var arr = jQuery('span[class="pro_sku sku-pro"]').text().split(':');
		
		// product-view tracking
		if(arr.length === 2) {
			var idType = 'SKU';
			var productId = arr[1].trim();
			
			leoTrackEventProductView([productId], idType);
			
			jQuery('#add-cart-detail-fly').click(function(){
				leoTrackEventAddToCart([productId], idType)
			});
		}
		// listing page tracking
		else {
			leoTrackEventPageView();
		}
		return true;
	}
	
	// ACFC
	else if (crUrl.indexOf('https://www.acfc.com.vn') === 0) {
		
		if(crUrl.indexOf('.html') > 0 ) {
			var idType = 'SKU';
			var productId = jQuery('div[itemprop="sku"]').text().trim();
			if(productId !== '' ) {
				
				leoTrackEventProductView([productId], idType);
				
				jQuery('#product-addtocart-button').click(function(){
					leoTrackEventAddToCart([productId], idType)
				});
			}
		} else {
			leoTrackEventPageView();
		}
		return true;
	}
	
	// YouTube
	else if (crUrl.indexOf('https://www.youtube.com') === 0) {
		
		if(crUrl.indexOf('https://www.youtube.com/watch') === 0 ) {
			var idType = 'YOUTUBE_VID';
			var arr = location.href.split('v=');
			if(arr.length > 0) {
				var videoId = arr[1].trim();
				var eventData = {"videoId": videoId,"idType":idType};
				
				leoTrackEventContentView(eventData);
				
				jQuery('#top-level-buttons .force-icon-button').first().click(function(){ 
					LeoObserverProxy.recordActionEvent("like-video", eventData);
				})
			}
		} else {
			leoTrackEventPageView();
		}
		return true;
	}
	
	// EDX
	else if( crUrl.indexOf('edx.org') > 0 ) {
		// demo for https://learning.edx.org/course/course-v1:AdelaideX+BigDataX+3T2017/home
		setTimeout(function(){
			if( crUrl.indexOf('learning.edx.org/course') > 0 ) {
				var npsBtn = '<a class="nav-item flex-shrink-0 nav-link" href="javascript:loadLeoFormNPS()" style="">NPS Survey</a>';
				jQuery('#main-content > div.course-tabs-navigation.mb-3 > div > nav').append(jQuery(npsBtn));
				
				// 
				if(jQuery('#unit-iframe').length === 1){
					loadLeoFormCSAT();
				}
			}
		},3000);
		
		//
		leoTrackEventPageView();
	}
	
	// VNUK
	else if( crUrl.indexOf('vnuk.udn.vn') > 0 ) {
		loadLeoFormCES();
		leoTrackEventPageView();
	}
	
	// news
	else if (crUrl.indexOf('https://thanhnien.vn/') === 0 || crUrl.indexOf('https://vnexpress.net/') === 0 
			|| crUrl.indexOf('https://tuoitre.vn/') === 0 || crUrl.indexOf('https://medium.com/') === 0 ) {
		// pageview tracking
		leoTrackEventPageView();
		return true;
	}
	return false;
}

function leoObserverProxyReady(session) {
   //LEO JS is ready
   if( dataTracking() ) {
	   console.log("LEOCDP Chrome Test App, dataTracking is called OK ")
   } else {
	   console.log("LEOCDP Chrome Test App, dataTracking is called FAILED ")
   }
}

/// LEO OBSERVER CODE

(function() {
    // LEO Web Code for channel: Affiliate Marketing
	window.leoObserverLogDomain = "demotrack.leocdp.net";
	window.leoObserverCdnDomain = "demostatic.leocdp.net";
	window.leoObserverId = "4sdIIrlvJtgTD3PZcFqE2T";
	
	window.srcTouchpointName = encodeURIComponent(document.title);
	window.srcTouchpointUrl = encodeURIComponent(location.href);

	var leoproxyJsPath = '/js/leo-observer/leo.proxy.min.js';
    var src = location.protocol + '//' + window.leoObserverCdnDomain + leoproxyJsPath;
    var jsNode = document.createElement('script');
    jsNode.async = true;
    jsNode.src = src;
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(jsNode, s);
})();

function leoTrackEventPageView() {
	LeoObserverProxy.recordViewEvent("page-view");
}

function leoTrackEventContentView(eventData) {
	if(typeof eventData === "object") {
		LeoObserverProxy.recordViewEvent("content-view", eventData);
	} else {
		console.log('Invalid params for leoTrackEventContentView')
	}
}

function leoTrackEventProductView(productIdList, idType) {
	if(typeof productIdList === "object" && typeof idType === "string") {
		var productIds = productIdList.join(";");
		var eventData = {"productIds": productIds, "idType":idType};
		console.log('leoTrackEventProductView', eventData)
		LeoObserverProxy.recordActionEvent("product-view", eventData);
	} else {
		console.log('Invalid params for leoTrackEventProductView')
	}
}

function leoTrackEventLikeProduct(productIdList, idType) {
	if(typeof productIdList === "object" && typeof idType === "string") {
		var productIds = productIdList.join(";");
		var eventData = {"productIds": productIds, "idType":idType};
		console.log('leoTrackEventLikeProduct', eventData)
		LeoObserverProxy.recordActionEvent("like-product", eventData);
	} else {
		console.log('Invalid params for leoTrackEventLikeProduct')
	}
}

function leoTrackEventAddToCart(productIdList, idType) {
	if(typeof productIdList === "object" && typeof idType === "string" ) {
		var productIds = productIdList.join(";");
		var eventData = {"productIds": productIds, "idType":idType};
		console.log('leoTrackEventAddToCart', eventData)
		LeoObserverProxy.recordActionEvent("add-to-cart", eventData);
	} else {
		console.log('Invalid params for leoTrackEventAddToCart')
	}
}

function leoTrackEventOrderCheckout(productIdList, idType) {
	if(typeof productIdList === "object" && typeof idType === "string" ) {
		var productIds = productIdList.join(";");
		var eventData = {"productIds": productIds, "idType":idType};
		console.log('leoTrackEventOrderCheckout', eventData)
		LeoObserverProxy.recordActionEvent("order-checkout", eventData);
	} else {
		console.log('Invalid params for leoTrackEventOrderCheckout')
	}
}

function leoTrackEventOnlinePurchasedOK(transactionId, purchasedItems) {
	if( typeof transactionId === "string"  && typeof purchasedItems === "object") {
		console.log('leoTrackEventOnlinePurchasedOK', transactionId, purchasedItems)
		LeoObserverProxy.recordConversionEvent("online-purchase", {} , transactionId, purchasedItems, -1, "USD");
	} else {
		console.log('Invalid params for leoTrackEventOnlinePurchasedOK')
	}
}

function loadLeoFormCES(){
	var svf = document.title;
	var tprefurl = location.href;
	var url  = 'https://demotrack.leocdp.net/webform?obsid=6BCKk58hUqutq2LN2VlBl2&tprefurl='+tprefurl+'&svf='+svf+'&svt=CES&_t='+new Date().getTime();
	var iframe = '<div class="leocdp_iframe" > <iframe class="leocdp_iframe_small" src="'+url+'"></iframe> </div>';
	jQuery('#kingster-page-wrapper > div.kingster-bottom-page-builder-container.kingster-container > div > div > div > div.kingster-single-social-share.kingster-item-rvpdlr').append(iframe)
}

function loadLeoFormCSAT(){
	var svf = document.title;
	var tprefurl = location.href;
	var url  = 'https://demotrack.leocdp.net/webform?obsid=6BCKk58hUqutq2LN2VlBl2&tprefurl='+tprefurl+'&svf='+svf+'&svt=CSAT&_t='+new Date().getTime();
	var iframe = '<div class="leocdp_iframe_container"> <iframe class="leocdp_iframe_responsive" src="'+url+'"></iframe> </div>';
	
	jQuery('div.unit-iframe-wrapper').append(iframe)
}

function loadLeoFormNPS(){
	var svf = document.title;
	var tprefurl = location.href;
	var url = 'https://demotrack.leocdp.net/webform?obsid=6BCKk58hUqutq2LN2VlBl2&tprefurl='+tprefurl+'&svf='+svf+'&svt=NPS&_t='+new Date().getTime();
	var iframe = '<div class="leocdp_iframe_container"> <iframe class="leocdp_iframe_responsive" src="'+url+'"></iframe> </div>';
	jQuery('#main-content > div.container-fluid').html(iframe)
}