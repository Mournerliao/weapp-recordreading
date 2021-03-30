//获取应用实例
const app = getApp()

Page({
  data: {
    loading: false
  },
  onClickLeft() {
    wx.navigateBack({
      delta: 1, // 返回上一级页面。
    })
  },
  login() {
    let that = this;
    this.setData({
      loading: true
    })
    // 登录
    wx.login({
      success: function (res) {
        let code = res.code; //发送给服务器的code
        wx.getUserInfo({
          success: function (res) {
            let name = res.userInfo.nickName; //用户昵称
            let avataUrl = res.userInfo.avatarUrl; //用户头像地址
            let sex = res.userInfo.gender; //用户性别
            
            if (code) {
              wx.request({
                url: 'https://www.xiaoqw.online/recordreading/sever/login.php', //服务器的地址，现在微信小程序只支持https请求，所以调试的时候请勾选不校监安全域名
                method: 'POST',
                header: {
                  'content-type': 'application/x-www-form-urlencoded'
                },
                data: {
                  code: code,
                  name: name,
                  avaUrl: avataUrl,
                  sex: sex,
                },
                success: function (res) {
                  console.log(res.data);
                  wx.setStorageSync('name', res.data.name); //将获取信息写入本地缓存
                  wx.setStorageSync('userID', res.data.userID);
                  wx.setStorageSync('imgUrl', res.data.imgUrl);
                  wx.setStorageSync('sex', res.data.sex);
                  wx.setStorageSync('hasUserInfo', true);
                  that.setData({
                    loading: false
                  })
                  wx.reLaunch({
                    url: '/pages/tabbar/main/main',
                  })
                }
              })
            } else {
              console.log("获取用户登录态失败！");
            }
          }
        })
      },
      fail: function (error) {
        console.log('login failed ' + error);
      }
    })
  },
})