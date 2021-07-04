//获取应用实例
const app = getApp()

Page({
  data: {
    currentTheme: 'light',
    show1: false,
    show2: false,
    show3: false,
    show4: false,
    show5: false,
    show6: false,
    email: '',
    imgSrc: '../../static/img/more.png'
  },
  onShow() {
    this.setData({
      currentTheme: app.globalData.currentTheme,
      email: wx.getStorageSync('email')
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
  showPopup3() {
    this.setData({ show3: true });
  },
  onClose3() {
    this.setData({ show3: false });
  },
  showPopup4() {
    this.setData({ show4: true });
  },
  onClose4() {
    this.setData({ show4: false });
  },
  showPopup5() {
    this.setData({ show5: true });
  },
  onClose5() {
    this.setData({ show5: false });
  },
  showPopup6() {
    this.setData({ show6: true });
  },
  onClose6() {
    this.setData({ show6: false });
  },
  endReading() {
    let that = this;
    wx.request({
      url: 'https://www.xiaoqw.online/recordreading/sever/endReading.php',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        userID: wx.getStorageSync('userID'),
        isbn: wx.getStorageSync('isbn')
      },
      success: res => {
        if(res.data === 1) {
          wx.removeStorageSync('isbn');
          wx.removeStorageSync('currentBook');
          wx.reLaunch({
            url: '/pages/tabbar/main/main',
          });
          wx.showToast({
            title: '操作成功',
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
  },
  endPk() {
    let that = this;
    wx.request({
      url: 'https://www.xiaoqw.online/recordreading/sever/endPk.php',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        userID: wx.getStorageSync('userID'),
        isbn: wx.getStorageSync('isbn')
      },
      success: res => {
        if(res.data === 1) {
          wx.reLaunch({
            url: '/pages/tabbar/main/main',
          });
          wx.showToast({
            title: '操作成功',
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
  },
  setEmail() {
    if(this.checkEmail()) {
      let that = this;
      let email = this.data.email;
      wx.request({
        url: 'https://www.xiaoqw.online/recordreading/sever/setEmail.php',
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          userID: wx.getStorageSync('userID'),
          email: email
        },
        success: res => {
          if(res.data === 1) {
            wx.setStorageSync('email', email);
            wx.showToast({
              title: '邮箱设置成功',
              icon: 'success',
              duration: 2000
            })
            that.onClose3();
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
  },
  myEmail(event) {
    console.log(event.detail.value);
    this.setData({
      email: event.detail.value
    })
  },
  checkEmail() {
    let email = this.data.email;
		let reg = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
		if(reg.test(email)){
			return true;
		}else{
			wx.showToast({
        title: '邮箱格式不正确',
        icon: 'none',
        duration: 2000
      })

      return false;
		}
  },
  getUserProfile() {
    wx.showLoading({
      mask: true,
      title: '请稍候'
    });
    wx.getUserProfile({
      desc: '仅用于展示用户昵称和头像', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        wx.hideLoading();
        console.log(res.userInfo);
        wx.request({
          url: 'https://www.xiaoqw.online/recordreading/sever/updateUserInfo.php',
          method: 'POST',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          data: {
            userID: wx.getStorageSync('userID'),
            name: res.userInfo.nickName,
            imgUrl: res.userInfo.avatarUrl,
            sex: res.userInfo.gender
          },
          success: res => {
            console.log(res.data);
            wx.setStorageSync('name', res.data.name); //将获取信息写入本地缓存
            wx.setStorageSync('userID', res.data.userID);
            wx.setStorageSync('imgUrl', res.data.imgUrl);
            wx.setStorageSync('sex', res.data.sex);
            wx.setStorageSync('email', res.data.email);
            wx.setStorageSync('hasUserInfo', true);

            let pages = getCurrentPages();
            let prevPage = pages[pages.length - 2];

            prevPage.onLoad();
            wx.navigateBack({
              delta: 1 // 返回上一级页面。
            })
          }
        })
      },
      fail: (res) => {
        wx.hideLoading();
        wx.showToast({
          title: '获取用户信息失败',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  quit() {
    wx.clearStorageSync();
    wx.setStorageSync('hasUserInfo', false);
    wx.reLaunch({
      url: '/pages/tabbar/main/main',
    })
  }
})