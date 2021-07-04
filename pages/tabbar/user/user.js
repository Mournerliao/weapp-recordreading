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
    books: [],
    ifCompletion: true,
    loading: true,
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
    });
    this.getCompletions();
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },
  getCompletions() {
    let that = this;
    let hasUserInfo = wx.getStorageSync('hasUserInfo');

    if (hasUserInfo) {
      wx.request({
        url: 'https://www.xiaoqw.online/recordreading/sever/getCompletions.php',
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          userID: wx.getStorageSync('userID')
        },
        success: function (res) {
          console.log(res.data);
          if (res.data.length != 0) {
            res.data.reverse();
            that.setData({
              books: res.data,
              ifCompletion: true,
              loading: false
            });
          } else {
            console.log("未获取到信息!");
            that.setData({
              ifCompletion: false
            })
          }
        }
      })
    } else {
      that.setData({
        loading: false
      })
    }
  },
  login() {
    let that = this;

    wx.showLoading({
      mask: true,
      title: '请稍候'
    });
    wx.getUserProfile({
      desc: '仅用于展示用户昵称和头像', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res.userInfo);
        let name = res.userInfo.nickName;
        let imgUrl = res.userInfo.avatarUrl;
        let sex = res.userInfo.gender;

        // 登录
        wx.login({
          success: function (res) {
            let code = res.code; //发送给服务器的code

            if (code) {
              wx.request({
                url: 'https://www.xiaoqw.online/recordreading/sever/buttonLogin.php', //服务器的地址，现在微信小程序只支持https请求，所以调试的时候请勾选不校监安全域名
                method: 'POST',
                header: {
                  'content-type': 'application/x-www-form-urlencoded'
                },
                data: {
                  code: code,
                  name: name,
                  imgUrl: imgUrl,
                  sex: sex
                },
                success: function (res) {
                  console.log(res.data);
                  wx.setStorageSync('name', res.data.name); //将获取信息写入本地缓存
                  wx.setStorageSync('userID', res.data.userID);
                  wx.setStorageSync('imgUrl', res.data.imgUrl);
                  wx.setStorageSync('sex', res.data.sex);
                  wx.setStorageSync('email', res.data.email);
                  wx.setStorageSync('hasUserInfo', true);
                  wx.hideLoading();

                  wx.reLaunch({
                    url: '/pages/tabbar/main/main',
                  })
                }
              })
            } else {
              wx.hideLoading();
              console.log("获取用户登录态失败！");
              wx.showToast({
                title: '登录失败，请稍后再尝试',
                icon: 'none',
                duration: 2000
              })
            }
          },
          fail: function (error) {
            wx.hideLoading();
            console.log('login failed ' + error);
            console.log("获取用户登录态失败！");
            wx.showToast({
              title: '登录失败，请稍后再尝试',
              icon: 'none',
              duration: 2000
            })
          }
        })
      },
      fail: function () {
        wx.hideLoading();
        console.log("获取用户登录态失败！");
        wx.showToast({
          title: '登录失败，请稍后再尝试',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  toCollect() {
    if (this.data.hasUserInfo === false) {
      wx.showToast({
        title: '您尚未登陆',
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
    return {
      title: "记录你的读书历程",
      // imageUrl: "https://www.xiaoqw.online/recordreading/source/shareImgTop.png",
      path: "/pages/tabbar/main/main"
    }
  },
  toMore() {
    if (this.data.hasUserInfo === false) {
      wx.showToast({
        title: '您尚未登陆',
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