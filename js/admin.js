/* ==================== DATA ==================== */

/* Hiện lỗi JS (nếu có) để dễ tìm nguyên nhân */
window.addEventListener('error', e => { if (e.message) alert('Lỗi: ' + e.message + (e.lineno ? ' (dòng ' + e.lineno + ')' : '')); });
window.addEventListener('unhandledrejection', e => alert('Lỗi: ' + (e.reason && e.reason.message || e.reason)));

if (typeof getData !== 'function' || typeof setData !== 'function')
  throw new Error('Chưa nạp data.js — hãy đặt <script src="../js/data.js"> trước admin.js');
if (typeof seedData === 'function') seedData();

/* ==========================================================
   2. TIỆN ÍCH
   ========================================================== */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = v => Number(v || 0).toLocaleString("vi-VN") + " VNĐ";
const norm = s => String(s || '').toLowerCase();
const statusText = {pending:"Chờ xử lý", processing:"Đang xử lý", delivered:"Đã giao", cancelled:"Đã hủy"};
const getOrderStatus = s => statusText[s] || s;
const badge = (cls, text) => `<span class="badge badge-${cls}">${text}</span>`;
const imgSrc = v => !v ? '' : /^(data:|https?:|\/)/i.test(v) ? v : '../images/books/' + v;

function generateId(prefix, data, field) {
  const max = data.reduce((m, x) => {
    const n = parseInt(String(x[field] || "").replace(prefix, ""));
    return !isNaN(n) && n > m ? n : m;
  }, 0);
  return prefix + String(max + 1).padStart(3, "0");
}
const heading = (t, sub, btn) => `<section class="page-heading"><div><h1>${t}</h1><p>${sub}</p></div>${btn || ''}</section>`;
const mh = (t, closeFn = 'closeModal()') => `<div class="modal-header"><h2>${t}</h2><button type="button" class="close-btn" aria-label="Đóng" onclick="${closeFn}">&times;</button></div>`;
function openModal(html, id = 'modal') {
  const m = $('#' + id); m.innerHTML = `<div class="modal-content">${html}</div>`;
  m.classList.add('show'); m.style.display = 'flex';
}
function closeModal(id = 'modal') {
  const m = $('#' + id); m.classList.remove('show'); m.style.display = 'none'; m.innerHTML = '';
}
 /* ==========================================================
        3. XÁC THỰC / ĐIỀU HƯỚNG (form đăng nhập nằm ở auth.html)
        ========================================================== */
        const PAGES = {};
        function checkAuth() {
          // Guard ở <head> đã chặn người chưa đăng nhập; kiểm tra lại để chắc chắn (vd. phiên hết hạn)
          if (!AdminAuth.isLoggedIn()) { AdminAuth.requireLogin(); return; }
          $('#adminView').hidden = false;
          route();
        }
        function logout() { AdminAuth.logout(); }

        function route() {
        if (!AdminAuth.isLoggedIn()) { AdminAuth.requireLogin(); return; }
        let page = location.hash.slice(1);
        if (!PAGES[page]) page = 'dashboard';
        document.querySelectorAll('#adminNav a').forEach(a => a.classList.toggle('active', a.dataset.page === page));
        closeModal(); closeModal('modal2');
        PAGES[page]();
        window.scrollTo(0, 0);
        }
        window.addEventListener('hashchange', route);
/* ==========================================================
   4. DASHBOARD
   ========================================================== */
PAGES.dashboard = () => {
  const orders = getData("orders"), customers = getData("customers");
  const revenue = orders.filter(o => o.orderStatus !== "cancelled").reduce((s, o) => s + Number(o.totalAmount || 0), 0);
  const stat = (t, id, v, ic) => `<div class="stat-card"><div><h3>${t}</h3><strong id="${id}">${v}</strong></div><div class="stat-icon">${ic}</div></div>`;
  const recent = [...orders].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)).slice(0, 5);
  $('#app').innerHTML = heading('Dashboard', 'Quản lý hoạt động BookHub') + `
  <section class="dashboard-grid">
    ${stat('Sản phẩm','productCount',getData("products").length,'📚')}
    ${stat('Danh mục','categoryCount',getData("categories").length,'📁')}
    ${stat('Khách hàng','customerCount',customers.length,'👤')}
    ${stat('Đơn hàng','orderCount',orders.length,'🛒')}
    ${stat('Doanh thu','revenue',money(revenue),'💰')}
    ${stat('Đơn chờ xử lý','pendingCount',orders.filter(o => o.orderStatus === "pending").length,'⌛')}
  </section>
  <section class="panel">
    <div class="panel-header"><h2>Đơn hàng gần đây</h2><a href="#orders" class="btn">Xem tất cả</a></div>
    <div class="table-wrap"><table class="data-table">
      <thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Ngày đặt</th><th>Tổng tiền</th><th>Trạng thái</th></tr></thead>
      <tbody id="recentOrders">${recent.map(o => {
        const c = customers.find(x => x.customerId === o.customerId);
        return `<tr><td>${esc(o.orderId)}</td><td>${esc(c?.fullName || o.customerId)}</td><td>${esc(o.orderDate)}</td><td>${money(o.totalAmount)}</td><td>${badge(o.orderStatus, getOrderStatus(o.orderStatus))}</td></tr>`;
      }).join('') || '<tr><td colspan="5" class="empty">Chưa có đơn hàng</td></tr>'}</tbody>
    </table></div>
  </section>`;
};

/* ==========================================================
   5. DANH MỤC
   ========================================================== */
PAGES.categories = () => {
  $('#app').innerHTML = heading('Danh mục', 'Quản lý danh mục sách', '<button class="btn" onclick="openCategoryForm()">+ Thêm danh mục</button>') + `
  <section class="panel">
    <div class="toolbar"><input id="categorySearch" class="search-input" type="text" placeholder="Tìm danh mục..."></div>
    <div class="table-wrap"><table class="data-table">
      <thead><tr><th>Mã danh mục</th><th>Tên danh mục</th><th>Số sản phẩm</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
      <tbody id="categoryList"></tbody></table></div>
  </section>`;
  $('#categorySearch').oninput = renderCategories; renderCategories();
};
function renderCategories() {
  const products = getData("products"), key = norm($('#categorySearch')?.value);
  const result = getData("categories").filter(c => norm(c.categoryId).includes(key) || norm(c.categoryName).includes(key));
  $('#categoryList').innerHTML = result.map(c => `
    <tr><td>${esc(c.categoryId)}</td><td>${esc(c.categoryName)}</td><td>${products.filter(p => p.categoryId === c.categoryId).length}</td>
    <td>${badge(c.status, c.status === "active" ? "Hoạt động" : "Ẩn")}</td>
    <td><button class="btn btn-small" onclick="openCategoryForm('${c.categoryId}')">Sửa</button>
    <button class="btn btn-small btn-danger" onclick="deleteCategory('${c.categoryId}')">Xóa</button></td></tr>`).join('')
    || '<tr><td colspan="5" class="empty">Không có danh mục</td></tr>';
}
function openCategoryForm(id = "") {
  const c = getData("categories").find(x => x.categoryId === id);
  openModal(mh(c ? 'Sửa danh mục' : 'Thêm danh mục', 'closeCategoryForm()') + `
  <form onsubmit="saveCategory(event)"><input type="hidden" id="categoryId" value="${esc(c?.categoryId)}">
    <div class="form-group"><label>Tên danh mục</label><input type="text" id="categoryName" required value="${esc(c?.categoryName)}"></div>
    <div class="form-group"><label>Trạng thái</label><select id="categoryStatus">
      <option value="active" ${c?.status !== 'inactive' ? 'selected' : ''}>Hoạt động</option>
      <option value="inactive" ${c?.status === 'inactive' ? 'selected' : ''}>Ẩn</option></select></div>
    <div class="form-actions"><button type="button" class="btn" onclick="closeCategoryForm()">Hủy</button><button type="submit" class="btn btn-primary">Lưu</button></div>
  </form>`);
}
const closeCategoryForm = () => closeModal();
function saveCategory(e) {
  e.preventDefault();
  const data = getData("categories"), id = $('#categoryId').value, name = $('#categoryName').value.trim(), status = $('#categoryStatus').value;
  if (!name) return alert("Vui lòng nhập tên danh mục");
  if (id) {
    const c = data.find(x => x.categoryId === id);   // giữ nguyên trường "key" mà trang khách dùng để lọc
    if (c) Object.assign(c, {categoryName: name, status});
  } else {
    const categoryId = generateId("DM", data, "categoryId");
    const keyBase = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D")
      .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    let key = keyBase || categoryId.toLowerCase();
    if (data.some(c => c.key === key)) key = `${key}-${categoryId.toLowerCase()}`;
    data.push({categoryId, key, categoryName: name, status});
  }
  setData("categories", data); closeCategoryForm(); renderCategories();
}
function deleteCategory(id) {
  if (getData("products").some(p => p.categoryId === id)) return alert("Không thể xóa danh mục đang có sản phẩm");
  if (!confirm("Bạn có chắc muốn xóa danh mục này?")) return;
  setData("categories", getData("categories").filter(c => c.categoryId !== id)); renderCategories();
}

/* ==========================================================
   6. SẢN PHẨM
   ========================================================== */
PAGES.products = () => {
  $('#app').innerHTML = heading('Sản phẩm', 'Quản lý sách trong cửa hàng', '<button class="btn" onclick="openProductForm()">+ Thêm sản phẩm</button>') + `
  <section class="panel">
    <div class="toolbar"><input id="productSearch" class="search-input" type="text" placeholder="Tìm sản phẩm..."></div>
    <div class="table-wrap"><table class="data-table">
      <thead><tr><th>Mã SP</th><th>Tên sách</th><th>Danh mục</th><th>Tác giả</th><th>Giá nhập</th><th>Giá bán</th><th>Tồn kho</th><th>Thao tác</th></tr></thead>
      <tbody id="productList"></tbody></table></div>
  </section>`;
  $('#productSearch').oninput = renderProducts; renderProducts();
};
function renderProducts() {
  const cats = getData("categories"), key = norm($('#productSearch')?.value);
  const result = getData("products").filter(p => norm(p.productId).includes(key) || norm(p.productName).includes(key) || norm(p.author).includes(key));
  $('#productList').innerHTML = result.map(p => `
    <tr><td>${esc(p.productId)}</td><td>${esc(p.productName)}</td><td>${esc(cats.find(c => c.categoryId === p.categoryId)?.categoryName)}</td>
    <td>${esc(p.author)}</td><td>${money(p.importPrice)}</td><td>${money(p.salePrice)}</td><td>${p.stockQuantity || 0}</td>
    <td><button class="btn btn-small" onclick="openProductForm('${p.productId}')">Sửa</button>
    <button class="btn btn-small btn-danger" onclick="deleteProduct('${p.productId}')">Xóa</button></td></tr>`).join('')
    || '<tr><td colspan="8" class="empty">Không có sản phẩm</td></tr>';
}
function openProductForm(id = "") {
  const cats = getData("categories"), p = getData("products").find(x => String(x.productId) === String(id)), saved = imgSrc(p?.image);
  openModal(mh(p ? 'Sửa sản phẩm' : 'Thêm sản phẩm', 'closeProductForm()') + `
  <form onsubmit="saveProduct(event)"><input type="hidden" id="productId" value="${esc(p?.productId)}">
    <div class="form-grid">
      <div class="form-group full"><label>Tên sản phẩm</label><input id="productName" type="text" required value="${esc(p?.productName)}"></div>
      <div class="form-group"><label>Tác giả</label><input id="productAuthor" value="${esc(p?.author)}"></div>
      <div class="form-group"><label>Nhà xuất bản</label><input id="productPublisher" value="${esc(p?.publisher)}"></div>
      <div class="form-group"><label>Danh mục</label><select id="productCategory">${cats.map(c => `<option value="${c.categoryId}" ${c.categoryId === (p?.categoryId || cats[0]?.categoryId) ? 'selected' : ''}>${esc(c.categoryName)}</option>`).join('')}</select></div>
      <div class="form-group"><label>Giá nhập</label><input id="productImportPrice" type="number" min="0" required value="${p?.importPrice || 0}"></div>
      <div class="form-group"><label>Tỷ lệ lợi nhuận (%)</label><input id="productProfitRate" type="number" min="0" value="${p?.profitRate ?? 30}"></div>
      <div class="form-group"><label>Số lượng tồn</label><input id="productStock" type="number" min="0" value="${p?.stockQuantity || 0}"></div>
      <div class="form-group full"><label for="productImage">Ảnh sản phẩm</label>
        <input type="file" id="productImage" accept="image/*">
        <img id="productImagePreview" alt="Xem trước ảnh sản phẩm" ${saved ? `src="${esc(saved)}"` : ''} style="display:${saved ? 'block' : 'none'};width:150px;max-height:200px;object-fit:contain;margin-top:10px;"></div>
      <div class="form-group full"><label>Mô tả</label><textarea id="productDescription">${esc(p?.description)}</textarea></div>
    </div>
    <div class="form-actions"><button type="button" class="btn" onclick="closeProductForm()">Hủy</button><button type="submit" class="btn btn-primary">Lưu</button></div>
  </form>`);
  const input = $('#productImage'), prev = $('#productImagePreview');
  prev.onerror = () => { prev.style.display = 'none'; };
  input.onchange = () => {
    const f = input.files[0]; if (!f) return;
    if (!f.type.startsWith("image/")) { alert("Vui lòng chọn một tệp hình ảnh."); input.value = ""; return; }
    if (f.size > 2 * 1024 * 1024) { alert("Ảnh không được vượt quá 2 MB."); input.value = ""; return; }
    prev.src = URL.createObjectURL(f); prev.style.display = "block";
  };
}
const closeProductForm = () => closeModal();
async function saveProduct(e) {
  e.preventDefault();
  const products = getData("products"), id = $('#productId').value, old = products.find(x => String(x.productId) === String(id));
  const file = $('#productImage').files[0];
  let image = old?.image || "";
  if (file) {
    if (!file.type.startsWith("image/")) return alert("Vui lòng chọn một tệp hình ảnh hợp lệ.");
    if (file.size > 2 * 1024 * 1024) return alert("Ảnh không được vượt quá 2 MB.");
    try {
      image = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => rej(); r.readAsDataURL(file); });
    } catch { return alert("Không thể đọc ảnh. Vui lòng thử lại."); }
  }
  const p = {
    productId: id || generateId("MS", products, "productId"), productName: $('#productName').value.trim(),
    categoryId: $('#productCategory').value, author: $('#productAuthor').value.trim(), publisher: $('#productPublisher').value.trim(),
    importPrice: Number($('#productImportPrice').value), profitRate: Number($('#productProfitRate').value),
    stockQuantity: Number($('#productStock').value), description: $('#productDescription').value.trim(),
    image, status: old?.status || "active"};
  if (!p.productName) return alert("Vui lòng nhập tên sản phẩm.");
  if (p.importPrice < 0 || p.profitRate < 0 || p.stockQuantity < 0) return alert("Giá nhập, lợi nhuận và tồn kho không được âm.");
  p.salePrice = Math.round(p.importPrice * (1 + p.profitRate / 100));
  const i = products.findIndex(x => String(x.productId) === String(id));
  if (i >= 0) products[i] = {...products[i], ...p}; else products.push(p);
  try { setData("products", products); } catch { return alert("Không đủ dung lượng lưu ảnh. Hãy chọn ảnh nhỏ hơn."); }
  closeProductForm(); renderProducts();
}
function deleteProduct(id) {
  if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
  setData("products", getData("products").filter(p => p.productId !== id)); renderProducts();
}

/* ==========================================================
   7. KHÁCH HÀNG  (trường: customerId, userName, fullName, email, phone, address, status, password)
   ========================================================== */
const CUS = {page: 1, size: 5};
const cUser = c => c.userName || c.username || "";
PAGES.customers = () => {
  CUS.page = 1;
  $('#app').innerHTML = heading('Quản lý khách hàng', 'Quản lý thông tin và trạng thái tài khoản khách hàng') + `
  <section class="stats-grid">
    <div class="stat-card"><div><h3>Tổng khách hàng</h3><strong id="totalCustomers">0</strong><small>Tổng số tài khoản</small></div><span class="stat-icon">♙</span></div>
    <div class="stat-card"><div><h3>Đang hoạt động</h3><strong id="activeCustomers">0</strong><small>Tài khoản đang mở</small></div><span class="stat-icon">✓</span></div>
    <div class="stat-card"><div><h3>Đã khóa</h3><strong id="lockedCustomers">0</strong><small>Tài khoản bị khóa</small></div><span class="stat-icon">⊘</span></div>
  </section>
  <section class="panel">
    <div class="panel-header"><h2>Danh sách khách hàng</h2><button type="button" class="btn" id="refreshBtn">Làm mới</button></div>
    <div class="toolbar">
      <input type="search" id="customerSearch" class="search-input" placeholder="Tìm tên, mã KH, email, SĐT...">
      <select id="customerFilter"><option value="all">Tất cả trạng thái</option><option value="active">Hoạt động</option><option value="inactive">Đã khóa</option></select>
      <button type="button" class="btn" id="clearFilterBtn">Xóa lọc</button>
    </div>
    <p id="customerNotice" class="notice" role="status" hidden></p>
    <div class="table-wrap"><table class="data-table">
      <thead><tr><th>Mã KH</th><th>Tên đăng nhập</th><th>Họ và tên</th><th>Email</th><th>Số điện thoại</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
      <tbody id="customerList"></tbody></table></div>
    <div class="form-actions">
      <span id="customerCount">0 khách hàng</span>
      <button type="button" class="btn btn-small" id="prevBtn">Trước</button>
      <span id="pageInfo">1 / 1</span>
      <button type="button" class="btn btn-small" id="nextBtn">Sau</button>
    </div>
  </section>`;
  $('#customerSearch').oninput = () => { CUS.page = 1; renderCustomers(); };
  $('#customerFilter').onchange = () => { CUS.page = 1; renderCustomers(); };
  $('#clearFilterBtn').onclick = () => { $('#customerSearch').value = ''; $('#customerFilter').value = 'all'; CUS.page = 1; renderCustomers(); };
  $('#refreshBtn').onclick = () => { CUS.page = 1; renderCustomers(); };
  $('#prevBtn').onclick = () => { CUS.page--; renderCustomers(); };
  $('#nextBtn').onclick = () => { CUS.page++; renderCustomers(); };
  renderCustomers();
};
function renderCustomers() {
  const all = getData("customers"), q = norm($('#customerSearch').value), f = $('#customerFilter').value;
  const list = all.filter(c => (f === 'all' || c.status === f) && norm((c.customerId || '') + cUser(c) + (c.fullName || '') + (c.email || '') + (c.phone || '')).includes(q));
  const pages = Math.max(1, Math.ceil(list.length / CUS.size));
  CUS.page = Math.min(Math.max(1, CUS.page), pages);
  $('#totalCustomers').textContent = all.length;
  $('#activeCustomers').textContent = all.filter(c => c.status !== 'inactive').length;
  $('#lockedCustomers').textContent = all.filter(c => c.status === 'inactive').length;
  $('#customerCount').textContent = list.length + ' khách hàng';
  $('#pageInfo').textContent = CUS.page + ' / ' + pages;
  $('#prevBtn').disabled = CUS.page <= 1; $('#nextBtn').disabled = CUS.page >= pages;
  $('#customerList').innerHTML = list.slice((CUS.page - 1) * CUS.size, CUS.page * CUS.size).map(c => {
    const act = c.status !== 'inactive';
    return `<tr><td>${esc(c.customerId)}</td><td>${esc(cUser(c))}</td><td>${esc(c.fullName)}</td><td>${esc(c.email)}</td><td>${esc(c.phone)}</td>
    <td>${badge(act ? 'active' : 'inactive', act ? 'Hoạt động' : 'Đã khóa')}</td>
    <td><button class="btn btn-small" onclick="viewCustomer('${c.customerId}')">Xem</button>
    <button class="btn btn-small" onclick="toggleCustomer('${c.customerId}')">${act ? 'Khóa' : 'Mở khóa'}</button>
    <button class="btn btn-small" onclick="openReset('${c.customerId}')">Đặt lại MK</button></td></tr>`;
  }).join('') || '<tr><td colspan="7" class="empty">Không tìm thấy khách hàng</td></tr>';
}
function toggleCustomer(id) {
  const data = getData("customers"), c = data.find(x => x.customerId === id); if (!c) return;
  const lock = c.status !== 'inactive';
  if (!confirm((lock ? 'Khóa' : 'Mở khóa') + ' tài khoản ' + cUser(c) + '?')) return;
  c.status = lock ? 'inactive' : 'active'; setData("customers", data); renderCustomers();
}
function viewCustomer(id) {
  const data = getData("customers"), c = data.find(x => x.customerId === id); if (!c) return;
  const inp = (i, l, v, extra = '') => `<div class="form-group ${i === 'address' ? 'full' : ''}"><label for="${i}">${l}</label><input id="${i}" value="${esc(v)}" ${extra} readonly></div>`;
  openModal(mh('Thông tin khách hàng') + `
  <form id="customerForm"><div class="form-grid">
    ${inp('customerId','Mã khách hàng',c.customerId)}${inp('userName','Tên đăng nhập',cUser(c))}
    ${inp('fullName','Họ và tên *',c.fullName,'required minlength="2" maxlength="80"')}
    ${inp('email','Email *',c.email,'type="email" required')}
    ${inp('phone','Số điện thoại *',c.phone,'type="tel" maxlength="11" required')}
    ${inp('customerStatus','Trạng thái',c.status !== 'inactive' ? 'Hoạt động' : 'Đã khóa')}
    ${inp('address','Địa chỉ',c.address,'maxlength="200"')}
  </div>
  <p id="modalNotice" class="notice" role="status" hidden></p>
  <div class="form-actions">
    <button type="button" class="btn" onclick="closeModal()">Đóng</button>
    <button type="button" class="btn btn-warning" id="editBtn">Chỉnh sửa</button>
    <button type="submit" class="btn btn-primary" id="saveBtn" hidden>Lưu thay đổi</button>
  </div></form>`);
  $('#editBtn').onclick = () => {
    ['fullName','email','phone','address'].forEach(i => $('#' + i).removeAttribute('readonly'));
    $('#editBtn').hidden = true; $('#saveBtn').hidden = false;
  };
  $('#customerForm').onsubmit = e => {
    e.preventDefault();
    const n = $('#modalNotice');
    if (!/^\d{9,11}$/.test($('#phone').value.trim())) { n.textContent = 'Số điện thoại không hợp lệ (9–11 chữ số).'; n.hidden = false; return; }
    Object.assign(c, {fullName: $('#fullName').value.trim(), email: $('#email').value.trim(), phone: $('#phone').value.trim(), address: $('#address').value.trim()});
    setData("customers", data); closeModal(); renderCustomers();
  };
}
function openReset(id) {
  const data = getData("customers"), c = data.find(x => x.customerId === id); if (!c) return;
  openModal(mh('Đặt lại mật khẩu', "closeModal('modal2')") + `
  <p>Đặt lại mật khẩu cho: <strong>${esc(c.fullName)}</strong></p>
  <form id="resetPasswordForm">
    <div class="form-group" style="margin-top:16px"><label for="adminNewPassword">Mật khẩu mới</label><div class="search-wrapper"><input type="password" id="adminNewPassword" minlength="8" autocomplete="new-password" required><button type="button" class="togglePassword"data-target="currentPassword" aria-label="Giữ để hiện mật khẩu"><i data-lucide="eye-off" class="eyeOff"></i><i data-lucide="eye" class="eyeOn"></i></button></div></div>
    <div class="form-group" style="margin-top:16px"><label for="adminConfirmPassword">Nhập lại mật khẩu mới</label><div class="search-wrapper"><input type="password" id="adminConfirmPassword" minlength="8" autocomplete="new-password" required><button type="button" class="togglePassword"data-target="currentPassword" aria-label="Giữ để hiện mật khẩu"><i data-lucide="eye-off" class="eyeOff"></i><i data-lucide="eye" class="eyeOn"></i></button></div></div>
    <p id="resetPasswordNotice" class="notice" role="status" hidden></p>
    <div class="form-actions"><button type="button" class="btn" onclick="closeModal('modal2')">Hủy</button><button type="submit" class="btn btn-primary">Xác nhận đặt lại</button></div>
  </form>`, 'modal2');
  $('#resetPasswordForm').onsubmit = e => {
    e.preventDefault();
    const n = $('#resetPasswordNotice');
    if ($('#adminNewPassword').value !== $('#adminConfirmPassword').value) { n.textContent = 'Mật khẩu nhập lại không khớp.'; n.hidden = false; return; }
    c.password = $('#adminNewPassword').value; setData("customers", data); closeModal('modal2');
    const cn = $('#customerNotice'); cn.textContent = 'Đã đặt lại mật khẩu cho ' + c.fullName + '.'; cn.hidden = false;
  };
}

/* ==========================================================
   8. ĐƠN HÀNG  (orderId, customerId, orderDate, items[{productId, quantity, price}], totalAmount, orderStatus)
   ========================================================== */
PAGES.orders = () => {
  $('#app').innerHTML = heading('Quản lý đơn hàng', 'Tra cứu và cập nhật trạng thái đơn đặt hàng') + `
  <section class="panel">
    <div class="panel-header"><h2>Tra cứu đơn hàng</h2></div>
    <div class="admin-order-filter">
      <div class="admin-order-filter-group"><label for="adminOrderSearch">Mã đơn</label><input type="text" id="adminOrderSearch" placeholder="Ví dụ: DH001"></div>
      <div class="admin-order-filter-group"><label for="adminDateFrom">Từ ngày</label><input type="date" id="adminDateFrom"></div>
      <div class="admin-order-filter-group"><label for="adminDateTo">Đến ngày</label><input type="date" id="adminDateTo"></div>
      <div class="admin-order-filter-group"><label for="adminStatusFilter">Trạng thái</label>
        <select id="adminStatusFilter"><option value="">Tất cả</option>${Object.entries(statusText).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></div>
    </div>
    <div class="admin-filter-actions">
      <button type="button" class="btn btn-primary" id="adminFilterBtn">Tìm kiếm</button>
      <button type="button" class="btn" id="adminResetFilterBtn">Làm mới</button>
    </div>
  </section>
  <section class="panel">
    <div class="panel-header"><h2>Danh sách đơn hàng</h2><span id="adminOrderCount">0 đơn hàng</span></div>
    <div class="table-wrap"><table class="data-table admin-order-table">
      <thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Ngày đặt</th><th>Tổng tiền</th><th>Thanh toán</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
      <tbody id="adminOrderTableBody"></tbody></table></div>
    <div class="empty" id="adminEmptyOrders" hidden>Không tìm thấy đơn hàng phù hợp.</div>
  </section>`;
  $('#adminFilterBtn').onclick = renderOrders;
  $('#adminResetFilterBtn').onclick = () => { ['adminOrderSearch','adminDateFrom','adminDateTo','adminStatusFilter'].forEach(i => $('#' + i).value = ''); renderOrders(); };
  $('#adminOrderSearch').oninput = renderOrders;
  renderOrders();
};
function renderOrders() {
  const customers = getData("customers"), q = norm($('#adminOrderSearch').value.trim()), st = $('#adminStatusFilter').value;
  const from = $('#adminDateFrom').value ? new Date($('#adminDateFrom').value).getTime() : null;
  const to = $('#adminDateTo').value ? new Date($('#adminDateTo').value).getTime() + 86400000 - 1 : null;
  const list = getData("orders").filter(o => {
    const t = new Date(o.orderDate).getTime();
    return norm(o.orderId).includes(q) && (!st || o.orderStatus === st) && (from === null || isNaN(t) || t >= from) && (to === null || isNaN(t) || t <= to);
  }).sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
  $('#adminOrderCount').textContent = list.length + ' đơn hàng';
  $('#adminEmptyOrders').hidden = list.length > 0;
  $('#adminOrderTableBody').innerHTML = list.map(o => {
    const c = customers.find(x => x.customerId === o.customerId);
    return `<tr><td>${esc(o.orderId)}</td><td>${esc(c?.fullName || o.customerId)}</td><td>${esc(o.orderDate)}</td><td>${money(o.totalAmount)}</td>
    <td>${esc(o.paymentMethod || o.payment || '—')}</td><td>${badge(o.orderStatus, getOrderStatus(o.orderStatus))}</td>
    <td><button class="btn btn-small" onclick="viewOrder('${o.orderId}')">Chi tiết</button></td></tr>`;
  }).join('');
}
function viewOrder(id) {
  const o = getData("orders").find(x => x.orderId === id); if (!o) return;
  const c = getData("customers").find(x => x.customerId === o.customerId) || {}, products = getData("products");
  // Chịu được nhiều kiểu tên trường; thiếu đơn giá thì lấy giá bán hiện tại của sản phẩm
  const lines = (o.items || []).map(i => {
    const pr = products.find(p => String(p.productId) === String(i.productId ?? i.id ?? i.sku));
    const qty = Number(i.quantity ?? i.qty ?? i.soLuong ?? 0);
    const price = Number(i.price ?? i.unitPrice ?? i.salePrice ?? i.productPrice ?? pr?.salePrice ?? 0);
    return {name: i.productName || i.name || pr?.productName || i.productId, qty, price, sub: Number(i.subtotal ?? i.total ?? qty * price)};
  });
  const total = Number(o.totalAmount ?? o.total) || lines.reduce((t, l) => t + l.sub, 0);
  openModal(`<div class="admin-order-modal">${mh('Chi tiết đơn hàng')}<div id="adminOrderDetail">
    <p><strong>Mã đơn:</strong> ${esc(o.orderId)} &nbsp; <strong>Ngày đặt:</strong> ${esc(o.orderDate)} &nbsp; <strong>Thanh toán:</strong> ${esc(o.paymentMethod || o.payment || '—')}</p>
    <p><strong>Khách hàng:</strong> ${esc(c.fullName || o.customerId)} - ${esc(c.phone)} - ${esc(o.address || o.shippingAddress || c.address)}</p>
    <div class="table-wrap"><table class="data-table"><thead><tr><th>Sản phẩm</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th></tr></thead><tbody>
    ${lines.map(l => `<tr><td>${esc(l.name)}</td><td>${l.qty}</td><td>${money(l.price)}</td><td>${money(l.sub)}</td></tr>`).join('')}
    </tbody></table></div>
    <p class="total-box">Tổng tiền: <strong>${money(total)}</strong></p>
    <div class="form-group"><label>Trạng thái</label><select id="orderStatusSelect">
      ${Object.entries(statusText).map(([k, v]) => `<option value="${k}" ${k === o.orderStatus ? 'selected' : ''}>${v}</option>`).join('')}</select></div>
    <div class="form-actions"><button type="button" class="btn" onclick="closeModal()">Đóng</button>
      <button type="button" class="btn btn-primary" onclick="changeOrderStatus('${o.orderId}',$('#orderStatusSelect').value)">Cập nhật trạng thái</button></div>
  </div></div>`);
}
/* Hủy đơn -> cộng lại tồn kho; mở lại đơn đã hủy -> trừ tồn kho (không đủ hàng thì từ chối) */
function changeOrderStatus(id, status) {
  const orders = getData("orders"), order = orders.find(o => o.orderId === id); if (!order) return;
  const wasCancelled = order.orderStatus === "cancelled", willCancel = status === "cancelled";
  if (wasCancelled !== willCancel) {
    const products = getData("products"), items = order.items || [];
    if (wasCancelled) {
      const lacking = items.find(it => { const p = products.find(x => x.productId === it.productId); return !p || Number(p.stockQuantity || 0) < Number(it.quantity || 0); });
      if (lacking) return alert("Không đủ tồn kho để mở lại đơn hàng này");
    } else if (!confirm("Hủy đơn hàng này? Tồn kho sẽ được cộng lại.")) return;
    items.forEach(it => {
      const p = products.find(x => x.productId === it.productId); if (!p) return;
      const qty = Number(it.quantity || 0), stock = Number(p.stockQuantity || 0);
      p.stockQuantity = willCancel ? stock + qty : stock - qty;
    });
    setData("products", products);
  }
  order.orderStatus = status; setData("orders", orders);
  closeModal(); renderOrders();
}

/* ==========================================================
   9. NHẬP HÀNG
   ========================================================== */
PAGES.import = () => {
  $('#app').innerHTML = heading('Nhập hàng', 'Quản lý phiếu nhập sách', '<button class="btn" onclick="openImportForm()">+ Tạo phiếu nhập</button>') + `
  <section class="panel"><div class="table-wrap"><table class="data-table">
    <thead><tr><th>Mã phiếu</th><th>Ngày nhập</th><th>Số mặt hàng</th><th>Tổng tiền</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
    <tbody id="importList"></tbody></table></div></section>`;
  renderImports();
};
function renderImports() {
  const data = getData("imports");
  $('#importList').innerHTML = data.map(i => `
    <tr><td>${esc(i.importId)}</td><td>${esc(i.importDate)}</td><td>${i.items?.length || 0}</td><td>${money(i.totalAmount)}</td>
    <td>${badge('completed', 'Hoàn tất')}</td>
    <td><button class="btn btn-small btn-danger" onclick="deleteImport('${i.importId}')">Xóa</button></td></tr>`).join('')
    || '<tr><td colspan="6" class="empty">Chưa có phiếu nhập</td></tr>';
}
function openImportForm() {
  openModal(mh('Tạo phiếu nhập', 'closeImportForm()') + `
  <form onsubmit="saveImport(event)">
    <div class="form-group"><label>Ngày nhập</label><input type="date" id="importDate" required value="${new Date().toISOString().split('T')[0]}"></div>
    <div class="form-group"><label>Sản phẩm</label><select id="importProduct" required>${getData("products").map(p => `<option value="${p.productId}">${esc(p.productName)}</option>`).join('')}</select></div>
    <div class="form-group"><label>Số lượng</label><input type="number" id="importQuantity" min="1" required value="1"></div>
    <div class="form-group"><label>Giá nhập</label><input type="number" id="importPrice" min="1" required value="0"></div>
    <div class="form-actions"><button type="button" class="btn" onclick="closeImportForm()">Hủy</button><button type="submit" class="btn btn-primary">Lưu phiếu</button></div>
  </form>`);
}
const closeImportForm = () => closeModal();
function saveImport(e) {
  e.preventDefault();
  const products = getData("products"), imports = getData("imports");
  const product = products.find(p => p.productId === $('#importProduct').value);
  const quantity = Number($('#importQuantity').value), price = Number($('#importPrice').value);
  if (!product || quantity <= 0 || price <= 0) return alert("Dữ liệu phiếu nhập không hợp lệ");
  // Nhập hàng: tăng tồn kho, cập nhật giá nhập và tính lại giá bán
  product.stockQuantity = Number(product.stockQuantity || 0) + quantity;
  product.importPrice = price;
  product.salePrice = Math.round(price * (1 + Number(product.profitRate || 30) / 100));
  const item = {productId: product.productId, quantity, importPrice: price, subtotal: quantity * price};
  imports.push({importId: generateId("PN", imports, "importId"), importDate: $('#importDate').value, items: [item], totalAmount: item.subtotal, status: "completed"});
  setData("products", products); setData("imports", imports);
  closeImportForm(); renderImports();
}
function deleteImport(id) {
  if (!confirm("Xóa phiếu nhập này? Tồn kho sẽ bị trừ lại tương ứng.")) return;
  const imports = getData("imports"), imp = imports.find(i => i.importId === id);
  if (imp) {
    const products = getData("products");
    (imp.items || []).forEach(it => {
      const p = products.find(x => x.productId === it.productId);
      if (p) p.stockQuantity = Math.max(0, Number(p.stockQuantity || 0) - Number(it.quantity || 0));
    });
    setData("products", products);
  }
  setData("imports", imports.filter(i => i.importId !== id)); renderImports();
}

/* ==========================================================
   10. TỒN KHO
   ========================================================== */
PAGES.inventory = () => {
  $('#app').innerHTML = heading('Tồn kho', 'Theo dõi số lượng sách trong kho') + `
  <section class="panel">
    <div class="toolbar">
      <input id="inventorySearch" class="search-input" type="text" placeholder="Tìm sản phẩm...">
      <select id="inventoryFilter"><option value="all">Tất cả</option><option value="available">Còn hàng</option><option value="low">Sắp hết</option><option value="out">Hết hàng</option></select>
    </div>
    <div class="table-wrap"><table class="data-table">
      <thead><tr><th>Mã SP</th><th>Sản phẩm</th><th>Danh mục</th><th>Số lượng</th><th>Giá nhập</th><th>Giá trị tồn</th><th>Trạng thái</th></tr></thead>
      <tbody id="inventoryList"></tbody></table></div>
  </section>`;
  $('#inventorySearch').oninput = renderInventory; $('#inventoryFilter').onchange = renderInventory; renderInventory();
};
function renderInventory() {
  const cats = getData("categories"), filter = $('#inventoryFilter').value, key = norm($('#inventorySearch').value);
  let result = getData("products").filter(p => norm(p.productId).includes(key) || norm(p.productName).includes(key));
  const n = p => Number(p.stockQuantity || 0);
  if (filter === "low") result = result.filter(p => n(p) > 0 && n(p) <= 5);
  if (filter === "out") result = result.filter(p => n(p) === 0);
  if (filter === "available") result = result.filter(p => n(p) > 0);
  $('#inventoryList').innerHTML = result.map(p => {
    const s = n(p);
    return `<tr><td>${esc(p.productId)}</td><td>${esc(p.productName)}</td><td>${esc(cats.find(c => c.categoryId === p.categoryId)?.categoryName)}</td>
    <td>${s}</td><td>${money(p.importPrice)}</td><td>${money(s * Number(p.importPrice || 0))}</td>
    <td>${badge(s === 0 ? 'cancelled' : s <= 5 ? 'pending' : 'active', s === 0 ? 'Hết hàng' : s <= 5 ? 'Sắp hết' : 'Còn hàng')}</td></tr>`;
  }).join('') || '<tr><td colspan="7" class="empty">Không có dữ liệu tồn kho</td></tr>';
}

/* ==========================================================
   11. GIÁ BÁN
   ========================================================== */
PAGES.prices = () => {
  $('#app').innerHTML = heading('Giá bán', 'Quản lý giá bán của sản phẩm') + `
  <section class="panel">
    <div class="toolbar"><input id="priceSearch" class="search-input" type="text" placeholder="Tìm sản phẩm..."></div>
    <div class="table-wrap"><table class="data-table">
      <thead><tr><th>Mã SP</th><th>Sản phẩm</th><th>Giá nhập</th><th>Lợi nhuận</th><th>Giá bán</th><th>Thao tác</th></tr></thead>
      <tbody id="priceList"></tbody></table></div>
  </section>`;
  $('#priceSearch').oninput = renderPrices; renderPrices();
};
function renderPrices() {
  const key = norm($('#priceSearch').value);
  $('#priceList').innerHTML = getData("products").filter(p => norm(p.productId).includes(key) || norm(p.productName).includes(key)).map(p => `
    <tr><td>${esc(p.productId)}</td><td>${esc(p.productName)}</td><td>${money(p.importPrice)}</td><td>${p.profitRate || 0}%</td><td>${money(p.salePrice)}</td>
    <td><button class="btn btn-small" onclick="openPriceForm('${p.productId}')">Sửa</button></td></tr>`).join('')
    || '<tr><td colspan="6" class="empty">Không có sản phẩm</td></tr>';
}
function openPriceForm(id) {
  const p = getData("products").find(x => x.productId === id); if (!p) return;
  openModal(mh('Cập nhật giá bán', 'closePriceForm()') + `
  <form onsubmit="savePrice(event)"><input type="hidden" id="priceProductId" value="${esc(p.productId)}">
    <div class="form-group"><label>Sản phẩm</label><input id="priceProductName" readonly value="${esc(p.productName)}"></div>
    <div class="form-group"><label>Giá nhập</label><input type="number" id="priceImport" min="0" required value="${p.importPrice}"></div>
    <div class="form-group"><label>Tỷ lệ lợi nhuận (%)</label><input type="number" id="priceProfit" min="0" required value="${p.profitRate || 30}"></div>
    <div class="total-box">Giá bán: <span id="calculatedPrice">0 VNĐ</span></div>
    <div class="form-actions"><button type="button" class="btn" onclick="closePriceForm()">Hủy</button><button type="submit" class="btn btn-primary">Lưu</button></div>
  </form>`);
  $('#priceImport').oninput = calculatePrice; $('#priceProfit').oninput = calculatePrice; calculatePrice();
}
const closePriceForm = () => closeModal();
function calculatePrice() {
  const out = $('#calculatedPrice'); if (!out) return;
  out.textContent = money(Math.round(Number($('#priceImport').value || 0) * (1 + Number($('#priceProfit').value || 0) / 100)));
}
function savePrice(e) {
  e.preventDefault();
  const products = getData("products"), p = products.find(x => x.productId === $('#priceProductId').value); if (!p) return;
  const importPrice = Number($('#priceImport').value), profitRate = Number($('#priceProfit').value);
  if (importPrice < 0 || profitRate < 0) return alert("Giá nhập và tỷ lệ lợi nhuận không được âm");
  p.importPrice = importPrice; p.profitRate = profitRate; p.salePrice = Math.round(importPrice * (1 + profitRate / 100));
  setData("products", products); closePriceForm(); renderPrices();
}

checkAuth();
