//获取应用实例
const app = getApp()

Page({
  data: {
    screenWidth: app.globalData.screenWidth,
    navHeight: app.globalData.navBarHeight,
    hasUserInfo: false,
    topheight: 240,
    loading: true,
    loginLoading: false,
    ifReading: false,
    cmpID: undefined,
    isbn: undefined,
    title: undefined,
    cover_url: undefined,
    author: undefined,
    days: 0,
    readpages: 0,
    allpages: 0,
    percentage: 0,
    myName: wx.getStorageSync('name'),
    myAvatar: wx.getStorageSync('imgUrl'),
    mySex: wx.getStorageSync('sex'),
    cmpAvatar: undefined,
    cmpName: undefined,
    cmpSex: undefined
  },
  onShow() {
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      })
    };
  },
  onLoad() {
    this.getInfo();
  },
  // onReady() {
  //   this.getHeight();
  // },
  login() {
    let that = this;
    this.setData({
      loginLoading: true
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
                    loginLoading: false
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
              // cmpID: res.data.cmpID,
              isbn: res.data.isbn,
              title: res.data.title,
              cover_url: res.data.cover_url,
              author: res.data.author,
              days: res.data.days,
              readpages: res.data.haveRead,
              allpages: res.data.pages,
              percentage: percentage
            });
            wx.setStorageSync('isbn', res.data.isbn);
            // that.getPkInfo(res.data.cmpID);
            that.drawProgressbg();
            that.drawCircle(percentage / 100 * 2);
            that.setData({
              loading: false,
              ifReading: true
            })
          } else {
            console.log("未获取到信息!");
            that.setData({
              loading: false,
              ifReading: false
            })
          }
        }
      })
    }
  },
  getPkInfo(cmpID) {
    let that = this;
    wx.request({
      url: 'https://www.xiaoqw.online/recordreading/sever/getPkInfo.php',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        cmpID: cmpID
      },
      success: function (res) {
        console.log(res.data);
        if (res.data) {
          that.setData({
            cmpName: res.data.name,
            cmpAvatar: res.data.imgUrl,
            cmpSex: res.data.sex
          });
        } else {
          console.log("未获取到信息!");
        }
      }
    })
  },
  /**
   * 画progress底部背景
   */
  drawProgressbg: function () {
    // 使用 wx.createContext 获取绘图上下文 context
    let ctx = wx.createCanvasContext('canvasProgressbg');
    // 设置圆环的宽度
    ctx.setLineWidth(40);
    // 设置圆环的颜色
    ctx.setStrokeStyle('#f0f1f5');
    // 设置圆环端点的形状
    ctx.setLineCap('round')
    //开始一个新的路径
    ctx.beginPath();
    //设置一个原点(110,110)，半径为100的圆的路径到当前路径
    ctx.arc(this.data.screenWidth * 150, this.data.screenWidth * 150, this.data.screenWidth * 115, 0, 2 * Math.PI, false);
    //对当前路径进行描边
    ctx.stroke();
    //开始绘制
    ctx.draw();
  },

  /**
   * 画progress进度
   */
  drawCircle: function (step) {
    // 使用 wx.createContext 获取绘图上下文 context
    let context = wx.createCanvasContext('canvasProgress');
    // 设置圆环的宽度
    context.setLineWidth(40);
    // 设置圆环的颜色
    context.setStrokeStyle('#71BEAE');
    // 设置圆环端点的形状
    context.setLineCap('round')
    //开始一个新的路径
    context.beginPath();
    //参数step 为绘制的圆环周长，从0到2为一周 。 -Math.PI / 2 将起始角设在12点钟位置 ，结束角 通过改变 step 的值确定
    context.arc(this.data.screenWidth * 150, this.data.screenWidth * 150, this.data.screenWidth * 115, -Math.PI / 2, step * Math.PI - Math.PI / 2, false);
    //对当前路径进行描边
    context.stroke();
    //开始绘制
    context.draw()
  },
  toSearch() {
    wx.navigateTo({
      url: '../../search/search'
    })
  },
  // getHeight() {
  //   let that = this;
  //   wx.createSelectorQuery().select('.top').boundingClientRect(function (res) {
  //     that.setData({
  //       topheight: res.height
  //     })
  //   }).exec();
  // },
  toBookInfo() {
    wx.navigateTo({
      url: '../../bookinfo/bookinfo?isbn=' + this.data.isbn
    })
  },
  toClockIn() {
    wx.navigateTo({
      url: '../../clockin/clockin?isbn=' + this.data.isbn
    })
  }
});