let util = require('../../utils/util.js');

Page({
  data: {
    loading: true,
    date: '',
    isbn: null,
    title: null,
    cover_url: null,
    author: null,
    days: 0,
    haveRead: 0,
    allpages: undefined,
    percentage: 0,
    readpages: 0,
    note: ''
  },
  onLoad: function (option) {
    console.log(option.isbn);
    this.getInfo();
    this.getTime();
  },
  getInfo() {
    let that = this;
    this.setData({
      hasUserInfo: wx.getStorageSync('hasUserInfo')
    })
    if (wx.getStorageSync('userID')) {
      let userID = wx.getStorageSync('userID');
      wx.request({
        url: 'https://www.xiaoqw.online/recordreading/sever/getMainInfo.php',
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          userID: userID
        },
        success: function (res) {
          console.log(res.data);
          if (res.data) {
            let percentage = (res.data.haveRead / res.data.pages) * 100;
            that.setData({
              isbn: res.data.isbn,
              title: res.data.title,
              cover_url: res.data.cover_url,
              author: res.data.author,
              days: res.data.days,
              haveRead: res.data.haveRead,
              allpages: res.data.pages,
              percentage: percentage,
              loading: false
            });
            wx.setStorageSync('isbn', res.data.isbn);
          } else {
            console.log("未获取到信息!");
          }
        }
      })
    }
  },
  getTime() {
    let date = util.formatDate(new Date());
    this.setData({
      date: date,
    });
  },
  onClickLeft() {
    wx.navigateBack({
      delta: 1, // 返回上一级页面。
    })
  },
  thisRead(event) {
    console.log(event.detail.value);
    this.setData({
      readpages: event.detail.value
    })
  },
  myNote(event) {
    console.log(event.detail.value);
    this.setData({
      note: event.detail.value
    })
  },
  submit() {
    console.log(this.data.allpages);
    console.log(this.data.haveRead);
    if(parseInt(this.data.readpages) < 0) {
      wx.showToast({
        title: '输入的页数不能小于0',
        icon: 'none',
        duration: 2000
      })
    } else if (parseInt(this.data.readpages) > parseInt(this.data.allpages)) {
      wx.showToast({
        title: '不能大于书籍页数',
        icon: 'none',
        duration: 2000
      })
    } else if(parseInt(this.data.readpages) <= parseInt(this.data.haveRead)) {
      wx.showToast({
        title: '书可不能读回去噢',
        icon: 'none',
        duration: 2000
      })
    } else {
      var that = this;
      wx.request({
        url: 'https://www.xiaoqw.online/recordreading/sever/saveRecord.php',
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          userID: wx.getStorageSync('userID'),
          isbn: that.data.isbn,
          readPages: that.data.readpages,
          thisRead: that.data.readpages-that.data.haveRead,
          note: that.data.note
        },
        success: res => {
          if(res.data === 1) {
            wx.reLaunch({
              url: '/pages/tabbar/main/main',
            }),
            wx.showToast({
              title: '打卡成功',
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
  }
})