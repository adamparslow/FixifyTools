import SpotifyApi from './spotifyApi.js';
import { getToken } from "./refreshTokenStorage.js";

const api = new SpotifyApi(getToken());

api.getPlaylists().then(playlists => console.log(playlists.length));