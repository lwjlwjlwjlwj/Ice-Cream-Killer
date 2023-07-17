const db = wx.cloud.database();

Page({
  data: {
    scanResult: '',
    matchedData: {},
  },

  scanCode: function () {
    let self = this;
    wx.scanCode({
      success: function (res) {
        let scanResult = res.result;
        self.setData({
          scanResult: scanResult
        });

        self.matchData(scanResult);
      },
      fail: function (res) {
        console.log(res);
      }
    });
  },

  matchData: function (scanResult) {
    let self = this;
    let id = parseInt(scanResult);

    db.collection('xuegao').where({
      id: id
    }).get({
      success: function (res) {
        if (res.data.length > 0) {
          let matchedData = {
            name: res.data[0].name,
            price: res.data[0].price
          };
          let matchedDataString = JSON.stringify(matchedData);
          self.setData({
            matchedData: matchedData,
          });
        } else {
          self.setData({
            matchedData: null,
          });
        }
      },
      fail: function (res) {
        console.error(res);
      }
    });
  }
});
