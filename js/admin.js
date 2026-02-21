(function () {
    var page = 1;
    var limit = 20;
    var sortBy = 'updated_at';
    var order = 'desc';
    var search = '';
    var total = 0;

    function loadSubmissions() {
        var params = new URLSearchParams({ page: page, limit: limit, sort: sortBy, order: order });
        if (search) params.set('search', search);
        fetch('/api/admin/submissions?' + params, { credentials: 'same-origin' })
            .then(function (res) {
                if (res.status === 401) throw new Error('Требуется авторизация');
                return res.json();
            })
            .then(function (data) {
                total = data.total;
                renderTable(data.items);
                renderPagination();
            })
            .catch(function (err) {
                alert('Ошибка загрузки: ' + (err.message || 'Неизвестная ошибка'));
            });
    }

    function formatDateTime(iso) {
        if (!iso) return '';
        var d = new Date(iso);
        return d.toLocaleString('ru-RU');
    }

    function renderTable(items) {
        var tbody = document.getElementById('table-body');
        tbody.innerHTML = '';
        if (!items || items.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">Нет данных</td></tr>';
            return;
        }
        items.forEach(function (row) {
            var tr = document.createElement('tr');
            tr.innerHTML =
                '<td>' + escapeHtml(row.user_id) + '</td>' +
                '<td>' + escapeHtml((row.guests || []).join(', ')) + '</td>' +
                '<td>' + (row.transport ? 'Да' : 'Нет') + '</td>' +
                '<td>' + formatDateTime(row.created_at) + '</td>' +
                '<td>' + formatDateTime(row.updated_at) + '</td>';
            tbody.appendChild(tr);
        });
    }

    function escapeHtml(s) {
        if (!s) return '';
        var div = document.createElement('div');
        div.textContent = s;
        return div.innerHTML;
    }

    function renderPagination() {
        var pag = document.getElementById('pagination');
        var totalPages = Math.ceil(total / limit) || 1;
        pag.innerHTML =
            '<button id="prev-page"' + (page <= 1 ? ' disabled' : '') + '>Назад</button>' +
            '<span>Стр. ' + page + ' из ' + totalPages + ' (всего ' + total + ')</span>' +
            '<button id="next-page"' + (page >= totalPages ? ' disabled' : '') + '>Вперёд</button>';
        pag.querySelector('#prev-page').onclick = function () { page--; loadSubmissions(); };
        pag.querySelector('#next-page').onclick = function () { page++; loadSubmissions(); };
    }

    document.querySelectorAll('.admin-table th[data-sort]').forEach(function (th) {
        th.addEventListener('click', function () {
            var col = th.getAttribute('data-sort');
            if (sortBy === col) order = order === 'asc' ? 'desc' : 'asc';
            else { sortBy = col; order = 'desc'; }
            page = 1;
            loadSubmissions();
        });
    });

    var searchInput = document.getElementById('search-input');
    var debounce;
    searchInput.addEventListener('input', function () {
        clearTimeout(debounce);
        debounce = setTimeout(function () {
            search = searchInput.value.trim();
            page = 1;
            loadSubmissions();
        }, 300);
    });

    function downloadExport(format) {
        var q = '?format=' + format + '&limit=10000';
        if (search) q += '&search=' + encodeURIComponent(search);
        fetch('/api/admin/submissions/export' + q, { credentials: 'same-origin' })
            .then(function (res) {
                if (res.status === 401) throw new Error('Требуется авторизация');
                return res.blob();
            })
            .then(function (blob) {
                var a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'submissions.' + (format === 'csv' ? 'csv' : 'xlsx');
                a.click();
                URL.revokeObjectURL(a.href);
            })
            .catch(function (err) {
                alert('Ошибка экспорта: ' + (err.message || 'Неизвестная ошибка'));
            });
    }

    document.getElementById('export-csv').onclick = function () { downloadExport('csv'); };
    document.getElementById('export-excel').onclick = function () { downloadExport('xlsx'); };

    loadSubmissions();
})();
