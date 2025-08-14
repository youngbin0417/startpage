
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin menu script loaded.');
    const contentArea = document.querySelector('.mailbox-content');
    const modal = document.getElementById('detail-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const toggleStatusBtn = document.getElementById('toggle-status-btn');
    let currentConsultingId = null;
    let lastLoadedUrl = ''; // To refresh the list

    /* ──────────────── Modal Helpers ──────────────── */
    function openDetailModal(consultingId) {
        currentConsultingId = consultingId;
        fetch(`/admin/consultings/${consultingId}`)
            .then(res => {
                if (!res.ok) throw new Error('상세 정보를 불러오는데 실패했습니다.');
                return res.json();
            })
            .then(data => {
                document.getElementById('modal-nm').textContent = data.nm || '이름 없음';
                document.getElementById('modal-purp').textContent = data.purp || '목적 없음';
                document.getElementById('modal-tel').textContent = `전화번호: ${data.tel || '없음'}`;
                document.getElementById('modal-email').textContent = `이메일: ${data.email || '없음'}`;
                document.getElementById('modal-content').textContent = data.content || '내용 없음';
                modal.style.display = 'flex';
            })
            .catch(err => {
                console.error('상세 정보 로드 오류:', err);
                alert(err.message);
            });
    }

    function closeDetailModal() {
        modal.style.display = 'none';
        currentConsultingId = null;
    }

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeDetailModal);
    }
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeDetailModal();
        }
    });

    if (toggleStatusBtn) {
        toggleStatusBtn.addEventListener('click', () => {
            if (!currentConsultingId) return;

            if (!confirm('의뢰 상태를 변경하시겠습니까?')) {
                return;
            }

            fetch(`/admin/consultings/${currentConsultingId}/toggle`, {
                method: 'POST',
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert('상태가 성공적으로 변경되었습니다.');
                    closeDetailModal();
                    if(lastLoadedUrl) loadContent(lastLoadedUrl); // Refresh the list
                } else {
                    alert('상태 변경에 실패했습니다: ' + data.message);
                }
            })
            .catch(err => {
                console.error('상태 변경 오류:', err);
                alert('상태 변경 중 오류가 발생했습니다.');
            });
        });
    }


    /* ──────────────── Core Functions ──────────────── */
    function clearAllActive() {
        document.querySelectorAll('.mailbox-title.mailbox-selectable, .mailbox-item').forEach(function(i) {
            i.classList.remove('active');
        });
    }

    function setActive(element) {
        clearAllActive();
        element.classList.add('active');
    }

    function loadContent(url) {
        lastLoadedUrl = url; // Store the last loaded URL
        console.log('Fetching content from:', url);
        fetch(url)
            .then(response => {
                console.log('Received response:', response);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                if (url.includes('/weight') || url.includes('/home')) {
                    return response.text();
                }
                return response.json();
            })
            .then(data => {
                console.log('Received data:', data);
                contentArea.innerHTML = '';

                if (typeof data === 'string') {
                    contentArea.innerHTML = data;
                    if (url.includes('/weight')) {
                        if (typeof loadSiList === 'function') loadSiList();
                        if (typeof bindWeightSelectEvents === 'function') bindWeightSelectEvents();
                    }
                    return;
                }

                if (Array.isArray(data) && data.length > 0) {
                    const table = document.createElement('table');
                    table.className = 'table table-hover';
                    table.style.width = '100%';

                    const thead = document.createElement('thead');
                    thead.innerHTML = `
                        <tr>
                            <th class="date-col">날짜</th>
                            <th class="name-col">이름</th>
                            <th class="phone-col">연락처</th>
                            <th class="content-col">내용</th>
                        </tr>
                    `;
                    table.appendChild(thead);

                    const tbody = document.createElement('tbody');
                    data.forEach(item => {
                        const row = document.createElement('tr');
                        row.className = 'consulting-item';
                        row.dataset.id = item.id;
                        row.style.cursor = 'pointer';

                        const formattedDate = (item.createdAt || '').substring(0, 10);
                        const truncatedContent = (item.content || '').substring(0, 50) + ((item.content || '').length > 50 ? '...' : '');

                        row.innerHTML = `
                            <td>${formattedDate}</td>
                            <td>${item.nm || ''}</td>
                            <td>${item.tel || ''}</td>
                            <td>${truncatedContent}</td>
                        `;
                        tbody.appendChild(row);
                    });
                    table.appendChild(tbody);
                    contentArea.appendChild(table);
                } else {
                    contentArea.innerHTML = '<div class="mailbox-empty">데이터가 없습니다.</div>';
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                contentArea.innerHTML = '<div class="mailbox-empty">데이터를 불러오는 중 오류가 발생했습니다.</div>';
            });
    }

    /* ──────────────── Event Listeners ──────────────── */
    document.querySelectorAll('.mailbox-title.mailbox-selectable, .mailbox-item').forEach(function(item) {
        item.addEventListener('click', function() {
            console.log('Clicked item:', this.innerText.trim());
            setActive(this);
            const url = this.dataset.url;
            if (url) {
                loadContent(url);
            } else {
                console.error('No data-url found for this item.');
            }
        });
    });

    contentArea.addEventListener('click', (event) => {
        const target = event.target.closest('.consulting-item');
        if (target && target.dataset.id) {
            openDetailModal(target.dataset.id);
        }
    });
});
