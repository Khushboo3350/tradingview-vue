import $lodash from 'lodash';
export const webSocketMixin = {
    data() {
        return {
            websockTime: "", //心跳
        }
    },
    created() {

    },
    methods: {
        /**
             * 获取推送数据 （取一个值就好）
             * e {string} load=加载 get=获取
             */
        webSocket(e) {
            const self = this;
            if (e == "get") {
                return;
            }
            if (typeof WebSocket === "undefined") {
                alert("您的浏览器不支持socket");
            } else {
                try {
                    self.websock.close();
                } catch (e) { }
                // 实例化socket
                self.websock = new WebSocket(self.wsUrl);
                // 监听socket连接
                self.websock.onopen = self.websockOpen;
                // 监听socket错误信息
                self.websock.onerror = self.websockError;
                // 监听socket消息
                self.websock.onmessage = self.websockMessage;
            }
        },
        //链接状态
        websockOpen(e) {
            const self = this;
            //   console.log("socket连接成功");
            this.websockSend();
            setTimeout(function () {
                self.websockHeartbeat();
            }, 1000);
        },
        //发送消息
        websockSend(msg) {
            if (msg) {
                this.websock.send(msg);
            } else {
                this.websock.send(
                    JSON.stringify({
                        req: "contractkline",
                        sub: `contract:KLineData:BTCUSDT:kline_${$lodash.find(this.tabsArr, { value: this.interval }).websockSend}_26`,
                    })
                );
            }
        },
        //错误
        websockError() {
            //   console.log("连接错误");
            this.websockClose();
        },
        //监听返回消息
        websockMessage(msg) {
            const self = this;
            let res = JSON.parse(msg.data);
            if (Array.isArray(res)) {
                let arrayData = [];
                res.map((item) => {
                    arrayData.push({
                        time: item.Date * 1000,
                        close: item.Close,
                        open: item.Open,
                        high: item.High,
                        low: item.Low,
                        volume: item.Volume,
                    });
                });
                self.onLoadedCallback(arrayData);
            } else {
                if (!res.hasOwnProperty("pong")) {
                    try {
                        self.onRealtimeCallback({
                            time: res.Date * 1000,
                            close: res.Close,
                            open: res.Open,
                            high: res.High,
                            low: res.Low,
                            volume: res.Volume,
                        });
                    } catch (e) { }
                }
            }
        },
        //心跳
        websockHeartbeat() {
            const self = this;
            self.websockTime = setInterval(function () {
                self.websockSend(JSON.stringify({ ping: new Date().getTime() }));
            }, 3000);
        },
        //连接关闭
        websockClose() {
            // console.log("socket已经关闭");
            clearInterval(this.websockTime);
        },
    }
}