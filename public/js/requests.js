var requests = (function () {

    function req(method, server, data, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open(method, server, true);
        xhr.withCredentials = true;
        xhr.onreadystatechange = function () {
            if (xhr.readyState == XMLHttpRequest.DONE) {
                if (callback !== undefined){
                    callback({ 'status': xhr.status, 'response': xhr.responseText });
                }
            }
        }

        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.send(JSON.stringify(data));
    }

    function allSongs(callback) {
        req('GET', '/allSongs', null, callback);
    }

    function userSongs(callback) {
        req('GET', '/userSongs', null, callback);
    }

    function addToUserSongs(data, callback) {
        req('POST', '/addToUserSongs', data, callback);
    }

    function removeFromUserSongs(data, callback) {
        req('POST', '/removeFromUserSongs', data, callback);
    }

    function userPlaylists(callback) {
        req('GET', '/userPlaylists', null, callback);
    }

    function playlistsSongs(data, callback) {
        req('POST', '/playlistsSongs', data, callback);
    }

    function updatePlaylist(data, callback) {
        req('POST', '/updatePlaylist', data, callback);
    }

    function createPlaylist(data, callback) {
        req('POST', '/createPlaylist', data, callback);
    }

    function deletePlaylist(data, callback) {
        req('POST', '/deletePlaylist', data, callback);
    }

    function updateListeningSong(data, callback) {
        req('POST', '/updateListeningSong', data, callback);
    }

    function friendsListeningSongs(callback) {
        req('GET', '/friendsListeningSongs', null, callback);
    }

    function addFriend(data, callback) {
        req('POST', '/addFriend', data, callback);
    }

    function removeFriend(data, callback) {
        req('POST', '/removeFriend', data, callback);
    }

    function login(data, callback) {
        req('POST','/login',data, callback);
    }

    function mainPage(){
        req('GET','/',null, undefined);
    }

    return {
        allSongs,
        userSongs,
        addToUserSongs,
        removeFromUserSongs,
        userPlaylists,
        playlistsSongs,
        updatePlaylist,
        createPlaylist,
        deletePlaylist,
        updateListeningSong,
        friendsListeningSongs,
        addFriend,
        removeFriend,
        login,
        mainPage
    };

})();