// ===== 用户登录状态 =====
    const userArea = document.querySelector('.user-area');
    const loginBtn = document.querySelector('.login-btn');
    const isLoggedIn = true; // 改为 true 查看已登录效果

    userArea.classList.toggle('logged-in', isLoggedIn);
    userArea.classList.toggle('logged-out', !isLoggedIn);

    loginBtn?.addEventListener('click', () => {
      window.location.href = './login.html';
    });
   
    // ===== 下拉框 =====
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    dropdownToggle.addEventListener('click', function(e) {
      e.preventDefault();
      dropdownMenu.classList.toggle('show');
    });

    document.addEventListener('click', function(e) {
      if (!e.target.closest('.dropdown')) {
        dropdownMenu.classList.remove('show');
      }
    });

    // ===== 右侧悬浮菜单 =====
    const trigger = document.getElementById('sideMenuTrigger');
    const sideMenu = document.getElementById('sideMenu');

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      sideMenu.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!sideMenu.contains(e.target) && !trigger.contains(e.target)) {
        sideMenu.classList.remove('open');
      }
    });

    // 点击菜单项后自动关闭
    document.querySelectorAll('.side-item').forEach(item => {
      item.addEventListener('click', () => sideMenu.classList.remove('open'));
    });

// 阴历日期计算函数（使用更准确的算法）
function getLunarDate(date) {
  const lunarMonths = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  const lunarDays = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
    '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
    '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];
  const lunarMonths2026 = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];
  const springFestival2026 = new Date(2026, 1, 17);
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const solarTerms2026 = {
    '01-05': '小寒', '01-20': '大寒',
    '02-04': '立春', '02-19': '雨水',
    '03-05': '惊蛰', '03-20': '春分',
    '04-04': '清明', '04-20': '谷雨',
    '05-05': '立夏', '05-21': '小满',
    '06-05': '芒种', '06-21': '夏至',
    '07-07': '小暑', '07-22': '大暑',
    '08-07': '立秋', '08-23': '处暑',
    '09-07': '白露', '09-23': '秋分',
    '10-08': '寒露', '10-23': '霜降',
    '11-07': '立冬', '11-22': '小雪',
    '12-07': '大雪', '12-21': '冬至'
  };

  let solarTerm = '';
  const monthStr = String(date.getMonth() + 1).padStart(2, '0');
  const dayStr = String(date.getDate()).padStart(2, '0');
  const dateKey = `${monthStr}-${dayStr}`;
  if (solarTerms2026[dateKey]) {
    solarTerm = solarTerms2026[dateKey];
  }

  if (date.getFullYear() === 2026) {
    const daysSinceSpringFestival = Math.floor((targetDate - springFestival2026) / (1000 * 60 * 60 * 24));
    if (daysSinceSpringFestival >= 0) {
      let lunarMonthIndex = 0;
      let accumulatedDays = 0;
      while (lunarMonthIndex < lunarMonths2026.length && accumulatedDays + lunarMonths2026[lunarMonthIndex] <= daysSinceSpringFestival) {
        accumulatedDays += lunarMonths2026[lunarMonthIndex];
        lunarMonthIndex++;
      }
      const lunarMonth = lunarMonths[lunarMonthIndex];
      const lunarDayIndex = daysSinceSpringFestival - accumulatedDays;
      const lunarDay = lunarDays[lunarDayIndex];
      return `${lunarMonth}${lunarDay}${solarTerm ? ' ' + solarTerm : ''}`;
    }
  }

  const startDate = new Date(2000, 0, 1);
  const daysSince2000 = Math.floor((targetDate - startDate) / (1000 * 60 * 60 * 24));
  const springFestival2000 = 35;
  const lunarYearOffset = Math.floor((daysSince2000 + springFestival2000) / 365.25);
  const springFestival = springFestival2000 + lunarYearOffset * 365.25;
  const daysSinceSpringFestival = daysSince2000 - Math.floor(springFestival);
  let lunarMonthIndex = Math.floor(daysSinceSpringFestival / 30);
  lunarMonthIndex = Math.min(lunarMonthIndex, 11);
  const lunarMonth = lunarMonths[lunarMonthIndex];
  const lunarDayIndex = daysSinceSpringFestival % 30;
  const lunarDay = lunarDays[lunarDayIndex];
  return `${lunarMonth}${lunarDay}${solarTerm ? ' ' + solarTerm : ''}`;
}

// 1. 实时时间日期
function upTime() {
  let d = new Date();
  let week = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
  let dateStr = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${week[d.getDay()]}`;
  let h = String(d.getHours()).padStart(2, 0);
  let m = String(d.getMinutes()).padStart(2, 0);
  let s = String(d.getSeconds()).padStart(2, 0);
  let timeStr = `${h}:${m}:${s}`;
  let lunarStr = getLunarDate(d);

  document.getElementById("dateBox").innerText = dateStr;
  document.getElementById("timeBox").innerText = timeStr;

  let lunarElement = document.getElementById("lunarBox");
  if (!lunarElement) {
    lunarElement = document.createElement("a");
    lunarElement.id = "lunarBox";
    lunarElement.className = "lunar-info";
    lunarElement.style.textDecoration = "none";
    lunarElement.style.color = "inherit";
    lunarElement.style.cursor = "pointer";
    lunarElement.addEventListener("click", function () {
      const d = new Date();
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const url = `https://wannianli.tianqi.com/${year}${month}${day}/`;
      window.open(url, "_blank");
    });
    document.querySelector(".weather-content").appendChild(lunarElement);
  }
  lunarElement.innerText = lunarStr;
}
setInterval(upTime, 1000);
upTime();

// 2. 省份和城市数据
const provinceCityData = {
  "北京市": ["北京市"],
  "天津市": ["天津市"],
  "上海市": ["上海市"],
  "重庆市": ["重庆市"],
  "河北省": ["石家庄市", "唐山市", "秦皇岛市", "邯郸市", "邢台市", "保定市", "张家口市", "承德市", "沧州市", "廊坊市", "衡水市"],
  "山西省": ["太原市", "大同市", "阳泉市", "长治市", "晋城市", "朔州市", "晋中市", "运城市", "忻州市", "临汾市", "吕梁市"],
  "辽宁省": ["沈阳市", "大连市", "鞍山市", "抚顺市", "本溪市", "丹东市", "锦州市", "营口市", "阜新市", "辽阳市", "盘锦市", "铁岭市", "朝阳市", "葫芦岛市"],
  "吉林省": ["长春市", "吉林市", "四平市", "辽源市", "通化市", "白山市", "松原市", "白城市", "延边朝鲜族自治州"],
  "黑龙江省": ["哈尔滨市", "齐齐哈尔市", "鸡西市", "鹤岗市", "双鸭山市", "大庆市", "伊春市", "佳木斯市", "七台河市", "牡丹江市", "黑河市", "绥化市", "大兴安岭地区"],
  "江苏省": ["南京市", "无锡市", "徐州市", "常州市", "苏州市", "南通市", "连云港市", "淮安市", "盐城市", "扬州市", "镇江市", "泰州市", "宿迁市"],
  "浙江省": ["杭州市", "宁波市", "温州市", "嘉兴市", "湖州市", "绍兴市", "金华市", "衢州市", "舟山市", "台州市", "丽水市"],
  "安徽省": ["合肥市", "芜湖市", "蚌埠市", "淮南市", "马鞍山市", "淮北市", "铜陵市", "安庆市", "黄山市", "滁州市", "阜阳市", "宿州市", "六安市", "亳州市", "池州市", "宣城市"],
  "福建省": ["福州市", "厦门市", "莆田市", "三明市", "泉州市", "漳州市", "南平市", "龙岩市", "宁德市"],
  "江西省": ["南昌市", "景德镇市", "萍乡市", "九江市", "新余市", "鹰潭市", "赣州市", "吉安市", "宜春市", "抚州市", "上饶市"],
  "山东省": ["济南市", "青岛市", "淄博市", "枣庄市", "东营市", "烟台市", "潍坊市", "济宁市", "泰安市", "威海市", "日照市", "临沂市", "德州市", "聊城市", "滨州市", "菏泽市"],
  "河南省": ["郑州市", "开封市", "洛阳市", "平顶山市", "安阳市", "鹤壁市", "新乡市", "焦作市", "濮阳市", "许昌市", "漯河市", "三门峡市", "南阳市", "商丘市", "信阳市", "周口市", "驻马店市"],
  "湖北省": ["武汉市", "黄石市", "十堰市", "宜昌市", "襄阳市", "鄂州市", "荆门市", "孝感市", "荆州市", "黄冈市", "咸宁市", "随州市", "恩施土家族苗族自治州"],
  "湖南省": ["长沙市", "株洲市", "湘潭市", "衡阳市", "邵阳市", "岳阳市", "常德市", "张家界市", "益阳市", "郴州市", "永州市", "怀化市", "娄底市", "湘西土家族苗族自治州"],
  "广东省": ["广州市", "深圳市", "珠海市", "汕头市", "佛山市", "韶关市", "湛江市", "肇庆市", "江门市", "茂名市", "惠州市", "梅州市", "汕尾市", "河源市", "阳江市", "清远市", "东莞市", "中山市", "潮州市", "揭阳市", "云浮市"],
  "海南省": ["海口市", "三亚市", "三沙市", "儋州市"],
  "四川省": ["成都市", "自贡市", "攀枝花市", "泸州市", "德阳市", "绵阳市", "广元市", "遂宁市", "内江市", "乐山市", "南充市", "眉山市", "宜宾市", "广安市", "达州市", "雅安市", "巴中市", "资阳市", "阿坝藏族羌族自治州", "甘孜藏族自治州", "凉山彝族自治州"],
  "贵州省": ["贵阳市", "六盘水市", "遵义市", "安顺市", "毕节市", "铜仁市", "黔西南布依族苗族自治州", "黔东南苗族侗族自治州", "黔南布依族苗族自治州"],
  "云南省": ["昆明市", "曲靖市", "玉溪市", "保山市", "昭通市", "丽江市", "普洱市", "临沧市", "楚雄彝族自治州", "红河哈尼族彝族自治州", "文山壮族苗族自治州", "西双版纳傣族自治州", "大理白族自治州", "德宏傣族景颇族自治州", "怒江傈僳族自治州", "迪庆藏族自治州"],
  "陕西省": ["西安市", "铜川市", "宝鸡市", "咸阳市", "渭南市", "延安市", "汉中市", "榆林市", "安康市", "商洛市"],
  "甘肃省": ["兰州市", "嘉峪关市", "金昌市", "白银市", "天水市", "武威市", "张掖市", "平凉市", "酒泉市", "庆阳市", "定西市", "陇南市", "临夏回族自治州", "甘南藏族自治州"],
  "青海省": ["西宁市", "海东市", "海北藏族自治州", "黄南藏族自治州", "海南藏族自治州", "果洛藏族自治州", "玉树藏族自治州", "海西蒙古族藏族自治州"],
  "内蒙古自治区": ["呼和浩特市", "包头市", "乌海市", "赤峰市", "通辽市", "鄂尔多斯市", "呼伦贝尔市", "巴彦淖尔市", "乌兰察布市", "兴安盟", "锡林郭勒盟", "阿拉善盟"],
  "广西壮族自治区": ["南宁市", "柳州市", "桂林市", "梧州市", "北海市", "防城港市", "钦州市", "贵港市", "玉林市", "百色市", "贺州市", "河池市", "来宾市", "崇左市"],
  "西藏自治区": ["拉萨市", "日喀则市", "昌都市", "林芝市", "山南市", "那曲市", "阿里地区"],
  "宁夏回族自治区": ["银川市", "石嘴山市", "吴忠市", "固原市", "中卫市"],
  "新疆维吾尔自治区": ["乌鲁木齐市", "克拉玛依市", "吐鲁番市", "哈密市", "昌吉回族自治州", "博尔塔拉蒙古自治州", "巴音郭楞蒙古自治州", "阿克苏地区", "克孜勒苏柯尔克孜自治州", "喀什地区", "和田地区", "伊犁哈萨克自治州", "塔城地区", "阿勒泰地区"],
  "香港特别行政区": ["香港特别行政区"],
  "澳门特别行政区": ["澳门特别行政区"],
  "台湾省": ["台北市", "新北市", "桃园市", "台中市", "台南市", "高雄市"]
};

// 初始化省份下拉框
function initProvinces() {
  const provinceSelect = document.getElementById("editProvince");
  for (const province in provinceCityData) {
    const option = document.createElement("option");
    option.value = province;
    option.textContent = province;
    provinceSelect.appendChild(option);
  }
}

// 根据所选省份更新城市下拉框
function updateCities() {
  const provinceSelect = document.getElementById("editProvince");
  const citySelect = document.getElementById("editCity");
  const selectedProvince = provinceSelect.value;

  citySelect.innerHTML = '<option value="">选择城市</option>';

  if (selectedProvince && provinceCityData[selectedProvince]) {
    provinceCityData[selectedProvince].forEach(city => {
      const option = document.createElement("option");
      option.value = city;
      option.textContent = city;
      citySelect.appendChild(option);
    });
  }
}

// 3. 头像更换 + 本地储存
let avatarImg = document.getElementById("avatarImg");
let avatarUp = document.getElementById("avatarUp");
avatarUp.onchange = function (e) {
  let file = e.target.files[0];
  if (file) {
    let reader = new FileReader();
    reader.onload = function (e) {
      let base64Url = e.target.result;
      avatarImg.src = base64Url;
      avatarImg.style.objectFit = "cover";
      avatarImg.style.objectPosition = "center";
      localStorage.setItem("feiYiAvatar", base64Url);
    };
    reader.readAsDataURL(file);
  }
}

// 4. 页面加载读取本地缓存数据
window.onload = function () {
  if (localStorage.getItem("feiYiAvatar")) avatarImg.src = localStorage.getItem("feiYiAvatar");
  document.getElementById("userName").value = localStorage.getItem("userName") || "";
  document.getElementById("userSign").value = localStorage.getItem("userSign") || "";
  document.getElementById("likeFeiYi").value = localStorage.getItem("likeFeiYi") || "";
  document.getElementById("editNick").value = localStorage.getItem("editNick") || "";
  document.getElementById("editPhone").value = localStorage.getItem("editPhone") || "";
  document.getElementById("editEmail").value = localStorage.getItem("editEmail") || "";

  initProvinces();

  const savedProvince = localStorage.getItem("editProvince");
  const savedCity = localStorage.getItem("editCity");
  if (savedProvince) {
    document.getElementById("editProvince").value = savedProvince;
    updateCities();
    if (savedCity) {
      document.getElementById("editCity").value = savedCity;
    }
  }

  document.getElementById("editNick").addEventListener("input", function () {
    document.getElementById("userName").value = this.value;
  });

  document.getElementById("userName").addEventListener("input", function () {
    document.getElementById("editNick").value = this.value;
  });
}

// 5. 保存所有修改
function saveAllData() {
  localStorage.setItem("userName", document.getElementById("userName").value);
  localStorage.setItem("userSign", document.getElementById("userSign").value);
  localStorage.setItem("likeFeiYi", document.getElementById("likeFeiYi").value);
  localStorage.setItem("editNick", document.getElementById("editNick").value);
  localStorage.setItem("editPhone", document.getElementById("editPhone").value);
  localStorage.setItem("editEmail", document.getElementById("editEmail").value);
  localStorage.setItem("editProvince", document.getElementById("editProvince").value);
  localStorage.setItem("editCity", document.getElementById("editCity").value);
}
// 个人主页获取登录用户信息
async function loadMyPage() {
  const user = await fetch('/api/user').then(r => r.json())
  if (!user) {
    alert('请先登录')
    location.href = './登录.html'
    return
  }
  // 赋值头像
  document.getElementById('avatarImg').src = user.avatar
  // 赋值昵称
  document.getElementById('userName').value = user.name
}
loadMyPage()