Component({
  data: {
    selected: 0,
    list: [{
      pagePath: "/pages/tabbar/main/main",
      iconPath: "/static/img/tabbar/main.png",
      selectedIconPath: "/static/img/tabbar/mainselect.png",
      text: "首页"
    }, {
      pagePath: "/pages/tabbar/record/record",
      iconPath: "/static/img/tabbar/record.png",
      selectedIconPath: "/static/img/tabbar/recordselect.png",
      text: "记录"
    },{
      pagePath: "/pages/tabbar/user/user",
      iconPath: "/static/img/tabbar/user.png",
      selectedIconPath: "/static/img/tabbar/userselect.png",
      text: "我的"
    }]
  },
  attached() {
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset;
      const url = data.path;
      wx.switchTab({url});
      // this.setData({
      //   selected: data.index
      // })
    }
  }
})