const badWords = [
    "asshole",
    "bullshit",
    "bastard",
    "bitch",
    "cunt",
    "cocksucker",
    "shit",
    "slut",
    "turd",
    "twat",
    "dogshit",
    "fuck",
    "sex",
    "cock",
    "dick",
    "ass",
    "nigga",
    "pussy",
    "penis",
    "penus",

].join('|');

const badWordsRegex = new RegExp(badWords, "i");
module.exports = badWordsRegex;