var requests = (function () {

    function req(method, server, data, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open(method, server, true);
        xhr.withCredentials = true;
        xhr.onreadystatechange = function () {
            if (xhr.readyState == XMLHttpRequest.DONE) {
                callback({ 'status': xhr.status, 'response': xhr.responseText });
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

    function addToUserSongs(callback, data) {
        req('POST', '/addToUserSongs', data, callback);
    }

    function removeFromUserSongs(callback, data) {
        req('POST', '/removeFromUserSongs', data, callback);
    }

    function userPlaylists(callback) {
        req('GET', '/userPlaylists', null, callback);
    }

    function playlistsSongs(callback, data) {
        req('POST', '/playlistsSongs', data, callback);
    }

    function updatePlaylist(callback, data) {
        req('POST', '/updatePlaylist', data, callback);
    }

    function createPlaylist(callback, data) {
        req('POST', '/createPlaylist', data, callback);
    }

    function deletePlaylist(callback, data) {
        req('POST', '/deletePlaylist', data, callback);
    }

    function updateListeningSong(callback, data) {
        req('POST', '/updateListeningSong', data, callback);
    }

    function friendsListeningSongs(callback, data) {
        req('GET', '/friendsListeningSongs', data, callback);
    }

    function addFriend(callback, data) {
        req('POST', '/addFriend', data, callback);
    }

    function removeFriend(callback, data) {
        req('POST', '/removeFriend', data, callback);
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
        removeFriend
    };

})();