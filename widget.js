let totalMessages = 0, messagesLimit = 0, nickColor = "user", removeSelector, addition, customNickColor, channelName,
    provider;
let animationIn = 'bounceIn';
let animationOut = 'bounceOut';
let hideAfter = 60;
let hideCommands = "no";
let ignoredUsers = [];
window.addEventListener('onEventReceived', function (obj) {
    if (obj.detail.event.listener === 'widget-button') {

        if (obj.detail.event.field === 'testMessage') {
            let emulated = new CustomEvent("onEventReceived", {
                detail: {
                    listener: "message", event: {
                        service: "twitch",
                        data: {
                            time: Date.now(),
                            tags: {
                                "badge-info": "",
                                badges: "moderator/1,partner/1",
                                color: "#5B99FF",
                                "display-name": "StreamElements",
                                emotes: "25:46-50",
                                flags: "",
                                id: "43285909-412c-4eee-b80d-89f72ba53142",
                                mod: "1",
                                "room-id": "85827806",
                                subscriber: "0",
                                "tmi-sent-ts": "1579444549265",
                                turbo: "0",
                                "user-id": "100135110",
                                "user-type": "mod"
                            },
                            nick: channelName,
                            userId: "100135110",
                            displayName: channelName,
                            displayColor: "#5B99FF",
                            badges: [{
                                type: "moderator",
                                version: "1",
                                url: "https://static-cdn.jtvnw.net/badges/v1/3267646d-33f0-4b17-b3df-f923a41db1d0/3",
                                description: "Moderator"
                            }, {
                                type: "partner",
                                version: "1",
                                url: "https://static-cdn.jtvnw.net/badges/v1/d12a2e27-16f6-41d0-ab77-b780518f00a3/3",
                                description: "Verified"
                            }],
                            channel: channelName,
                            text: "Howdy! My name is Bill and I am here to serve Kappa",
                            isAction: !1,
                            emotes: [{
                                type: "twitch",
                                name: "Kappa",
                                id: "25",
                                gif: !1,
                                urls: {
                                    1: "https://static-cdn.jtvnw.net/emoticons/v1/25/1.0",
                                    2: "https://static-cdn.jtvnw.net/emoticons/v1/25/1.0",
                                    4: "https://static-cdn.jtvnw.net/emoticons/v1/25/3.0"
                                },
                                start: 46,
                                end: 50
                            }],
                            msgId: "43285909-412c-4eee-b80d-89f72ba53142"
                        },
                        renderedText: 'Howdy! My name is Bill and I am here to serve <img src="https://static-cdn.jtvnw.net/emoticons/v1/25/1.0" srcset="https://static-cdn.jtvnw.net/emoticons/v1/25/1.0 1x, https://static-cdn.jtvnw.net/emoticons/v1/25/1.0 2x, https://static-cdn.jtvnw.net/emoticons/v1/25/3.0 4x" title="Kappa" class="emote">'
                    }
                }
            });
            window.dispatchEvent(emulated);
        }
        return;
    }
    if (obj.detail.listener === "delete-message") {
        const msgId = obj.detail.event.msgId;
        $(`.message-row[data-msgid=${msgId}]`).remove();
        return;
    } else if (obj.detail.listener === "delete-messages") {
        const sender = obj.detail.event.userId;
        $(`.message-row[data-sender=${sender}]`).remove();
        return;
    }

    if (obj.detail.listener !== "message") return;
    let data = obj.detail.event.data;
    if (data.text.startsWith("!") && hideCommands === "yes") return;
    if (ignoredUsers.indexOf(data.nick) !== -1) return;
    let message = attachEmotes(data);
    let badges = "", badge;
    if (provider === 'mixer') {
        data.badges.push({url: data.avatar});
    }
    for (let i = 0; i < data.badges.length; i++) {
        badge = data.badges[i];
        badges += `<img alt="" src="${badge.url}" class="badge ${badge.type}-icon"> `;
    }

    /* Define username */
    let username = data.displayName;
    if (nickColor === "user") {
        const color = data.displayColor !== "" ? data.displayColor : "#" + (md5(username).slice(26));
        username = `<span style="color:${color}">${username}</span>`;
    }
    else if (nickColor === "custom") {
        const color = customNickColor;
        username = `<span style="color:${color}">${username}</span>`;
    }
    else if (nickColor === "remove") {
        username = '';
    }

    addMessage(username, badges, message, data.isAction, data.userId, data.msgId);
});

window.addEventListener('onWidgetLoad', function (obj) {
    const fieldData = obj.detail.fieldData;
    animationIn = fieldData.animationIn;
    animationOut = fieldData.animationOut;
    hideAfter = fieldData.hideAfter;
    messagesLimit = fieldData.messagesLimit;
    nickColor = fieldData.nickColor;
    customNickColor = fieldData.customNickColor;
    hideCommands = fieldData.hideCommands;
    channelName = obj.detail.channel.username;
    fetch('https://api.streamelements.com/kappa/v2/channels/' + obj.detail.channel.id + '/').then(response => response.json()).then((profile) => {
        provider = profile.provider;
    });
    if (fieldData.alignMessages === "block") {
        addition = "prepend";
        removeSelector = ".message-row:nth-child(n+" + (messagesLimit + 1) + ")"
    } else {
        addition = "append";
        removeSelector = ".message-row:nth-last-child(n+" + (messagesLimit + 1) + ")"
    }

    ignoredUsers = fieldData.ignoredUsers.toLowerCase().replace(" ", "").split(",");
});


function attachEmotes(message) {
    let text = html_encode(message.text);
    let data = message.emotes;
    if (typeof message.attachment !== "undefined") {
        if (typeof message.attachment.media !== "undefined") {
            if (typeof message.attachment.media.image !== "undefined") {
                text = `${message.text}<img src="${message.attachment.media.image.src}">`;
            }
        }
    }
    return text
        .replace(
            /([^\s]*)/gi,
            function (m, key) {
                let result = data.filter(emote => {
                    return html_encode(emote.name) === key
                });
                if (typeof result[0] !== "undefined") {
                    let url = result[0]['urls'][1];
                    if (provider === "twitch") {
                        return `<img class="emote" " src="${url}"/>`;
                    } else {
                        if (typeof result[0].coords === "undefined") {
                            result[0].coords = {x: 0, y: 0};
                        }
                        let x = parseInt(result[0].coords.x);
                        let y = parseInt(result[0].coords.y);

                        let width = "{emoteSize}px";
                        let height = "auto";

                        if (provider === "mixer") {
                            console.log(result[0]);
                            if (result[0].coords.width) {
                                width = `${result[0].coords.width}px`;
                            }
                            if (result[0].coords.height) {
                                height = `${result[0].coords.height}px`;
                            }
                        }
                        return `<div class="emote" style="width: ${width}; height:${height}; display: inline-block; background-image: url(${url}); background-position: -${x}px -${y}px;"></div>`;
                    }
                } else return key;

            }
        );
}

function html_encode(e) {
    return e.replace(/[<>"^]/g, function (e) {
        return "&#" + e.charCodeAt(0) + ";";
    });
}

function addMessage(username, badges, message, isAction, uid, msgId) {
    totalMessages += 1;
    let actionClass = "";
    if (isAction) {
        actionClass = "action";
    }

    /* Create message */
    const element = $.parseHTML(`
    <div data-sender="${uid}" data-msgid="${msgId}" class="message-row {animationIn} animated" id="msg-${totalMessages}">
        <div class="message-container">
        
            <!-- Left side icon -->
            <div class="message-icon">
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 340 515.61">
                  <defs>
                    <style>
                      .cls-1 {
                        filter: url(#outer-glow-3);
                      }
                
                      .cls-1, .cls-2, .cls-3, .cls-4 {
                        stroke-width: 0px;
                      }
                
                      .cls-1, .cls-2, .cls-4 {
                        fill: #fff;
                      }
                
                      .cls-1, .cls-4 {
                        opacity: .6;
                      }
                
                      .cls-5 {
                        isolation: isolate;
                      }
                
                      .cls-3 {
                        fill: #494fae;
                        filter: url(#outer-glow-1);
                      }
                
                      .cls-6 {
                        mix-blend-mode: screen;
                        opacity: .75;
                      }
                
                      .cls-4 {
                        filter: url(#outer-glow-2);
                      }
                    </style>
                    <filter id="outer-glow-1" filterUnits="userSpaceOnUse">
                      <feOffset dx="0" dy="0"/>
                      <feGaussianBlur result="blur" stdDeviation="22"/>
                      <feFlood flood-color="#fff" flood-opacity=".75"/>
                      <feComposite in2="blur" operator="in"/>
                      <feComposite in="SourceGraphic"/>
                    </filter>
                    <filter id="outer-glow-2" filterUnits="userSpaceOnUse">
                      <feOffset dx="0" dy="0"/>
                      <feGaussianBlur result="blur-2" stdDeviation="22"/>
                      <feFlood flood-color="#fff" flood-opacity=".75"/>
                      <feComposite in2="blur-2" operator="in"/>
                      <feComposite in="SourceGraphic"/>
                    </filter>
                    <filter id="outer-glow-3" filterUnits="userSpaceOnUse">
                      <feOffset dx="0" dy="0"/>
                      <feGaussianBlur result="blur-3" stdDeviation="22"/>
                      <feFlood flood-color="#fff" flood-opacity=".75"/>
                      <feComposite in2="blur-3" operator="in"/>
                      <feComposite in="SourceGraphic"/>
                    </filter>
                  </defs>
                  <g class="cls-5">
                    <g id="Warstwa_1" data-name="Warstwa 1">
                      <path class="cls-2" d="M165.3,365.66c5.26-1.2,10.61-.46,15.91-.64-.01,15.8-.02,31.61-.03,47.41-5.31.06-10.61.33-15.85,1.29,0-16.02-.02-32.04-.03-48.05Z"/>
                      <path class="cls-2" d="M181.27,302.76c-5.36.18-10.65-1.07-16.02-.64.01-14.74.03-29.49.04-44.23,2.37.51,4.76.63,7.18.66,2.95.03,5.79-1.12,8.76-.66.01,14.96.02,29.91.04,44.87Z"/>
                      <path class="cls-2" d="M192.21,492.56c-1.21-6.3-5.06-10.44-10.7-13.13,0,0,0,0,0,0-2.77-1.78-5.88-1.85-9.01-1.71-8.14.18-13.92,4.32-16.74,11.61-2.59,6.71-2.26,13.58,3.04,19.35.65,1.23,1.46,2.28,2.9,2.63,3,2.93,6.67,4.19,10.81,4.21,1.49.11,2.95.16,4.44-.16,10.98-2.35,16.42-10.44,15.27-22.81Z"/>
                      <path class="cls-3" d="M79.4,134.92c1.52,2.29,4.01,3.7,5.47,6.05-.29,1.03-.78.57-1.43.31-3.03-1.22-5.7-3.29-8.99-3.88-1.46-1.98-3.56-3.47-4.42-5.89,2.99,1.11,5.99,2.22,8.98,3.33.13.03.26.06.39.09Z"/>
                      <g>
                        <image class="cls-6" width="249" height="263" transform="translate(0 39)" xlink:href="data:image/png;base64,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"/>
                        <image width="138" height="152" transform="translate(55 95)" xlink:href="data:image/png;base64,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"/>
                      </g>
                      <g>
                        <image class="cls-6" width="248" height="263" transform="translate(92 39)" xlink:href="data:image/png;base64,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"/>
                        <image width="138" height="152" transform="translate(147 95)" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIsAAACYCAYAAADUWxrKAAAACXBIWXMAAAsSAAALEgHS3X78AAASbklEQVR4nO2dbXekuA6E1ZPZ3f//d3c2k/sh0USprpJksKE7F53jgzHdIMxDSTb9YnbZZZdddtlll1122WWXXXbZZZdddtlll1122WPa7WwHzrC3t7ep53273d5m7u9R7dvCMhuILfbdIDq9Q2fZI8BR2bPD8/AdnNkGQFae7zAIzwbP08EyAEjndXvPv3OxW0A8AzhPAUsTEPWa6r1b+yC7uGpbCcQjQ/PQsDQgYdu7bVl710agwLYUikeE5iFhKSDBbR04Ou/ZalvAaIPzSNA8FCw7IOlsWwFMdtFH62z9jz0CNA8DSwJKB4oKjqytOmY3N2F1XKq2bF+fTp0MzOmwbIAkgyAuO6/Deteqix/bFDhblMfMzoPmVFgEKFvA8KWqq9fhMbo2AsYIOG1ozgDmNFgGQBmBolpn72HHlm6TegZGtc7qbIn1d4cPBuYUWAgomZpUYFTtFUzsuNJ1Us/AwKK2W1LHY32xI4E5FJaNatKBYbQYqTN/vrifLGcV3B87HtbfnT4AmsNgKUBhatIB5EezrQMO+nR3CmQ5Un4X6x3FYX58Or4YmJ8rd15YlZN0IPnRbNsLDF6sUTh+f/gS227kdb5uYTv6cYPlYXaIsiQ5SgcUvOA/7B6Mqq0DTvSDnkZYdiBhy99Je0dx0I+4fD+BheqyXFl2gKJUA8FQRUG0FZgsScWLjVCwEhXiFl5vsC/0AZXli8K8vb3dVgGzVFmaoGAdIemA8VJsZ0qTAUNPJywZLBUcXl6L7ZXaGKnH5XtnLgBmGSwbQOlCgmC8iGUFzhZY2J0/AgguM4AyaJg/cfneqZOBOSrB3QKKUpAXsv5Ctneg6YQiNQpSoUfB8frh0+vH8eO2W1jGsOTm9Zgku5+HJb1LYBl4elyB0gEjKxU0mbJ4vQo/CAsCgiUeP4KDwKAhMO6TBGR2/jIdlkb48TpLaJWKMBB+FusIDYKjwhH62slVEJas/BeWERQvr6xfPywOq9G/5Qnv6jDUHfEoUBQkP+0rILFNgYPAZLkLWjdX6QDyYp+g+JL5oKCJczbo49JwNBWWxiztiKKwC/+zKAycLCwxYKLPZvlwOYMlAvLT7kHx8h85fmU+9EZbGo5WKsto2FGgIAR/ibqCRykMAwb9jqZylTiSYaB4UT50R2PRD/c55i5uy9RlGiyNh4SxjYGjQInlr7D8i7R1gOmEorvTC8tOUvufKL9sHBY1g4sTe/H1d6DMUJdVyrJFVSIwDBIEhRWmOF116V4wpSwYgiIgEZRfybGZ4QWO0FRwT1WXKbCAqnRHPwgOjnwQlFj+FutKYWLuU+Ut6HsnuVW5yq+P4+4BRZUfYZmFo8+d7VSXI0ZD2UhoFJS/7ROMWO8CM1NZMli8RFDw2HtAicBk4ciMQLPVdsMyoCqxHu9oBQoC83dSUG0YMGfAokBBJVPH6RT0+7lmcD8MIUHJ3wrKP5ZDw4BZGYZizoIJ7V5Q8FkRbvNQ5PvD5HZqKNoFS/Njkhh6WAhiE2wqBCEwXme5zBZlwXNg8ywdZanCz5euFAWP4/tgoLjfMRxNDUUzlaUKPdlIqAJGQcJUZhSWUWXJYMnyFBXm1ChLlQiMAmVJKJodhrYMmdX8ispV/oGiwlEnDCEo3ZwFw5CXOFOLI5848cf2q+ZtvF8qYNqhaKtthkUktl5XqsKGyxkoWShCtfnH7kNRNXRmsOD5KGWJ8yyxKPW660K7h47Bhx9twJIBE/3/A83WvOXI6X68OFVyi9CMqIuCBZPb6JP7qS6sL7N5FlcVlRP5PpSavH74zeCLwKibMPb39FC0MmfxZZbgIjDsGZCaX1EJb5WzdIbNo8ryEpbxQSHup6MmUVEUfNHvOCm3NBRtgmVSCGKhSD0D6sy1ZLAoZYk+xXOpYIkXHENElfcwNWGqmg29FehVKNplK58NbQWlylsqcBQsW5Nbs3qupTuHEiHxcOMjqD3PsTLfp9ksWCqlUSOhUWjYrC0CgrBgclvdmcyq4bOarzF4PeYl6vlV9LXrdydv2RWO9sJShaBYR3DYXcTkuPswkRV1AbK7FM8LQTH7+mk1hyCeL8tvcOIO55ZQ+bKZ3wzwGIakbRkRDcPS/FHArFTzLLET2ccORj+uUE25Z8mtGYcl5gReXuE9DspP+8xt8KZgCX6mwJWqLA1FM8JQJwRloGTzLag26jMrWHA2WA2ZK1DcEJib3c+g+vYXuw9TKg+pAKnAWJ6nRJuZs2QhCOc0MmB+2j00W0oWgmJyiz4rw9GQAxPNQfHz8RDVAWOrgmS+78pR0M6Y7u+EolEY1EiiOwpC39HivAU+9fXtP4wnu2q9qxwqn3psZUnmVwzaM2i6o6IsLGVLJfdMVRAUla/coB4TXN/fG2nLoBkBI6ujLQNo9XR/VrqgKHgy9cClAqVSFpRxX8e7exQA9n7Wdw9ls4fOsZ4pjApHW+DBfCBTkZFREDP2+RGmTgo8tY55xZtoU69Xr5tqs0ZDWUdlyqKAUXMNrL4lafRcI5N9s6+5yo204fsy4PBix4Lt7D3YxoBaaj/ql2yyrjRXysKGmEpFRnOCCnKzHAIVQjKLF5h9RqZTsn2ybdNsJiyqY/dC01UMpVQdaNBXdV4VHF0Q1Gdq98CzXGVmK0unoxkgqi0LJSqkddSkyjO6+Qu7cAqO+PARJ+2ytgqUw4DZCkvVmdkFycBhF17B1FEPPD47B3UuLH+p8oQMEgbDSBkBJgtZ7ye34ZNyq3IWtxFgRpWiCi/Z8XH7qHVCTAYJ+1mw6rfm2H47Oc00Ww1LtOyCzSx4DJWbzDKWc2QfvVSfjvsN9S3AWFLfbUfAoi6SSiZHVEi9D4/H4FitKgiJAgeB6ahMJ8mdnsusgCW7u7E9rmcXn4Gl9sXa91jW6V1gMkA6ZSTpXRaKZsGiksfZ+xlVlmr/mbGkMdZZIjsTkG5IOmwYfWTOcrZ1YELrKAmDRl1oBUT8fvQIKN3c5cu5bP2u86PDok6KdUTVAWyY2fVBHa8aDiMM7MvzCAiud0MRO9ct5yttFiyqI9VYP5N43OcIFJ3tHetA2lWXqihoGChs5PV0OUtmI9BgeyWp3X3PsG4IykLPiKo8VAgyOzYMZcnYaDGxD9aObbhNtSspHwWkqywjoyEEpeP3bjszZ9kCyQhIGSijPqp6BQ3mLVnoyXIVBUyEZu+5lrYVlsqpKq5nUo51bOtKMfrZVRx1Pl3/ERSV6FZKwkJRds5LQ5DZfGXpSHe3wxEY7KQtnYcdqXweOY9VIWgPMOj3FJsJi+roDjRKYjtlBMTMdwZRBtxeaLaGoE2J7QxblbNsgWS0ZEqkANnSkdl5dPysQMmS2S4g5bnN+O3+GbBUZI9CgnfUK9mWdejI3cc6ULUp5anUpaM2LL/pQqN8nm57YRmJ7SPgZB1Y3YmjYYmdQ6ZM2Tmwc6qgUCGHTcapm8Hs3t8/9Wf5vyEz3rEdCe/CkZX40DF2pj8fegvbuv6Pgp/dBNk21VcZ+Gb5ueyyIWUBQpVTnbuvG9u7RV2ALaFo6zmOgqLUZiT0HKYqZvOVxe9Ur4926kgiiOXF7js3Uxc3piwjIWgUmk64qdYV0MtUxWweLFHeGfFVh3aHmB2A2DcGIji/7V5R48cWKnBmQqNKBokKP8tt1mioUx9VFQREPeYfGXpmd6eCnL2GgYHn14UG318piRn3NW4zs7khyGxdgtvt2A4cWcFfdYzq4qryavefpMOOzj4Qpe5kdV5MFRgEFTAdNTksBJltUJZGktvp0E6e0gWGvU8ljOoiqjt3VGEYONVxM+Vjxz3NZiqLn0jMW7ADf1g/sc3+Z/AntLmyVH+Bi6Zulg4Q7LUZlJWCZCGIhZ30Rp0dgszmJrg4dxG3VcoSgckA8ZL96ZMX/wvcGIrM7qFRMHUUpZOAKpXphhwE5TSbAQvC4W0dZfEhbwQFVSP+zyD+AhQqi/qyvJGlW6UuHSAURFUIqoAxuwekqzLTbRMst9vtTfzEqQpFcdjaCUEOAoLiy+zHBbPfjrt9HAM7t0qAO4rRgUGFmix3Qj9w22E2O2dh0+jqrotzIgwYz0HwH0yzH0FmcyydkQ5ToCzkdFVCJbQdVRkNQX+2r8hXzNbkLLHNl5lMY74ScxH1F3Lq58JUCDL7qh5vH+9B//E1lTpkIWdPfpKpyOGK4rYZlkYoMtPhKOYuLG9xADqQZArjPqgZWodGqZCCG4sKM1uBweOj76cAs/LZUFyPoHjdww8uR4DJfqfFLVO8F/sMQ9H3qC5+gUefeGehq5s0o8+n2sqcxYwnizHZ9YQzDndjoorAVD8Vxgr6GH15S/aBPmMyzob9bEpAqVAHjipnORSiXbCIUJRBg+ri0ChgRkoHFAYuy3eiRUVgT4uxbVSBGECx77JzUK9bYqs/omCWq0scTu8BpqsoXv9tn//WEYHx3AXfGy9s9+sc6mMI3RCUgfOcOcsOdYnLPcBk0/l+/NjpmJB6wf3h+zEMsafgLEwpUCpo4vHNmoCsGjabrXnq3FEXDEfxyXC8wzNgmJJk4LCE0+dtfETGRkUIlnrQ2VWZUWgQntNsCiwD6uJ1DEWe6Mb1+Gynk8SqIXI8HqqEhyI288v89ffh44jqiTiqTISH+acURkFzCEwrP8/CQFHzLghMBkZW4vGxsETVL2D8xe4sb8EwFEH5ZRyc+LGJjso8ZL5iNhGWhrr4ui+7CtMFJB6DqUpUhviHlg4L/kFE3DeCFmH41zQoXWBGE9xTbOVXQZS6+Domu24jwKjjxmNgCEFg/MElKgtCjiOiV/uEJAKTKUw1tK6AYfXDbCoshbqwUZFP+1vY9mo1MMpU+MGCf5XrM8ZqvoWNiGL4+TcsEZwqCVZhCM8n+sLqy231l8wiKCrZdVjicPo1tHVGOr6vDBS8yOpPwitYMBRFdWGgZMBUeQse/1SbDgtRlyoc+TJCo/KXyjJFYR+DwP9+7szk+kXGEdG/ULrAdPIX7C9qK+dYzBYpSzMcmd3DgvnLiHWVJYLi+Qr+hxECivuMCauDgKFIJb6Y7HZAyfKVwxTniO86m/Fw5O1mOn9h9ewYW0BRfxTOYMd9slFRpjBq/qVKdKMPrH6ILYNlMBx52xZV2aMoo7Bgkstyl1nAZNCcYkuVZSAcmXF16VhnBMSAYaDEWVw10af2iUPnbGQ0mrOcDorZcWHIDcORAqarMl1QfKjsw+UqBLGJOfcvJrmZuuAcDCa6o6CkYWl1cmt2ACxJOKqG05nKsA6sVAXnVrI/DVewVMPxCAQDp5PkPuyU/yHK0shfospEUKqwpO5ENVxGUOKQeQssODJiwOBzIwZKNjmnRkGH22FhqJG/RHi6wChQ4gebWH5RqUoGS6YuqDLqqXQXFLN7SJTaLLejc5ZoKn9hjwMQmCoM4QWN3x7wr5goWPCpN/pcqVf2eRcFjFKUFhBH5CtmB8PSyF8yYLInzFXuEn+Sg0HCnjiziTkj+8dkl0HDlqNPn2lie6QdriwbgfG7HdWlA4pfSAZI5x/n0bJjMGgYINkcSzYCuoPkKFUxOykMDQATLarMm31+QInB4q+LoERgHAyV1MZJOaUsDJgICwOHbUdIEJjYR0baD7PONPoyIwkvXiD2xBlzCsw1YmHK0fmOdEdZVH70SuoMDpWvqLzlDpYjVcXs3AS3qzBq8g7zCZ/MYyrjIPkvWjK4WGLbzZOYwqgwxeZUsiGzGQHlDDtVWdwaCuP1qiAErI0pEVMsPP4fd0XBi68Ke60CBUPfZ2ccrCpmDwKLWQpMrOOFrICpQhZux/Cj+kfBwkJTB44KlLh8d+z/GRYzCoxZL4/xdXbhsa2CpKMsvuxAk6lHNz85HRSzB4PFrA2M1yuV6YSsDJJMWXyZAVO1PQ0oZg8Ii1kJTKx3w5Nq7ygK+qLyidGC71X7/mIXLMQEMGb5BVVw4Hr1Gna8P66RegZBB5DWyOdMUMweGBa3AZWJdRVSFBjd8HPnHll2oMjUBOvvDp0MitkTwGLWUhlVHwFjFJQ/7iXLzjZL6u8OPQAoZk8Ci1tDZXC9A0QnT5EukXon/2ipidnjgGL2ZLCYtVUG17sKpPYl3RHrnRzkKdQk2tPB4rYRmi3rpSsD69Vr3x14QFDMnhgWtwQasx4I3TZ6+I1tEoZHBcXsG8DiNgjN1va7w05qf2hI3L4NLG4FNG5bwJKH3LP9GSBx+3awuDWhcZvVD+0L/0yQuH1bWKINgrPMnhGQaA/RiUfbkfA8OyDR/i9hQZsFz3cC47LLLrvssssuu+yyyy677LLLLrvssssuu+yyyy77lvY/vTkNgGkvThIAAAAASUVORK5CYII="/>
                      </g>
                      <path class="cls-2" d="M281.22,124.6c-.17-1.21-.22-2.44-.51-3.61-2.46-9.89-10.38-16.34-21.86-17.89-3.27-.99-6.7-1.04-10.05-1.6-10.18-1.7-20.42-3.04-30.66-4.41-1.86-.25-2.83-1.06-3.62-2.71-6.23-13-12.5-25.98-19.29-38.69-1.4-2.61-2.97-5.1-5.35-6.96h0c-1.5-2.05-3.73-3.03-5.94-4.04-4.32-2.52-9.16-1.87-13.83-2.26-2.83.11-5.4,1.08-7.88,2.36-3.03,1.33-5.77,3.09-7.7,5.83-6.77,9.61-10.89,20.6-16.04,31.06-2.42,4.1-4.4,8.41-6.39,12.72-.4.87-.58,1.9-1.82,2.08-10.17,1.47-20.36,2.89-30.51,4.48-4.99.78-10.05,1.15-14.95,2.44-5.48,1.07-10.23,3.42-13.74,7.92-2.29,2.58-4.21,5.38-4.95,8.82,2.8,1.75,5.62,3.49,8.4,5.27-2.78-1.78-5.6-3.52-8.4-5.27-.71,1.22-.92,2.56-.9,3.95,0,1.32-.02,2.63-.03,3.95-.16,7.73,2.9,13.92,8.92,18.71,9.27,9.51,18.81,18.75,28.49,27.85,1.93,1.82,2.3,3.41,1.84,5.93-2.3,12.88-4.37,25.8-6.52,38.7-1.14,3.68-1.34,7.42-.51,11.16,3.62,16.24,20.34,24.46,35.31,17.19,8.54-4.15,16.89-8.71,25.32-13.09,1.44-.75,2.95-1.37,4.16-2.51,3.24-.96,6.05-2.83,8.89-4.52,1.62-.96,2.67-.86,4.2-.01,12.71,7.09,25.64,13.77,38.65,20.29,3.36,1.68,6.95,2.93,10.86,2.43,12.07.54,22.32-8.06,23.96-20.11.53-2.35.42-4.73.32-7.1-.33-7.64-2.47-15.02-3.41-22.59-.91-7.31-2.45-14.54-3.72-21.8-.22-1.27-.04-2.06,1.11-3.09,4.08-3.66,7.88-7.63,11.78-11.48,1.24-1.14,2.5-2.25,3.7-3.43,4.58-4.51,9-9.23,13.78-13.48,6.92-6.14,9.71-13.5,8.92-22.49ZM265.78,136.47c-1.53,1.93-3.2,3.19-4.42,3.96-.48,1.68-1.94,2.57-3.13,3.58-1.9,1.62-3.59,3.44-5.38,5.18-2.3,2.31-4.6,4.62-6.9,6.93.03.61.29,1.1.7,1.45-.41-.35-.67-.84-.7-1.45-4.68,4.46-9.43,8.86-14.02,13.41-2.29,2.27-2.6,5.12-2.33,8.35.69,8.07,3.07,15.85,3.77,23.89.02.23.2.44.31.67.38,6.76,2.46,13.24,3.29,19.93.71,5.78-.93,12.58-6.75,14.6-1.81,1.13-3.89,1.15-5.91,1.4-3.01-.28-5.59-1.72-8.2-3.05-5.33-2.73-10.64-5.51-15.95-8.27-7.1-3.85-14.19-7.71-21.31-11.54-3.3-1.78-6.85-1.93-10.16-.4-4.36,2.02-8.51,4.49-12.74,6.79-.27.15-.44.47-.66.7,0,0,0,0,0,0-2.99.69-5.33,2.72-8.09,3.91-1.57.68-3.11,1.43-4.66,2.15-1.75,1.67-4.07,2.35-6.15,3.44-3.46,1.82-6.97,3.57-10.51,5.26-2.87,1.37-5.76,1.21-8.57-.29-5.3-.71-9.79-9.28-7.96-14.34.78-2.17.75-4.63,1.09-6.96h0c1.09-3.72,1.01-7.7,2.46-11.35,1.02-7.71,2.18-15.4,3.65-23.03.41-2.15.92-4.29.74-6.51-1.01-4.21-3.94-7.05-7.09-9.68-1.7-1.42-3.29-2.93-4.72-4.61-2-1.95-3.99-3.91-5.99-5.86-1.07-.36-1.77-1.13-2.33-2.07-2.32-1.96-4.5-4.05-6.46-6.37-1.94-1.77-3.88-3.55-5.82-5.32-.34-.45-.91-1.17-1.65-2.02-1.85-2.11-2.76-2.64-3.82-4.03-.61-.79-1.41-2.06-1.99-3.95-.64-.2-1.26-.44-1.85-.72.59.28,1.21.52,1.85.72-.17-1.48-.34-2.95-.51-4.43h0c.22-1.57.63-3.08,1.46-4.44.15-1.17,1.13-1.9,1.52-2.93h0c2.42-2.09,5-3.85,8.36-3.97.7-.8,1.64-.37,2.47-.49,6.34-.98,12.67-1.98,19.02-2.95,6.18-.94,12.37-1.84,18.56-2.75.56-.08,1.13-.23,1.69-.2,6.13.37,9.98-2.79,12.53-8,.47-.96.95-1.9,1.43-2.85,1.78-4.58,4.26-8.82,6.39-13.23,3.6-7.43,7.25-14.83,10.88-22.25,1.4-3.31,3.74-5.73,6.9-7.38-.16-.52-.33-1.03-.51-1.54.18.51.35,1.02.51,1.54,1.94-.54,3.94-.54,5.93-.57-.32-2.29-.78-4.52-1.65-6.61.86,2.09,1.33,4.32,1.65,6.61,2.64-.09,4.9,1.09,7.21,2.11,1.02,1.28,2.04,2.55,3.06,3.83,2.73,7.12,6.9,13.52,10.16,20.38,3.24,6.8,6.82,13.46,9.82,20.36,2.09,4.8,5.55,6.96,10.49,7.65,11.38,1.59,22.75,3.32,34.12,5,.67-1.23,1.8-1.95,2.89-2.72-1.09.77-2.22,1.49-2.89,2.72.55.7,1.33.23,1.98.38,4.34.69,8.77.99,12.85,2.9,3.46,2.12,5.24,5.21,5.41,9.25.03.73.1,1.45.16,2.18-.3,1.69-1.11,4.84-3.54,7.91Z"/>
                      <path class="cls-4" d="M153.44,111.09c-5.69-5.36-2.4-16.31-.48-22.71,2.89-9.61,9.8-23.32,14.46-22.29,5.79,1.29,4.24,24.59,4.13,26.24-.6,8.37-1.33,18.5-7.54,21.03-3.44,1.4-7.92.21-10.56-2.28Z"/>
                      <path class="cls-1" d="M142.66,128.68c-3,5.96-15.07,6.12-23.78,6.24-8.47.11-19.44.26-22.4-5.18-1.49-2.73-.57-6.13,1.06-8.34,3.13-4.23,9.44-4.76,18.78-5.42,11.36-.8,20.21-1.43,24.6,3.59,2.04,2.33,3.28,6.07,1.75,9.11Z"/>
                    </g>
                  </g>
                </svg>
            </div>
        
            <!-- User nick and badges -->
            <div class="user-box ${actionClass}"> ${badges} <a> ${username} </a> </div>
            
            <div class="user-message-container">
            
                <!-- Arrow svg -->
                <div class="user-message-arrow">
                    <svg
                       width="4.233345mm"
                       height="5.291667mm"
                       viewBox="0 0 4.233345 5.291667"
                       version="1.1"
                       id="svg1"
                       xmlns="http://www.w3.org/2000/svg"
                       xmlns:svg="http://www.w3.org/2000/svg">
                      <defs
                         id="defs1" />
                      <g
                         id="layer1"
                         transform="translate(-0.04434605)">
                        <path
                           style="fill:#556389;fill-opacity:1;stroke:#556389;stroke-width:0;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:0;stroke-dasharray:none;paint-order:stroke fill markers"
                           d="m 17.660672,1.2930289 h -2.072277 a 0.75982589,0.75982589 111.51617 0 0 -0.518513,1.3152348 l 2.602553,2.4296682 z"
                           id="path5"
                           transform="matrix(1.4877876,0,0,1.4130314,-22.015139,-1.8270898)" />
                      </g>
                    </svg>
                </div>
                
                <!-- Message -->
                <div class="user-message ${actionClass}"> ${message} </div>
            
            </div>
            
        </div>
    </div>`);

    if (addition === "append") {
        if (hideAfter !== 999) {
            $(element).appendTo('.main-container').delay(hideAfter * 1000).queue(function () {
                $(this).removeClass(animationIn).addClass(animationOut).delay(1000).queue(function () {
                    $(this).remove()
                }).dequeue();
            });
        } else {
            $(element).appendTo('.main-container');
        }
    } else {
        if (hideAfter !== 999) {
            $(element).prependTo('.main-container').delay(hideAfter * 1000).queue(function () {
                $(this).removeClass(animationIn).addClass(animationOut).delay(1000).queue(function () {
                    $(this).remove()
                }).dequeue();
            });
        } else {
            $(element).prependTo('.main-container');
        }
    }

    if (totalMessages > messagesLimit) {
        removeRow();
    }
}

function removeRow() {
    if (!$(removeSelector).length) {
        return;
    }
    if (animationOut !== "none" || !$(removeSelector).hasClass(animationOut)) {
        if (hideAfter !== 999) {
            $(removeSelector).dequeue();
        } else {
            $(removeSelector).addClass(animationOut).delay(1000).queue(function () {
                $(this).remove().dequeue()
            });

        }
        return;
    }

    $(removeSelector).animate({
        height: 0,
        opacity: 0
    }, 'slow', function () {
        $(removeSelector).remove();
    });
}
