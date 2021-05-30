RoCode.Youtube = class Youtube {
    constructor(youtube) {
        this.generateView(youtube);
    }
    init(youtube) {
        this.youtubeHash = youtube;
        this.generateView();
    }

    generateView(youtubeHash) {
        const movieContainer = RoCode.createElement('div');
        movieContainer.addClass('RoCodeContainerMovieWorkspace');
        movieContainer.addClass('RoCodeRemove');

        this.movieContainer = movieContainer;

        const url = 'https://www.youtube.com/embed/';
        const iframe = RoCode.createElement('iframe');
        iframe.setAttribute('id', 'youtubeIframe');
        iframe.setAttribute('allowfullscreen', '');
        iframe.setAttribute('frameborder', 0);
        iframe.setAttribute('src', url + youtubeHash);
        this.movieFrame = iframe;

        this.movieContainer.appendChild(iframe);
    }

    getView() {
        return this.movieContainer;
    }

    resize() {
        const container = document.getElementsByClassName('propertyContent')[0];
        const iframe = document.getElementById('youtubeIframe');
        const w = container.offsetWidth;
        iframe.width = `${w}px`;
        iframe.height = `${(w * 9) / 16}px`;
    }
};
