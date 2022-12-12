import express from "express";
import querystring from "querystring";
import request from "request";
import { saveToken } from "./refreshTokenStorage.js";

const app = express();
const port = 3000;

const CLIENT_ID = "0b8b736927d84bd5b5c67942900e1e14";
const CLIENT_SECRET = "12b7f9badc0a4c2696b922583ece1965";
const REDIRECT_URI = "http://localhost:3000/callback";
const STATE_KEY = "spotify_auth_state";

app.get('/', (req, res) => {
   const state = generateRandomString(16);
   res.cookie(STATE_KEY, state);

   const scope = [
      "playlist-read-collaborative",
      "playlist-read-private",
      "playlist-modify-public",
      "playlist-modify-private",
      "user-read-private",
      "user-library-read",
      "ugc-image-upload",
      "user-follow-read",
      "user-follow-modify"
   ].join(" ");

   const query = querystring.stringify({
      response_type: "code",
      client_id: CLIENT_ID,
      scope: scope,
      redirect_uri: REDIRECT_URI,
      state: state,
   });

   res.redirect("https://accounts.spotify.com/authorize?" + query);
});

const generateRandomString = function (length) {
   var text = "";
   var possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

   for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
   }
   return text;
};

app.get('/callback', (req, res) => {

   const code = req.query.code || null;
   const state = req.query.state || null;

   if (state === null) {
      res.redirect('/#' +
         querystring.stringify({
            error: 'state_mismatch'
         }));
   } else {
      const authOptions = {
         url: 'https://accounts.spotify.com/api/token',
         form: {
            code: code,
            redirect_uri: REDIRECT_URI,
            grant_type: 'authorization_code'
         },
         headers: {
            'Authorization': 'Basic ' + (Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'))
         },
         json: true
      };
      request.post(authOptions, function (error, response, body) {
         if ((error) || response.statusCode !== 200) {
            console.log("ERROR");
            console.log(error);
            return;
         }

         const refreshToken = body.refresh_token;
         const scope = body.scope;

         saveToken(refreshToken, scope);
      });
   }

   res.send("We did it!");
});

app.listen(port, () => {
   console.log(`Example app listening on port ${port}`);
});