function setDeleteCoupon(couponId, search = '', status = '', page = '') {
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    confirmDeleteBtn.href = `/admin/coupon/delete?id=${couponId}&search=${search}&status=${status}&page=${page}`;
}