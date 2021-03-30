//获取应用实例
const app = getApp()

Page({
  data: {
    currentTheme: 'light',
    show1: false,
    show2: false,
    imgSrc: '../../static/img/more.png'
  },
  onLoad() {
    this.setData({
      currentTheme: app.globalData.currentTheme
    })
  },
  onClickLeft() {
    wx.navigateBack({
      delta: 1, // 返回上一级页面。
    })
  },
  showPopup1() {
    this.setData({ show1: true });
  },
  onClose1() {
    this.setData({ show1: false });
  },
  showPopup2() {
    this.setData({ show2: true });
  },
  onClose2() {
    this.setData({ show2: false });
  },
  quit() {
    wx.clearStorageSync();
    wx.setStorageSync('hasUserInfo', false);
    wx.reLaunch({
      url: '/pages/tabbar/main/main',
    })
  }
})