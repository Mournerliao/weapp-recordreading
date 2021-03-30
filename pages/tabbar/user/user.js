//获取应用实例
const app = getApp()

Page({
  data: {
    navBarHeight: app.globalData.navBarHeight, //导航栏高度
    userID: undefined,
    name: '',
    imgUrl: '',
    sex: '',
    hasUserInfo: false,
    loading: false,
    show: false
  },
  onShow() {
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      })
    };
  },
  onLoad: function () {
    this.setData({
      userID: wx.getStorageSync('userID'),
      name: wx.getStorageSync('name'),
      imgUrl: wx.getStorageSync('imgUrl'),
      sex: wx.getStorageSync('sex'),
      hasUserInfo: wx.getStorageSync('hasUserInfo')
    })
  },
  toLogin() {
    wx.navigateTo({
      url: '../../login/login',
    })
  },
  toCollect() {
    if(this.data.hasUserInfo === false) {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 2000
      })
    } else {
      wx.navigateTo({
        url: '../../collection/collection',
      })
    }
  },
  //分享功能
  onShareAppMessage(res) {
    //判断触发的方式是否为按钮
    if (res.from == "button") {
      //参数
      return {
        title: "记录你的每一次读书",
        path: "/pages/tabbar/main/main"
      }
    }
  },
  toMore() {
    if(this.data.hasUserInfo === false) {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 2000
      })
    } else {
      wx.navigateTo({
        url: '../../more/more',
      })
    }
  },
})