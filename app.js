//app.js
App({
  globalData: {
    currentTheme: 'light',
    navBarHeight: 0, // 导航栏高度
    signaTop: 0,
    signaLeft: 0,
    signaRight: 0,
    signaHeight: 0,
    screenWidth: 0,
  },

  onLaunch: function () {
    let that = this;
    this.setNavBarInfo();

    // 登录
    wx.login({
      success: function (res) {
        let code = res.code; //发送给服务器的code

        // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
        // 所以此处加入 callback 以防止这种情况
        if (that.userInfoReadyCallback) {
          that.userInfoReadyCallback(res)
        }

        if (code) {
          wx.request({
            url: 'https://www.xiaoqw.online/recordreading/sever/appLogin.php', //服务器的地址，现在微信小程序只支持https请求，所以调试的时候请勾选不校监安全域名
            method: 'POST',
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
              code: code,
            },
            success: function (res) {
              console.log(res.data);
              let userID = res.data.userID;

              if(res.data) {
                wx.setStorageSync('name', res.data.name); //将获取信息写入本地缓存
                wx.setStorageSync('userID', res.data.userID);
                wx.setStorageSync('imgUrl', res.data.imgUrl);
                wx.setStorageSync('sex', res.data.sex);
                wx.setStorageSync('email', res.data.email);
                wx.setStorageSync('hasUserInfo', true);
              } else {
                wx.setStorageSync('hasUserInfo', false);
              }
            }
          })
        } else {
          console.log("获取用户登录态失败！");
          wx.showToast({
            title: '登录失败，请稍后再尝试',
            icon: 'none',
            duration: 2000
          })
        }
      },
      fail: function (error) {
        console.log('login failed ' + error);
          wx.showToast({
            title: '登录失败，请稍后再尝试',
            icon: 'none',
            duration: 2000
          })
      }
    })
  },
  setNavBarInfo() {
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync();
    // 胶囊按钮位置信息
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
    console.log(systemInfo);
    // 导航栏高度 = 状态栏到胶囊的间距（胶囊距上距离-状态栏高度） * 2 + 胶囊高度 + 状态栏高度
    this.globalData.navBarHeight = systemInfo.statusBarHeight;
    this.globalData.currentTheme = systemInfo.theme;
    this.globalData.signaTop = menuButtonInfo.top;
    this.globalData.signaLeft = menuButtonInfo.left;
    this.globalData.signaRight = menuButtonInfo.right;
    this.globalData.signaHeight = menuButtonInfo.height;
    this.globalData.screenWidth = systemInfo.windowWidth / 375;
  }
})