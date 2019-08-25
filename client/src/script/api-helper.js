export default {

    pageURL: document.location.origin,

    /** Make a GET API call to the given destination
     * @param {string} dest - destination to follow /api/
     * @param {*} onLoadFunction - callback after successful load
     */
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

    /** Make a POST API call to the given destination
     * @param {string} dest - destination to follow /api/ 
     * @param {Object} payload - payload to POST with (will be converted to JSON) 
     * @param {*} onSaveFunction - callback after successful save
     */
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