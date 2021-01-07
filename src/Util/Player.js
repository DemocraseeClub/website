class Player {
    constructor () {
        this.internals = new PlayerInternals();

        // FIXME: Add support for the html5 Media api
        this.mode = 'legacy';

        this.playlist = null; // FIXME: Get from global object
        this.track = null;  // FIXME: Get from global object

        this.internals.SetPlayback(this.playlist, this.track);
    }

    GetPlaying () {
        return {
            index: this.index,
            playlist: this.playlist
        };
    }

    // Set the current playlist
    SetPlaylist (playlist, index) {
        if (!playlist)
            return -1;

        this.playlist = playlist;

        if(index)
            this.SetIndex(index);

        this.internals.SetPlayback(this.playlist, this.track);
        return this.GetPlaying().playlist;
    }

    // Set the current track
    SetIndex (index) {
        if (!index)
            return -1;

        this.index = index;

        this.internals.SetPlayback(null, this.track);
        return this.GetPlaying().index;
    }
}

class PlayerInternals {
    constructor () {
        this.playlist = null;
        this.index = null;

        this.audio_element = null; // TODO
    }

    SetPlayback (playlist, track) {
        if (playlist)
            this.playlist = playlist;

        if (track)
            this.track = track;


    }

    SetMP3 (src) {

    }

    onNextSong () {
        this.index += 1;
    }
}

export default (new Player());