export interface PartialArtist {
    id: number;
    name: string;
    musicBrainz: string;
}


export class LidarrArtist {
    ids: ArtistIds;
    name: string;
    ended: boolean;
    disambiguation: string | null;
    links: ArtistLink[];
    overview: string | null;
    kind: string | null;
    members: any[];
    artwork: LidarrArtwork;

    constructor(data: any) {

        this.ids = {
            lidarr: data.id,
            metadata: data.artistMetadataId,
            musicBrainz: data.mbId,
            discogs: data.discogsId,
            audioDatabase: data.tadbId,
            allMusic: data.allMusicId,
            foreignArtist: data.foreignArtistId
        };

        this.name = data.artistName ? data.artistName : "Unknown Artist";
        this.ended = data.status !== "continuing";
        this.disambiguation = data.disambiguation;
        this.links = data.links ? data.links : [];
        this.overview = data.overview;
        this.kind = data.artistType;
        this.members = data.members ? data.members : [];
        this.artwork = new LidarrArtwork(data.images)
    }
}

export interface ArtistLink {
    url: string;
    name: string
}

export interface ArtistIds {
    lidarr: number;
    metadata: number;
    musicBrainz: number | null;
    discogs: number | null;
    allMusic: string | null;
    audioDatabase: number | null;
    foreignArtist: string | null;
}


export class LidarrArtwork {
    banner: string | null;
    fanart: string | null;
    logo: string | null;
    poster: string | null;


    constructor(images: any[] = []) {
        if (images === null) images = [];
        let banners = images.filter(art => art.coverType === "banner");
        let fanart = images.filter(art => art.coverType === "fanart");
        let logo = images.filter(art => art.coverType === "logo");
        let poster = images.filter(art => art.coverType === "poster");

        this.banner = (banners[0] ? banners[0] : { remoteUrl: null }).remoteUrl
        this.fanart = (fanart[0] ? fanart[0] : { remoteUrl: null }).remoteUrl
        this.logo = (logo[0] ? logo[0] : { url: null }).remoteUrl
        this.poster = (poster[0] ? poster[0] : { remoteUrl: null }).remoteUrl
    }
}

// export class LidarrQualityProfile {}



export interface PartialAlbum {
    id: number;
    title: number;
    release: {
        available: boolean;
        date: Date;
        group: string;
    },
    quality: {
        name: string;
        version: number;
    }
}

export interface AlbumIds {
    lidarr: number;
    foreign: string | null,

}

export class LidarrAlbum {
    ids: AlbumIds;
    artist: LidarrArtist;
    // monitored: boolean;
    // secondaryTypes: string[];
    // mediumCount: number;
    // release

    constructor()
}


