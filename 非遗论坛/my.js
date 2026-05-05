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

const nameInput = document.getElementById('nameInput');
const contentInput = document.getElementById('contentInput');
const publishBtn = document.getElementById('publishBtn');
const postList = document.getElementById('postList');

let posts = JSON.parse(localStorage.getItem('forumPosts')) || [];

function renderPosts() {
  if (posts.length === 0) {
    postList.innerHTML = '<div class="empty-tip">暂无帖子，快来发表第一条评论吧～</div>';
    return;
  }

  postList.innerHTML = posts.map((post, index) => `
    <div class="post-item" data-index="${index}">
      <div class="post-header">
        <span class="post-name">${post.name}</span>
        <span class="post-time">${post.time}</span>
      </div>
      <div class="post-content">${post.content}</div>

      <div class="post-actions">
        <button class="btn-reply" onclick="toggleReply(${index})">回复</button>
        <button class="btn-del" onclick="deletePost(${index})">删除</button>
      </div>

      <div class="reply-box" id="replyBox${index}">
        <input type="text" class="reply-input" id="replyInput${index}" placeholder="回复内容">
        <button class="reply-submit" onclick="submitReply(${index})">发送</button>
      </div>

      <div class="reply-list">
        ${(post.replies || []).map((r, i) => `
          <div class="reply-item">
            <span class="reply-name">${r.name}：</span>
            <span class="reply-text">${r.content}</span>
            <span class="reply-time">${r.time}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function publishPost() {
  const name = nameInput.value.trim();
  const content = contentInput.value.trim();

  if (!name) return alert('请输入昵称');
  if (!content) return alert('请输入内容');

  const now = new Date();
  const timeStr = fmtTime(now);

  posts.unshift({
    name,
    content,
    time: timeStr,
    replies: []
  });

  save();
  contentInput.value = '';
  renderPosts();
}

function submitReply(postIndex) {
  const input = document.getElementById(`replyInput${postIndex}`);
  const content = input.value.trim();
  const name = nameInput.value.trim();

  if (!name) return alert('请先填写昵称');
  if (!content) return;

  posts[postIndex].replies.push({
    name,
    content,
    time: fmtTime(new Date())
  });

  input.value = '';
  save();
  renderPosts();
}

function toggleReply(index) {
  const box = document.getElementById(`replyBox${index}`);
  box.classList.toggle('show');
}

function deletePost(index) {
  if (!confirm('确定删除该帖子及所有回复吗？')) return;
  posts.splice(index, 1);
  save();
  renderPosts();
}

function save() {
  localStorage.setItem('forumPosts', JSON.stringify(posts));
}

function fmtTime(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function pad(n) {
  return n.toString().padStart(2, '0');
}

publishBtn.addEventListener('click', publishPost);
window.addEventListener('DOMContentLoaded', renderPosts);
function goMyPage() {
  location.href = "../个人主页/index.html";
}