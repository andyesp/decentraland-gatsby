(window.webpackJsonp=window.webpackJsonp||[]).push([[15],{3180:function(module,exports,__webpack_require__){"use strict";Object.defineProperty(exports,"__esModule",{value:!0});const events_1=__webpack_require__(1145),jsonrpc_1=__webpack_require__(3361);exports.LegacyProviderAdapter=class LegacyProviderAdapter{constructor(provider){this.provider=provider,this.eventEmitter=new events_1.EventEmitter}subscribeToLegacyProvider(){if(!this.provider.on)throw new Error("Legacy provider does not support subscriptions.");this.provider.on("data",(result,deprecatedResult)=>{(result=result||deprecatedResult).method&&this.eventEmitter.emit("notification",result.params)})}send(method,params){return new Promise((resolve,reject)=>{const payload=jsonrpc_1.createJsonRpcPayload(method,params);this.provider.send(payload,(err,message)=>{if(err)return reject(err);if(!message)return reject(new Error("No response."));if(!jsonrpc_1.isValidJsonRpcResponse(message)){const msg=message.error&&message.error.message?message.error.message:"Invalid JSON RPC response: "+JSON.stringify(message);return reject(new Error(msg))}const response=message;if(response.error){const message=response.error.message?response.error.message:JSON.stringify(response);return reject(new Error("Returned error: "+message))}if(response.id&&payload.id!==response.id)return reject(new Error(`Wrong response id ${payload.id} != ${response.id} in ${JSON.stringify(payload)}`));resolve(response.result)})})}on(notification,listener){if("notification"!==notification)throw new Error("Legacy providers only support notification event.");return 0===this.eventEmitter.listenerCount("notification")&&this.subscribeToLegacyProvider(),this.eventEmitter.on("notification",listener),this}removeListener(notification,listener){if(!this.provider.removeListener)throw new Error("Legacy provider does not support subscriptions.");if("notification"!==notification)throw new Error("Legacy providers only support notification event.");return this.eventEmitter.removeListener("notification",listener),0===this.eventEmitter.listenerCount("notification")&&this.provider.removeAllListeners("data"),this}removeAllListeners(notification){this.eventEmitter.removeAllListeners("notification"),this.provider.removeAllListeners&&this.provider.removeAllListeners("data")}}},3229:function(module,exports,__webpack_require__){"use strict";Object.defineProperty(exports,"__esModule",{value:!0});const tslib_1=__webpack_require__(3151),http_1=tslib_1.__importDefault(__webpack_require__(3245)),https_1=tslib_1.__importDefault(__webpack_require__(3286)),isomorphic_fetch_1=tslib_1.__importDefault(__webpack_require__(1146)),legacy_provider_adapter_1=__webpack_require__(3180);class HttpProvider extends legacy_provider_adapter_1.LegacyProviderAdapter{constructor(host,options={}){super(new LegacyHttpProvider(host,options))}}exports.HttpProvider=HttpProvider;class LegacyHttpProvider{constructor(host,options={}){this.host=host,this.options=options,this.host=host||"http://localhost:8545",options.keepAlive&&(this.options.agent=/^https/.test(this.host)?new https_1.default.Agent({keepAlive:!0}):new http_1.default.Agent({keepAlive:!0}))}send(payload,callback){isomorphic_fetch_1.default(this.host,{...this.options,method:"POST",credentials:"include",headers:{...this.options.headers,"Content-Type":"application/json"},body:JSON.stringify(payload)}).then(response=>response.json()).then(json=>callback(void 0,json)).catch(callback)}disconnect(){}}},3230:function(module,exports,__webpack_require__){"use strict";Object.defineProperty(exports,"__esModule",{value:!0});const isomorphic_ws_1=__webpack_require__(3151).__importDefault(__webpack_require__(3362)),util_1=__webpack_require__(1751),legacy_provider_adapter_1=__webpack_require__(3180);class WebsocketProvider extends legacy_provider_adapter_1.LegacyProviderAdapter{constructor(url,options={}){const legacyProvider=new LegacyWebsocketProvider(url,options);super(legacyProvider),this.legacyProvider=legacyProvider}disconnect(){this.legacyProvider.disconnect()}}exports.WebsocketProvider=WebsocketProvider;class LegacyWebsocketProvider{constructor(url,options={}){this.responseCallbacks={},this.notificationCallbacks=[],this.lastChunk="",this.connected=!1,this.onOpen=()=>{this.connected=!0},this.onError=()=>{this.timeout()},this.onClose=()=>{this.timeout(),this.reset(),this.connected=!1},this.onMessage=e=>{const data="string"==typeof e.data?e.data:"";this.parseResponse(data).forEach(result=>{let id=null;util_1.isArray(result)?result.forEach(load=>{this.responseCallbacks[load.id]&&(id=load.id)}):id=result.id,!id&&result&&result.method&&-1!==result.method.indexOf("_subscription")?this.notificationCallbacks.forEach(callback=>{callback(result)}):id&&this.responseCallbacks[id]&&(this.responseCallbacks[id].callback(void 0,result),delete this.responseCallbacks[id])})},this.options=options,this.connection=new isomorphic_ws_1.default(url,options.protocol,options.clientOptions),this.connection.onopen=this.onOpen,this.connection.onerror=this.onError,this.connection.onclose=this.onClose,this.connection.onmessage=this.onMessage}parseResponse(data){const returnValues=[];return data.replace(/\}[\n\r]?\{/g,"}|--|{").replace(/\}\][\n\r]?\[\{/g,"}]|--|[{").replace(/\}[\n\r]?\[\{/g,"}|--|[{").replace(/\}\][\n\r]?\{/g,"}]|--|{").split("|--|").forEach(data=>{this.lastChunk&&(data=this.lastChunk+data);let result=null;try{result=JSON.parse(data)}catch(e){return this.lastChunk=data,clearTimeout(this.lastChunkTimeout),void(this.lastChunkTimeout=setTimeout(()=>{throw this.timeout(),new Error("Invalid response data: "+data)},15e3))}clearTimeout(this.lastChunkTimeout),this.lastChunk="",result&&returnValues.push(result)}),returnValues}addResponseCallback(payload,callback){const id=payload.id||payload[0].id,method=payload.method||payload[0].method;this.responseCallbacks[id]={callback:callback,method:method},this.options.timeout&&setTimeout(()=>{this.responseCallbacks[id]&&(this.responseCallbacks[id].callback(new Error("Connection timeout"),void 0),delete this.responseCallbacks[id])},this.options.timeout)}timeout(){for(const key in this.responseCallbacks)this.responseCallbacks[key]&&(this.responseCallbacks[key].callback(new Error("Connection error"),void 0),delete this.responseCallbacks[key])}send(payload,callback){if(this.connection.readyState!==this.connection.CONNECTING){if(this.connection.readyState!==this.connection.OPEN)return console.error("connection not open on send()"),this.onError(),void callback(new Error("connection not open"),void 0);this.connection.send(JSON.stringify(payload)),this.addResponseCallback(payload,callback)}else setTimeout(()=>{this.send(payload,callback)},10)}on(type,callback){switch(type){case"data":this.notificationCallbacks.push(callback);break;default:throw new Error("Only supports data.")}}removeListener(type,callback){switch(type){case"data":const i=this.notificationCallbacks.indexOf(callback);-1!==i&&this.notificationCallbacks.splice(i,1);break;default:throw new Error("Only supports data.")}}removeAllListeners(type){switch(type){case"data":this.notificationCallbacks=[];break;default:throw new Error("Only supports data.")}}reset(){this.timeout(),this.notificationCallbacks=[]}disconnect(){this.connection&&this.connection.close()}}},3231:function(module,exports,__webpack_require__){"use strict";Object.defineProperty(exports,"__esModule",{value:!0});const util_1=__webpack_require__(1751),legacy_provider_adapter_1=__webpack_require__(3180);class IpcProvider extends legacy_provider_adapter_1.LegacyProviderAdapter{constructor(path,net){super(new LegacyIpcProvider(path,net))}}exports.IpcProvider=IpcProvider;class LegacyIpcProvider{constructor(path,net){this.path=path,this.responseCallbacks={},this.notificationCallbacks=[],this.path=path,this.connected=!1,this.connection=net.connect({path:this.path}),this.addDefaultEvents();const callback=function(result){let id=null;util_1.isArray(result)?result.forEach(load=>{this.responseCallbacks[load.id]&&(id=load.id)}):id=result.id,id||-1===result.method.indexOf("_subscription")?this.responseCallbacks[id]&&(this.responseCallbacks[id](null,result),delete this.responseCallbacks[id]):this.notificationCallbacks.forEach(callback=>{util_1.isFunction(callback)&&callback(result)})};this.connection.on("data",data=>{this._parseResponse(data.toString()).forEach(callback)})}addDefaultEvents(){this.connection.on("connect",()=>{this.connected=!0}),this.connection.on("close",()=>{this.connected=!1}),this.connection.on("error",()=>{this._timeout()}),this.connection.on("end",()=>{this._timeout()}),this.connection.on("timeout",()=>{this._timeout()})}_parseResponse(data){const returnValues=[];return data.replace(/\}[\n\r]?\{/g,"}|--|{").replace(/\}\][\n\r]?\[\{/g,"}]|--|[{").replace(/\}[\n\r]?\[\{/g,"}|--|[{").replace(/\}\][\n\r]?\{/g,"}]|--|{").split("|--|").forEach(data=>{this.lastChunk&&(data=this.lastChunk+data);let result=null;try{result=JSON.parse(data)}catch(e){return this.lastChunk=data,clearTimeout(this.lastChunkTimeout),void(this.lastChunkTimeout=setTimeout(()=>{throw this._timeout(),new Error("Timeout")},15e3))}clearTimeout(this.lastChunkTimeout),this.lastChunk=null,result&&returnValues.push(result)}),returnValues}_addResponseCallback(payload,callback){const id=payload.id||payload[0].id,method=payload.method||payload[0].method;this.responseCallbacks[id]=callback,this.responseCallbacks[id].method=method}_timeout(){for(const key in this.responseCallbacks)this.responseCallbacks.hasOwnProperty(key)&&(this.responseCallbacks[key](new Error("CONNECTION ERROR: Couldn't connect to node on IPC.")),delete this.responseCallbacks[key])}reconnect(){this.connection.connect({path:this.path})}send(payload,callback){this.connection.writable||this.connection.connect({path:this.path}),this.connection.write(JSON.stringify(payload)),this._addResponseCallback(payload,callback)}on(type,callback){if("function"!=typeof callback)throw new Error("The second parameter callback must be a function.");switch(type){case"data":this.notificationCallbacks.push(callback);break;default:this.connection.on(type,callback)}}once(type,callback){if("function"!=typeof callback)throw new Error("The second parameter callback must be a function.");this.connection.once(type,callback)}removeListener(type,callback){switch(type){case"data":this.notificationCallbacks.forEach((cb,index)=>{cb===callback&&this.notificationCallbacks.splice(index,1)});break;default:this.connection.removeListener(type,callback)}}removeAllListeners(type){switch(type){case"data":this.notificationCallbacks=[];break;default:this.connection.removeAllListeners(type)}}reset(){this._timeout(),this.notificationCallbacks=[],this.connection.removeAllListeners("error"),this.connection.removeAllListeners("end"),this.connection.removeAllListeners("timeout"),this.addDefaultEvents()}disconnect(){this.connection.close()}}},3361:function(module,exports,__webpack_require__){"use strict";Object.defineProperty(exports,"__esModule",{value:!0});const JsonRpc={messageId:0},validateSingleMessage=message=>!(!message||message.error||"2.0"!==message.jsonrpc||"number"!=typeof message.id&&"string"!=typeof message.id||void 0===message.result);function createJsonRpcPayload(method,params){return JsonRpc.messageId++,{jsonrpc:"2.0",id:JsonRpc.messageId,method:method,params:params||[]}}exports.createJsonRpcPayload=createJsonRpcPayload,exports.isValidJsonRpcResponse=function isValidJsonRpcResponse(response){return Array.isArray(response)?response.every(validateSingleMessage):validateSingleMessage(response)},exports.createJsonRpcBatchPayload=function createJsonRpcBatchPayload(messages){return messages.map(message=>createJsonRpcPayload(message.method,message.params))}},3362:function(module,exports,__webpack_require__){(function(global){var ws=null;"undefined"!=typeof WebSocket?ws=WebSocket:"undefined"!=typeof MozWebSocket?ws=MozWebSocket:void 0!==global?ws=global.WebSocket||global.MozWebSocket:"undefined"!=typeof window?ws=window.WebSocket||window.MozWebSocket:"undefined"!=typeof self&&(ws=self.WebSocket||self.MozWebSocket),module.exports=ws}).call(this,__webpack_require__(35))},3363:function(module,exports,__webpack_require__){"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var ws_1=__webpack_require__(3230);exports.WebsocketProvider=ws_1.WebsocketProvider;var http_1=__webpack_require__(3229);exports.HttpProvider=http_1.HttpProvider;var ipc_1=__webpack_require__(3231);exports.IpcProvider=ipc_1.IpcProvider},3468:function(module,exports,__webpack_require__){"use strict";Object.defineProperty(exports,"__esModule",{value:!0});const tslib_1=__webpack_require__(3151);tslib_1.__exportStar(__webpack_require__(3229),exports),tslib_1.__exportStar(__webpack_require__(3230),exports),tslib_1.__exportStar(__webpack_require__(3231),exports),tslib_1.__exportStar(__webpack_require__(3363),exports),tslib_1.__exportStar(__webpack_require__(3180),exports)}}]);
//# sourceMappingURL=15.5b8286b518015052aff7.bundle.js.map