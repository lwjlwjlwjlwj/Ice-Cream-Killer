const db = wx.cloud.database();

Page({
  data: {
    scanResult: '',
    matchedData: {},
    showUploadButton: false,
    showModal: false,
    priceInput: '',
    userUploadPrice: []
  },

  scanCode: function () {
    let self = this;

    // 清空 userUploadPrice 数组
    self.setData({
      userUploadPrice: []
    });

    wx.scanCode({
      success: function (res) {
        let scanResult = res.result;
        self.setData({
          scanResult: scanResult
        });
      if (scanResult.length != 13) {
        self.setData({
          scanResult: '',
          matchedData: {},
          showUploadButton: false,
          showModal: false,
          priceInput: '',
          userUploadPrice: []
        })
        wx.showToast({
          title: '无效的条形码',
          icon: 'none',
          duration: 2000
        });
      } else {
        // 扫描结果符合要求，继续处理
        self.matchData(scanResult);
      }
      },
      fail: function (res) {
        console.log(res);
      }
    });
  },

  matchData: function (scanResult) {
    let self = this;
    let id = parseInt(scanResult); // 将 id 转换为数字类型

    db.collection('xuegao').where({
      id: id
    }).get({
      success: function (res) {
        if (res.data.length > 0) {
          let matchedData = {
            name: res.data[0].name,
            price: res.data[0].price
          };

          self.setData({
            matchedData: matchedData,
            showUploadButton: false,
          });

          // 获取用户上传的价格信息
        } else {
          self.getUserUploadPrice(id.toString());
          self.setData({
            matchedData: null,
            showUploadButton: true,
          });
        }
      },
      fail: function (res) {
        console.error(res);
      }
    });
  },


  getUserUploadPrice: function (id) {
    let self = this;

    db.collection('userupload').where({
      id: id
    }).get({
      success: function (res) {
        if (res.data.length > 0) {
          let userUploadData = res.data[0];
          let userUploadPrice = [];

          if (userUploadData.price1) {
            userUploadPrice.push(userUploadData.price1);
          }
          if (userUploadData.price2) {
            userUploadPrice.push(userUploadData.price2);
          }
          if (userUploadData.price3) {
            userUploadPrice.push(userUploadData.price3);
          }

          self.setData({
            userUploadPrice: userUploadPrice,
            showUploadButton: userUploadPrice.length !== 3 // 控制显示上传按钮
          });
        }
      },
      fail: function (res) {
        console.error(res);
      }
    });
  },


  handlePriceInput: function (e) {
    let priceInput = e.detail.value;
    this.setData({
      priceInput: priceInput
    });
  },

  openModal: function () {
    this.setData({
      showModal: true
    });
  },

  closeModal: function () {
    this.setData({
      showModal: false,
      priceInput: ''
    });
  },

  uploadPrice: function () {
    let self = this;
    let id = self.data.scanResult;
    let priceInput = parseFloat(self.data.priceInput); // 将价格数据转换为数字类型

    if (priceInput > 0 && priceInput < 49) {
      let data = {
        price1: priceInput
      };

      db.collection('userupload').doc(id).get({
        success: function (res) {
          if (res.data) {
            // 文档已存在，执行更新逻辑
            let existingData = res.data;
            if (existingData.price2 === 0) {
              data.price2 = priceInput;
            } else if (existingData.price3 === 0) {
              data.price3 = priceInput;
            } else {
              console.log("已经记录了三个价格");
              return;
            }

            self.updateUserData(id, data);
          } else {
            // 文档不存在，执行新增逻辑
            self.addUserData(id, data);
          }
        },
        fail: function (res) {
          // 获取文档失败，执行新增逻辑
          self.addUserData(id, data);
        }
      });

      self.closeModal();
      // 显示提交成功的消息
      wx.showToast({
        title: '提交成功',
        icon: 'success',
        duration: 2000
      });
    } else {
      console.log("请输入有效的价格（大于0且小于49）");
      // 显示提交失败的消息
      wx.showToast({
        title: '提交失败',
        icon: 'none',
        duration: 2000
      });
    }
  },

  updateUserData: function (id, data) {
    let self = this;
    db.collection('userupload').where({
      id: id
    }).get({
      success: function (res) {
        if (res.data.length > 0) {
          let existingData = res.data[0];
          if (existingData.price2 === 0) {
            data.price2 = data.price1;
            data.price1 = existingData.price1;
          } else if (existingData.price3 === 0) {
            data.price3 = data.price1;
            data.price1 = existingData.price1;
          } else {
            console.log("已经记录了三个价格");
            return;
          }

          db.collection('userupload').doc(existingData._id).update({
            data: {
              ...data
            },
            success: function (res) {
              console.log("数据更新成功");
              // 添加成功后的回调逻辑
            },
            fail: function (res) {
              console.error(res);
              // 添加失败后的回调逻辑
            }
          });
        }
      },
      fail: function (res) {
        console.error(res);
        // 查询失败的回调逻辑
      }
    });
  },

  addUserData: function (id, data) {
    let self = this;
    db.collection('userupload').where({
      id: id
    }).get({
      success: function (res) {
        if (res.data.length > 0) {
          let existingData = res.data[0];
          if (existingData.price2 === 0) {
            data.price2 = data.price1;
            data.price1 = existingData.price1;
          } else if (existingData.price3 === 0) {
            data.price3 = data.price1;
            data.price1 = existingData.price1;
          } else {
            console.log("已经记录了三个价格");
            return;
          }

          db.collection('userupload').doc(existingData._id).update({
            data: {
              ...data
            },
            success: function (res) {
              console.log("数据更新成功");
              // 添加成功后的回调逻辑
            },
            fail: function (res) {
              console.error(res);
              // 添加失败后的回调逻辑
            }
          });
        } else {
          db.collection('userupload').add({
            data: {
              ...data,
              id: id,
              price2: 0,
              price3: 0
            },
            success: function (res) {
              console.log("数据新增成功");
              // 添加成功后的回调逻辑
            },
            fail: function (res) {
              console.error(res);
              // 添加失败后的回调逻辑
            }
          });
        }
      },
      fail: function (res) {
        console.error(res);
        // 查询失败的回调逻辑
      }
    });
  }

});