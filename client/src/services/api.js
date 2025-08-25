import {restClient} from "./restClient";

async function updatePlayerInfo(userInfo) {
    return restClient.post("/api/players/update", {
        username: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl,
    });
}

export {
    updatePlayerInfo
}