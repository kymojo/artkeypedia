export default {

    pageURL: document.location.origin,

    callApiGet: function (dest, onLoadFunction) {
        const asynchronous = true;
        const method = 'GET';
    
        const request = new XMLHttpRequest();
        request.open(method, this.pageURL + '/api/' + dest, asynchronous);
        request.onload = onLoadFunction;
        request.send();
    }

}