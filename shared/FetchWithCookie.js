
export async function getNumUnread(){
    var myHeaders = new Headers();
    myHeaders.append("authority", "boardgamegeek.com");
    myHeaders.append("sec-ch-ua", "\"Google Chrome\";v=\"89\", \"Chromium\";v=\"89\", \";Not A Brand\";v=\"99\"");
    myHeaders.append("accept", "application/json, text/plain, */*");
    myHeaders.append("sec-ch-ua-mobile", "?0");
    myHeaders.append("user-agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36");
    myHeaders.append("sec-fetch-site", "same-origin");
    myHeaders.append("sec-fetch-mode", "cors");
    myHeaders.append("sec-fetch-dest", "empty");
    myHeaders.append("referer", "https://boardgamegeek.com/geekmail");
    myHeaders.append("accept-language", "en-US,en;q=0.9");
    myHeaders.append("cookie", global.cookie);

    var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow',
    credentials : 'omit'

    };

    let response = await fetch("https://boardgamegeek.com/api/geekmail/messages?metaonly=1&numunread=1", requestOptions)
    let rJson = await response.json()
    global.numUnread = rJson.numunread
}