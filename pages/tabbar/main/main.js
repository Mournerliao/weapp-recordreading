//获取应用实例
const app = getApp();
let util = require('../../../utils/util.js');

Page({
  data: {
    screenWidth: app.globalData.screenWidth,
    navHeight: app.globalData.navBarHeight,
    date: '',
    hasUserInfo: true,
    topheight: 240,
    loading: true,
    loginLoading: false,
    ifReading: false,
    cmpID: undefined,
    selectBook: undefined,
    isbn: undefined,
    title: undefined,
    cover_url: undefined,
    author: undefined,
    changeBookShow: false,
    days: 0,
    readpages: 0,
    allpages: 0,
    percentage1: 0,
    percentage2: 0,
    ifPk: false,
    myName: wx.getStorageSync('name'),
    myAvatar: wx.getStorageSync('imgUrl'),
    mySex: wx.getStorageSync('sex'),
    cmpAvatar: '',
    cmpName: '',
    cmpSex: '',
    cmpDays: 0,
    cmpReadpages: 0,
    cmpPercentage: 0
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
    this.setData({
      hasUserInfo: wx.getStorageSync('hasUserInfo')
    })
    this.getNowreading();
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },
  //分享功能
  onShareAppMessage(res) {
    return {
      title: "记录你的读书历程",
      // imageUrl: "https://www.xiaoqw.online/recordreading/source/shareImgTop.png",
      path: "/pages/tabbar/main/main"
    }
  },
  login() {
    let that = this;
    this.setData({
      loginLoading: true
    })
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

                  that.setData({
                    loginLoading: false,
                    hasUserInfo: true
                  })
                  wx.reLaunch({
                    url: '/pages/tabbar/main/main',
                  })
                }
              })
            } else {
              console.log("获取用户登录态失败！");
              wx.showToast({
                title: '登录失败，请稍后再尝试',
                icon: 'none',
                duration: 2000
              })
              that.setData({
                loginLoading: false
              })
            }
          },
          fail: function (error) {
            console.log('login failed ' + error);
            console.log("获取用户登录态失败！");
            wx.showToast({
              title: '登录失败，请稍后再尝试',
              icon: 'none',
              duration: 2000
            })
            that.setData({
              loginLoading: false
            })
          }
        })
      },
      fail: function () {
        console.log("获取用户登录态失败！");
        wx.showToast({
          title: '登录失败，请稍后再尝试',
          icon: 'none',
          duration: 2000
        })
        that.setData({
          loginLoading: false
        })
      }
    })
  },
  getTime() {
    let date = util.formatDate(new Date());
    this.setData({
      date: date,
    });
  },
  getNowreading() {
    let that = this;
    if (wx.getStorageSync('userID')) {
      wx.request({
        url: 'https://www.xiaoqw.online/recordreading/sever/getNowReading.php',
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          userID: wx.getStorageSync('userID'),
        },
        success: res => {
          console.log(res.data);
          if (res.data.length == 0) {
            that.setData({
              loading: false,
              ifReading: false,
            })
          } else {
            that.setData({
              ifReading: true,
              books: res.data
            })
            if (wx.getStorageSync('currentBook')) {
              that.getInfo(wx.getStorageSync('currentBook'));
            } else {
              wx.setStorageSync('currentBook', res.data[0].isbn);
              that.getInfo(res.data[0].isbn);
            }
          }
        }
      })
    }
  },
  getInfo(isbn) {
    this.getTime();

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
          userID: userID,
          isbn: isbn,
          date: this.data.date
        },
        success: function (res) {
          console.log(res.data);
          if (res.data[0]) {
            let percentage1 = (res.data[0].haveRead / res.data[0].pages) * 100;
            percentage1 = percentage1.toFixed(2);

            that.setData({
              selectBook: res.data[0].isbn,
              isbn: res.data[0].isbn,
              title: res.data[0].title,
              cover_url: res.data[0].cover_url,
              author: res.data[0].author,
              days: parseInt(res.data[0].days),
              readpages: parseInt(res.data[0].haveRead),
              allpages: res.data[0].pages,
              percentage: parseInt(percentage1),
            });
            wx.setStorageSync('isbn', res.data[0].isbn);

            if (res.data[1] && res.data[2]) {
              let percentage2 = (res.data[2].haveRead / res.data[0].pages) * 100;
              percentage2 = percentage2.toFixed(2);

              that.setData({
                cmpName: res.data[1].name,
                cmpAvatar: res.data[1].imgUrl,
                cmpSex: res.data[1].sex,
                cmpDays: parseInt(res.data[2].days),
                cmpReadpages: parseInt(res.data[2].haveRead),
                cmpPercentage: parseInt(percentage2),
                ifPk: true
              })
            } else {
              that.setData({
                ifPk: false
              })
            }
            that.setData({
              loading: false,
            })
            that.drawProgressbg();
            that.drawCircle(percentage1 / 100 * 2);
          } else {
            console.log("未获取到信息!");
            that.setData({
              loading: false,
            })
          }
        }
      })
    }
  },
  showChangeBook() {
    this.setData({
      changeBookShow: true
    })
  },
  onClose() {
    let that = this;
    let isbn = this.data.isbn;
    this.setData({
      selectBook: isbn,
      changeBookShow: false
    })
  },
  changeBook(e) {
    let isbn = e.currentTarget.dataset.isbn;
    wx.setStorageSync('currentBook', isbn);
    this.getInfo(isbn);
    this.setData({
      changeBookShow: false
    })
  },

  /**
   * 画progress底部背景
   */
  drawProgressbg: function () {
    let that = this;
    const query = wx.createSelectorQuery();
    query.select('#canvasBg')
      .fields({
        node: true,
        size: true
      })
      .exec((res) => {
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');

        canvas.width = 300 * that.data.screenWidth;
        canvas.height = 300 * that.data.screenWidth;
        ctx.lineWidth = 40;
        ctx.strokeStyle = '#f0f1f5';
        ctx.lineCap = 'round';
        //开始一个新的路径
        ctx.beginPath();
        //设置一个原点(110,110)，半径为100的圆的路径到当前路径
        ctx.arc(that.data.screenWidth * 150, that.data.screenWidth * 150, that.data.screenWidth * 115, 0, 2 * Math.PI, false);
        //对当前路径进行描边
        ctx.stroke();
        // that.drawCircle();
      })
  },

  /**
   * 画progress进度
   */
  drawCircle: function (step) {
    let that = this;
    const query = wx.createSelectorQuery();
    query.select('#canvasProgress')
      .fields({
        node: true,
        size: true
      })
      .exec((res) => {
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');

        canvas.width = 300 * that.data.screenWidth;
        canvas.height = 300 * that.data.screenWidth;
        ctx.lineWidth = 40;
        ctx.strokeStyle = '#71beae';
        ctx.lineCap = 'round';
        //开始一个新的路径
        ctx.beginPath();
        //设置一个原点(110,110)，半径为100的圆的路径到当前路径
        ctx.arc(that.data.screenWidth * 150, that.data.screenWidth * 150, that.data.screenWidth * 115, -Math.PI / 2, step * Math.PI - Math.PI / 2, false);
        //对当前路径进行描边
        ctx.stroke();
      })
  },
  toSearch() {
    wx.navigateTo({
      url: '../../search/search'
    })
  },
  toBookInfo() {
    wx.navigateTo({
      url: '../../bookinfo/bookinfo?isbn=' + this.data.isbn
    })
  },
  toPk() {
    wx.navigateTo({
      url: '../../opponent/opponent?isbn=' + this.data.isbn
    })
  },
});