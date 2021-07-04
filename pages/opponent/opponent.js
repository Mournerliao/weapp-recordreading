let util = require('../../utils/util.js');

Page({
  data: {
    ifData: false,
    date: '',
    opponents: []
  },
  onLoad: function (options) {
    this.getTime();
    this.getOpponents(options.isbn);
  },
  onClickLeft() {
    wx.navigateBack({
      delta: 1, // 返回上一级页面。
    })
  },
  getTime() {
    let date = util.formatDate(new Date());
    this.setData({
      date: date,
    });
  },
  getOpponents(isbn) {
    let that = this;
    wx.request({
      url: 'https://www.xiaoqw.online/recordreading/sever/getOpponents.php',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        userID: wx.getStorageSync('userID'),
        isbn: isbn,
        date: that.data.date
      },
      success: res => {
        console.log(res.data);
        if (res.data.length != 0) {
          that.setData({
            opponents: res.data,
            ifData: true
          })
        } else {
          that.setData({
            ifData: false
          })
        }
      }
    })
  },
  select(e) {
    console.log(e.currentTarget.dataset.userid);
    let cmpID = e.currentTarget.dataset.userid;

    wx.request({
      url: 'https://www.xiaoqw.online/recordreading/sever/setOpponent.php',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        userID: wx.getStorageSync('userID'),
        cmpID: cmpID,
        isbn: wx.getStorageSync('isbn')
      },
      success: res => {
        console.log(res.data);
        if (res.data === 1) {
          let pages = getCurrentPages();
          let prevPage = pages[pages.length - 2];

          prevPage.onLoad();
          wx.navigateBack({
            delta: 1 // 返回上一级页面。
          })

          wx.showToast({
            title: '设置成功',
            icon: 'success',
            duration: 2000
          })
        } else {
          wx.showToast({
            title: '操作未成功，请再试一次',
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
  }
})