import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';
const app = getApp()

Page({
  data: {
    books: [],
    screenWidth: app.globalData.screenWidth,
    navBarHeight: app.globalData.navBarHeight,
    safeArea: 'env(safe-area-inset-bottom)',
    scanBottom: 0,
    inputValue: null,
    loading: true
  },
  onLoad: function (options) {
    wx.request({
      url: 'https://www.xiaoqw.online/recordreading/sever/getRecommendations.php',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: res => {
        this.setData({
          books: res.data,
          loading: false
        })
        console.log(this.data.books);
      }
    })
  },
  onClickLeft() {
    wx.navigateBack({
      delta: 1, // 返回上一级页面。
    })
  },
  scanCode: function (event) {
    // 允许从相机和相册扫码
    wx.scanCode({
      scanType: ['barCode'],
      success: res => {
        console.log(res.result)
        wx.navigateTo({
          url: '../bookinfo/bookinfo?isbn=' + res.result
        })
      }
    })
  },
  bindInput(e) {
    this.setData({
      inputValue: e.detail.value
    });
  },
  onConfirm: function () {
    //判断正整数
    let re = /^\d+$/;
    if (re.test(this.data.inputValue)) {
      console.log(this.data.inputValue)
      wx.navigateTo({
        url: '../bookinfo/bookinfo?isbn=' + this.data.inputValue
      })
    } else {
      Toast('只能输入数字！');
    }
  },
  scanFocus(e) {
    this.setData({
      safeArea: 0,
      scanBottom: e.detail.height
    })
  },
  scanBlur(e) {
    this.setData({
      safeArea: 'env(safe-area-inset-bottom)',
      scanBottom: 0
    })
  },
  toBookInfo(event) {
    let isbn = event.currentTarget.dataset.isbn;
    wx.navigateTo({
      url: '../bookinfo/bookinfo?isbn=' + isbn
    })
  },
})