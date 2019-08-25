export default {

    pageURL: document.location.origin,

    callApiGet: function (dest, onLoadFunction) {
        const asynchronous = true;
        const method = 'GET';
    
        const request = new XMLHttpRequest();
        request.open(method, this.pageURL + '/api/' + dest, asynchronous);
        request.onload = () => {
            onLoadFunction(request);
        };
        request.send();
    },

    callApiPost: function(dest, payload, onSaveFunction) {
        const asynchronous = true;
        const method = 'POST';

        const request = new XMLHttpRequest();
        request.open(method, this.pageURL + '/api/' + dest, asynchronous);
        request.setRequestHeader('Content-Type', 'application/json');
        request.onload = function() {
            onSaveFunction(request);
        };
        request.send(JSON.stringify(payload));
    }

}